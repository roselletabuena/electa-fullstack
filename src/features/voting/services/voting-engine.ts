import { db } from "@/lib/db";
import { castBallotSchema } from "@/lib/validations/ballot";
import { checkIpVelocity, checkDeviceAccountLimit } from "../utils/rate-limiter";
import { verifyTurnstileToken } from "../utils/turnstile";
import type { EventArchetype } from "@/generated/client/enums";
import type {
  CastBallotInput,
  CastBallotResponse,
  CastBallotResultDto,
  CastBallotErrorDto,
  BallotVoteSummaryDto,
  OfficeSelection,
} from "../types/ballot";

export interface CastInstitutionalBallotParams extends CastBallotInput {
  voterId: string;
  clientIp?: string;
}

interface EventZeroCostEligibility {
  isFreeVotingOnly?: boolean | null;
  archetype?: EventArchetype | string | null;
}

interface SecurityCheckParams {
  clientIp?: string;
  deviceFingerprint?: string;
  turnstileToken?: string;
  eventId: string;
  voterId: string;
}

interface EventScheduleData {
  publicationStatus: string;
  startsAt: Date;
  endsAt: Date;
}

interface CandidatePositionPair {
  contestantId: string;
  positionId: string | null;
}

interface PositionSelectionValidationResult {
  error: CastBallotErrorDto | null;
  pairs: CandidatePositionPair[];
  candidateIds: string[];
}

interface PrismaErrorWithCode extends Error {
  code?: string;
}

/**
 * Determines whether an election operates under the zero-cost institutional policy.
 */
export function isZeroCostElection(event: EventZeroCostEligibility): boolean {
  if (event.isFreeVotingOnly === true) {
    return true;
  }
  return event.archetype === "STUDENT_COUNCIL" || event.archetype === "HACKATHON";
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

async function validateVoterSecurity(
  params: SecurityCheckParams,
): Promise<CastBallotErrorDto | null> {
  const { clientIp, deviceFingerprint, turnstileToken, eventId, voterId } = params;

  if (clientIp) {
    const ipCheck = checkIpVelocity(clientIp);
    if (!ipCheck.allowed) {
      return {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests from this IP. Please slow down.",
      };
    }
  }

  if (deviceFingerprint) {
    const deviceCheck = checkDeviceAccountLimit(deviceFingerprint, eventId, voterId);
    if (!deviceCheck.allowed) {
      return {
        code: "DEVICE_ACCOUNT_LIMIT_EXCEEDED",
        message:
          "Maximum voter account limit reached on this device for this competition.",
      };
    }
  }

  if (turnstileToken && clientIp) {
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return {
        code: "BOT_DETECTION_FAILED",
        message: "Security verification failed. Please refresh and try again.",
      };
    }
  }

  return null;
}

function validateEventOperationalStatus(
  event: EventScheduleData | null,
): CastBallotErrorDto | null {
  if (!event) {
    return {
      code: "EVENT_NOT_ACTIVE",
      message: "The requested event could not be found.",
    };
  }

  const now = new Date();
  const isEventActive =
    event.publicationStatus === "PUBLISHED" &&
    now >= new Date(event.startsAt) &&
    now <= new Date(event.endsAt);

  if (!isEventActive) {
    return {
      code: "EVENT_NOT_ACTIVE",
      message: "Voting is currently closed for this election.",
    };
  }

  return null;
}

function validateOfficeSelections(
  selections: OfficeSelection[],
  positionsMap: Map<
    string,
    {
      id: string;
      name: string;
      isVotingOpen: boolean;
      minSelectionsPerVoter: number;
      maxSelectionsPerVoter: number;
    }
  >,
): PositionSelectionValidationResult {
  const pairs: CandidatePositionPair[] = [];
  const candidateIdsSet = new Set<string>();

  for (const selection of selections) {
    const { positionId, contestantIds } = selection;

    const uniqueContestantIds = new Set(contestantIds);
    if (uniqueContestantIds.size !== contestantIds.length) {
      return {
        error: {
          code: "INVALID_BALLOT_SELECTIONS",
          message: "Duplicate candidates selected within the same office.",
        },
        pairs: [],
        candidateIds: [],
      };
    }

    if (positionId) {
      const position = positionsMap.get(positionId);
      if (!position || !position.isVotingOpen) {
        return {
          error: {
            code: "POSITION_SELECTION_LIMIT_VIOLATION",
            message: `Voting is closed or position does not exist for office: ${positionId}`,
          },
          pairs: [],
          candidateIds: [],
        };
      }

      const count = contestantIds.length;
      if (count < position.minSelectionsPerVoter || count > position.maxSelectionsPerVoter) {
        return {
          error: {
            code: "POSITION_SELECTION_LIMIT_VIOLATION",
            message: `Selections for ${position.name} must be between ${position.minSelectionsPerVoter} and ${position.maxSelectionsPerVoter}.`,
            details: {
              positionId,
              min: position.minSelectionsPerVoter,
              max: position.maxSelectionsPerVoter,
              selectedCount: count,
            },
          },
          pairs: [],
          candidateIds: [],
        };
      }
    }

    for (const contestantId of contestantIds) {
      candidateIdsSet.add(contestantId);
      pairs.push({ contestantId, positionId: positionId ?? null });
    }
  }

  return {
    error: null,
    pairs,
    candidateIds: Array.from(candidateIdsSet),
  };
}

function validateCandidateEligibility(
  pairs: CandidatePositionPair[],
  contestants: Array<{ id: string; status: string; positionId: string | null }>,
): CastBallotErrorDto | null {
  const contestantsMap = new Map(contestants.map((c) => [c.id, c]));

  for (const pair of pairs) {
    const candidate = contestantsMap.get(pair.contestantId);
    if (!candidate || candidate.status !== "ACTIVE") {
      return {
        code: "CONTESTANT_NOT_ELIGIBLE",
        message: "One or more selected candidates are not eligible for this election.",
      };
    }

    if (pair.positionId && candidate.positionId && candidate.positionId !== pair.positionId) {
      return {
        code: "CONTESTANT_NOT_ELIGIBLE",
        message: "Candidate does not belong to the selected position office.",
      };
    }
  }

  return null;
}

async function executeBallotTransaction(
  eventId: string,
  voterId: string,
  pairs: CandidatePositionPair[],
): Promise<CastBallotResultDto> {
  return await db.$transaction(async (tx) => {
    const ballot = await tx.ballotSubmission.create({
      data: {
        eventId,
        voterId,
      },
    });

    const votesSummary: BallotVoteSummaryDto[] = [];

    for (const pair of pairs) {
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

    return {
      success: true,
      ballotId: ballot.id,
      eventId,
      voterId,
      votesCount: votesSummary.length,
      votes: votesSummary,
      submittedAt: new Date().toISOString(),
    };
  });
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
  const securityError = await validateVoterSecurity({
    clientIp,
    deviceFingerprint,
    turnstileToken,
    eventId,
    voterId,
  });
  if (securityError) {
    return { success: false, data: null, error: securityError };
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

  const operationalError = validateEventOperationalStatus(event);
  if (operationalError) {
    return { success: false, data: null, error: operationalError };
  }

  // Pre-flight duplicate ballot check
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

  // Validate Position Selections
  const positions = await db.eventPosition.findMany({ where: { eventId } });
  const positionsMap = new Map(positions.map((p) => [p.id, p]));

  const selectionResult = validateOfficeSelections(selections, positionsMap);
  if (selectionResult.error) {
    return { success: false, data: null, error: selectionResult.error };
  }

  // Verify candidate eligibility
  const contestants = await db.contestant.findMany({
    where: {
      id: { in: selectionResult.candidateIds },
      eventId,
    },
    select: {
      id: true,
      status: true,
      positionId: true,
    },
  });

  const candidateError = validateCandidateEligibility(selectionResult.pairs, contestants);
  if (candidateError) {
    return { success: false, data: null, error: candidateError };
  }

  // Atomic Database Transaction
  try {
    const result = await executeBallotTransaction(eventId, voterId, selectionResult.pairs);
    return { success: true, data: result, error: null };
  } catch (error) {
    const prismaError = error as PrismaErrorWithCode;
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
