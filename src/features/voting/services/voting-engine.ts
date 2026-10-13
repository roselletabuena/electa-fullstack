import { db } from "@/lib/db";
import { castBallotSchema } from "@/lib/validations/ballot";
import { checkIpVelocity, checkDeviceAccountLimit } from "../utils/rate-limiter";
import { verifyTurnstileToken } from "../utils/turnstile";
import type { EventArchetype } from "@/generated/client/enums";
import type {
  CastBallotInput,
  CastBallotResponse,
  CastBallotResultDto,
  BallotVoteSummaryDto,
} from "../types/ballot";

export interface CastInstitutionalBallotParams extends CastBallotInput {
  voterId: string;
  clientIp?: string;
}

interface EventZeroCostEligibility {
  isFreeVotingOnly?: boolean | null;
  archetype?: EventArchetype | string | null;
}

/**
 * Determines whether an election operates under the zero-cost institutional policy.
 */
export function isZeroCostElection(event: EventZeroCostEligibility): boolean {
  if (event.isFreeVotingOnly === true) {
    return true;
  }
  if (event.archetype === "STUDENT_COUNCIL" || event.archetype === "HACKATHON") {
    return true;
  }
  return false;
}

/**
 * Checks whether an authenticated voter has already cast an official ballot in the given event.
 */
export async function hasVoterSubmittedBallot(
  eventId: string,
  voterId: string,
): Promise<boolean> {
  const existingSubmission = await db.ballotSubmission.findUnique({
    where: {
      eventId_voterId: {
        eventId,
        voterId,
      },
    },
  });

  return existingSubmission !== null;
}

interface PrismaErrorWithCode extends Error {
  code?: string;
}

/**
 * Executes zero-cost institutional ballot submission with optimistic concurrency control.
 */
export async function castInstitutionalBallot(
  params: CastInstitutionalBallotParams,
): Promise<CastBallotResponse> {
  const { voterId, clientIp, ...rawInput } = params;

  if (!voterId || voterId.trim().length === 0) {
    return {
      success: false,
      data: null,
      error: {
        code: "NOT_AUTHENTICATED",
        message: "You must be signed in to submit an official ballot.",
      },
    };
  }

  const parseResult = castBallotSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      data: null,
      error: {
        code: "INVALID_BALLOT_SELECTIONS",
        message:
          parseResult.error.issues[0]?.message ||
          "Invalid ballot submission parameters.",
      },
    };
  }

  const { eventId, selections, turnstileToken, deviceFingerprint } = parseResult.data;

  // Rate Limiting & Bot Verification
  if (clientIp) {
    const ipCheck = checkIpVelocity(clientIp);
    if (!ipCheck.allowed) {
      return {
        success: false,
        data: null,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests from this IP. Please slow down.",
        },
      };
    }
  }

  if (deviceFingerprint) {
    const deviceCheck = checkDeviceAccountLimit(deviceFingerprint, eventId, voterId);
    if (!deviceCheck.allowed) {
      return {
        success: false,
        data: null,
        error: {
          code: "DEVICE_ACCOUNT_LIMIT_EXCEEDED",
          message:
            "Maximum voter account limit reached on this device for this competition.",
        },
      };
    }
  }

  if (turnstileToken && clientIp) {
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "BOT_DETECTION_FAILED",
          message:
            "Security verification failed. Please refresh and try again.",
        },
      };
    }
  }

  // Event Eligibility Check
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      publicationStatus: true,
      startsAt: true,
      endsAt: true,
      isFreeVotingOnly: true,
      archetype: true,
      isFreeVotingEnabled: true,
    },
  });

  if (!event) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "The requested event could not be found.",
      },
    };
  }

  const now = new Date();
  const isEventActive =
    event.publicationStatus === "PUBLISHED" &&
    now >= new Date(event.startsAt) &&
    now <= new Date(event.endsAt);

  if (!isEventActive) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "Voting is currently closed for this election.",
      },
    };
  }

  // Pre-flight check: duplicate ballot check
  const alreadySubmitted = await hasVoterSubmittedBallot(eventId, voterId);
  if (alreadySubmitted) {
    return {
      success: false,
      data: null,
      error: {
        code: "BALLOT_ALREADY_SUBMITTED",
        message: "Ballot already submitted for this election.",
      },
    };
  }

  // Fetch Event Positions for limit validation
  const positions = await db.eventPosition.findMany({
    where: { eventId },
  });
  const positionsMap = new Map(positions.map((p) => [p.id, p]));

  // Validate Position Selections & Bounds
  const candidatePositionPairs: Array<{ contestantId: string; positionId: string | null }> = [];
  const candidateIdsSet = new Set<string>();

  for (const selection of selections) {
    const { positionId, contestantIds } = selection;

    // Check for internal duplicates within a single office
    const uniqueContestantIds = new Set(contestantIds);
    if (uniqueContestantIds.size !== contestantIds.length) {
      return {
        success: false,
        data: null,
        error: {
          code: "INVALID_BALLOT_SELECTIONS",
          message: "Duplicate candidates selected within the same office.",
        },
      };
    }

    if (positionId) {
      const position = positionsMap.get(positionId);
      if (!position || !position.isVotingOpen) {
        return {
          success: false,
          data: null,
          error: {
            code: "POSITION_SELECTION_LIMIT_VIOLATION",
            message: `Voting is closed or position does not exist for office: ${positionId}`,
          },
        };
      }

      if (
        contestantIds.length < position.minSelectionsPerVoter ||
        contestantIds.length > position.maxSelectionsPerVoter
      ) {
        return {
          success: false,
          data: null,
          error: {
            code: "POSITION_SELECTION_LIMIT_VIOLATION",
            message: `Selections for ${position.name} must be between ${position.minSelectionsPerVoter} and ${position.maxSelectionsPerVoter}.`,
            details: {
              positionId,
              min: position.minSelectionsPerVoter,
              max: position.maxSelectionsPerVoter,
              selectedCount: contestantIds.length,
            },
          },
        };
      }
    }

    for (const contestantId of contestantIds) {
      candidateIdsSet.add(contestantId);
      candidatePositionPairs.push({ contestantId, positionId: positionId ?? null });
    }
  }

  // Verify all candidates are ACTIVE and belong to this event
  const contestants = await db.contestant.findMany({
    where: {
      id: { in: Array.from(candidateIdsSet) },
      eventId,
    },
    select: {
      id: true,
      status: true,
      positionId: true,
    },
  });

  const contestantsMap = new Map(contestants.map((c) => [c.id, c]));

  for (const pair of candidatePositionPairs) {
    const candidate = contestantsMap.get(pair.contestantId);
    if (!candidate || candidate.status !== "ACTIVE") {
      return {
        success: false,
        data: null,
        error: {
          code: "CONTESTANT_NOT_ELIGIBLE",
          message: "One or more selected candidates are not eligible for this election.",
        },
      };
    }

    if (pair.positionId && candidate.positionId && candidate.positionId !== pair.positionId) {
      return {
        success: false,
        data: null,
        error: {
          code: "CONTESTANT_NOT_ELIGIBLE",
          message: "Candidate does not belong to the selected position office.",
        },
      };
    }
  }

  // Atomic Database Transaction with P2002 unique constraint handling
  try {
    const result = await db.$transaction(async (tx) => {
      // Step 1: Create BallotSubmission (Row lock / Unique constraint @@unique([eventId, voterId]))
      const ballot = await tx.ballotSubmission.create({
        data: {
          eventId,
          voterId,
        },
      });

      const votesSummary: BallotVoteSummaryDto[] = [];

      // Step 2: Create Vote records and increment vote counts
      for (const pair of candidatePositionPairs) {
        const vote = await tx.vote.create({
          data: {
            eventId,
            voterId,
            contestantId: pair.contestantId,
            positionId: pair.positionId,
            voteType: "FREE",
            voteWeight: 1,
            ballotSubmissionId: ballot.id,
          },
          select: {
            id: true,
            contestantId: true,
            positionId: true,
          },
        });

        await tx.contestant.update({
          where: { id: pair.contestantId },
          data: {
            voteCount: { increment: 1 },
          },
        });

        votesSummary.push({
          voteId: vote.id,
          contestantId: vote.contestantId,
          positionId: vote.positionId,
        });
      }

      const receipt: CastBallotResultDto = {
        success: true,
        ballotId: ballot.id,
        eventId,
        voterId,
        votesCount: votesSummary.length,
        votes: votesSummary,
        submittedAt: new Date().toISOString(),
      };

      return receipt;
    });

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    const prismaError = error as PrismaErrorWithCode;
    // P2002 = Unique constraint failed
    if (prismaError.code === "P2002") {
      return {
        success: false,
        data: null,
        error: {
          code: "BALLOT_ALREADY_SUBMITTED",
          message: "Ballot already submitted for this election.",
        },
      };
    }

    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while submitting your ballot.",
      },
    };
  }
}
