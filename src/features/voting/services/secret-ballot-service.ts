import { db } from "@/lib/db";
import { castBallotSchema, type OfficeSelection } from "@/lib/validations/ballot";
import { generateBallotReceiptHash, formatReceiptToken } from "@/lib/crypto/ballot-receipt";
import { checkIpVelocity, checkDeviceAccountLimit } from "../utils/rate-limiter";
import { verifyTurnstileToken } from "../utils/turnstile";

export interface CastSecretBallotParams {
  eventId: string;
  userId: string;
  selections: OfficeSelection[];
  clientIp?: string | undefined;
  deviceFingerprint?: string | undefined;
  turnstileToken?: string | undefined;
}

export interface SecretBallotSuccessData {
  success: true;
  receiptHash: string;
  receiptToken: string;
  eventId: string;
  votesCount: number;
  submittedAt: string;
}

export type SecretBallotErrorCode =
  | "NOT_AUTHENTICATED"
  | "EVENT_NOT_ACTIVE"
  | "BALLOT_ALREADY_SUBMITTED"
  | "INVALID_BALLOT_SELECTIONS"
  | "POSITION_SELECTION_LIMIT_VIOLATION"
  | "CONTESTANT_NOT_ELIGIBLE"
  | "RATE_LIMIT_EXCEEDED"
  | "DEVICE_ACCOUNT_LIMIT_EXCEEDED"
  | "BOT_DETECTION_FAILED"
  | "TRANSACTION_FAILED"
  | "INTERNAL_ERROR";

export interface SecretBallotErrorDto {
  code: SecretBallotErrorCode;
  message: string;
  details?: Record<string, unknown> | undefined;
}

export type CastSecretBallotResponse =
  | { success: true; data: SecretBallotSuccessData; error: null }
  | { success: false; data: null; error: SecretBallotErrorDto };

interface PrismaErrorWithCode extends Error {
  code?: string;
}

interface CandidateOfficePair {
  contestantId: string;
  positionId: string;
}

/**
 * Checks whether an authenticated voter has already participated in an election.
 */
export async function hasVoterParticipated(
  eventId: string,
  userId: string,
): Promise<boolean> {
  const participation = await db.voterParticipation.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  return participation !== null;
}

/**
 * Validates network and device anti-fraud guardrails.
 */
async function validateSecurityGuardrails(
  params: CastSecretBallotParams,
): Promise<SecretBallotErrorDto | null> {
  const { clientIp, deviceFingerprint, turnstileToken, eventId, userId } = params;

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
    const deviceCheck = checkDeviceAccountLimit(deviceFingerprint, eventId, userId);
    if (!deviceCheck.allowed) {
      return {
        code: "DEVICE_ACCOUNT_LIMIT_EXCEEDED",
        message: "Maximum voter account limit reached on this device for this competition.",
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

/**
 * Executes the two-step transactional secret-ballot decoupling engine:
 * 1. Checks and records voter participation in VoterParticipation.
 * 2. Generates an irreversible HMAC-SHA256 receipt hash.
 * 3. Anonymously stores candidate choices in BallotSelection (ZERO user IDs or tokens).
 * 4. Increments candidate vote tallies.
 * 5. All operations occur in a single atomic Prisma transaction.
 */
export async function castSecretBallot(
  params: CastSecretBallotParams,
): Promise<CastSecretBallotResponse> {
  const { eventId, userId, selections, clientIp, deviceFingerprint, turnstileToken } = params;

  if (!userId || userId.trim().length === 0) {
    return {
      success: false,
      data: null,
      error: {
        code: "NOT_AUTHENTICATED",
        message: "You must be signed in to submit an official ballot.",
      },
    };
  }

  const parseResult = castBallotSchema.safeParse({
    eventId,
    selections,
    deviceFingerprint,
    turnstileToken,
  });

  if (!parseResult.success) {
    return {
      success: false,
      data: null,
      error: {
        code: "INVALID_BALLOT_SELECTIONS",
        message:
          parseResult.error.issues[0]?.message ?? "Invalid ballot submission parameters.",
      },
    };
  }

  // Security guardrails
  const securityError = await validateSecurityGuardrails(params);
  if (securityError) {
    return { success: false, data: null, error: securityError };
  }

  // Load event, positions, and active contestants
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      positions: {
        where: { isVotingOpen: true },
      },
      contestants: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!event) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "The requested election could not be found.",
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

  // Pre-check participation to avoid unnecessary transaction start
  const alreadyParticipated = await hasVoterParticipated(eventId, userId);
  if (alreadyParticipated) {
    return {
      success: false,
      data: null,
      error: {
        code: "BALLOT_ALREADY_SUBMITTED",
        message: "You have already cast an official ballot for this election.",
      },
    };
  }

  // Validate positions and candidate selections
  const positionsMap = new Map(event.positions.map((p) => [p.id, p]));
  const contestantsMap = new Map(event.contestants.map((c) => [c.id, c]));
  const candidateOfficePairs: CandidateOfficePair[] = [];

  for (const selection of selections) {
    const { positionId, contestantIds } = selection;
    const uniqueIds = new Set(contestantIds);

    if (uniqueIds.size !== contestantIds.length) {
      return {
        success: false,
        data: null,
        error: {
          code: "INVALID_BALLOT_SELECTIONS",
          message: "Duplicate candidates selected within the same office.",
        },
      };
    }

    if (!positionId) {
      return {
        success: false,
        data: null,
        error: {
          code: "INVALID_BALLOT_SELECTIONS",
          message: "A valid position office must be specified for each selection.",
        },
      };
    }

    const position = positionsMap.get(positionId);
    if (!position || !position.isVotingOpen) {
      return {
        success: false,
        data: null,
        error: {
          code: "POSITION_SELECTION_LIMIT_VIOLATION",
          message: `Voting is closed or office does not exist for ID: ${positionId}`,
        },
      };
    }

    const count = contestantIds.length;
    if (count < position.minSelectionsPerVoter || count > position.maxSelectionsPerVoter) {
      return {
        success: false,
        data: null,
        error: {
          code: "POSITION_SELECTION_LIMIT_VIOLATION",
          message: `Selections for ${position.name} must be between ${position.minSelectionsPerVoter} and ${position.maxSelectionsPerVoter}.`,
        },
      };
    }

    for (const contestantId of contestantIds) {
      const candidate = contestantsMap.get(contestantId);
      if (!candidate || candidate.status !== "ACTIVE") {
        return {
          success: false,
          data: null,
          error: {
            code: "CONTESTANT_NOT_ELIGIBLE",
            message: "One or more selected candidates are not eligible.",
          },
        };
      }

      if (candidate.positionId && candidate.positionId !== positionId) {
        return {
          success: false,
          data: null,
          error: {
            code: "CONTESTANT_NOT_ELIGIBLE",
            message: "Candidate does not belong to the selected position office.",
          },
        };
      }

      candidateOfficePairs.push({
        positionId,
        contestantId,
      });
    }
  }

  // Generate cryptographic receipt hash
  const receiptTimestamp = new Date();
  const receipt = generateBallotReceiptHash({
    eventId,
    selections: candidateOfficePairs.map((p) => ({
      officeId: p.positionId,
      candidateId: p.contestantId,
    })),
    timestamp: receiptTimestamp,
  });

  const receiptToken = formatReceiptToken(receipt.receiptHash);

  // Execute atomic transactional decoupling
  try {
    return await db.$transaction(async (tx) => {
      // 1. Mark participation with userId (tracks THAT user voted)
      await tx.voterParticipation.create({
        data: {
          eventId,
          userId,
        },
      });

      // 2. Anonymously store choices in BallotSelection (ZERO userId linkage)
      await tx.ballotSelection.createMany({
        data: candidateOfficePairs.map((pair) => ({
          eventId,
          officeId: pair.positionId,
          candidateId: pair.contestantId,
          receiptHash: receipt.receiptHash,
        })),
      });

      // 3. Increment candidate tallies
      for (const pair of candidateOfficePairs) {
        await tx.contestant.update({
          where: { id: pair.contestantId },
          data: {
            voteCount: { increment: 1 },
          },
        });
      }

      return {
        success: true,
        data: {
          success: true,
          receiptHash: receipt.receiptHash,
          receiptToken,
          eventId,
          votesCount: candidateOfficePairs.length,
          submittedAt: receiptTimestamp.toISOString(),
        },
        error: null,
      };
    });
  } catch (error) {
    const prismaError = error as PrismaErrorWithCode;
    if (prismaError?.code === "P2002") {
      return {
        success: false,
        data: null,
        error: {
          code: "BALLOT_ALREADY_SUBMITTED",
          message: "You have already cast an official ballot for this election.",
        },
      };
    }

    const message =
      error instanceof Error ? error.message : "An unexpected transaction error occurred.";

    return {
      success: false,
      data: null,
      error: {
        code: "TRANSACTION_FAILED",
        message,
      },
    };
  }
}
