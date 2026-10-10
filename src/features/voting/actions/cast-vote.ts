"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { CastVoteInputSchema } from "../types";
import { calculateVoterQuota } from "../utils/quota-calculator";
import { verifyTurnstileToken } from "../utils/turnstile";
import { checkIpVelocity, checkDeviceAccountLimit } from "../utils/rate-limiter";
import type { CastVoteResultDto, VotingErrorDto } from "../types";

export type CastVoteResponse =
  | { success: true; data: CastVoteResultDto; error: null }
  | { success: false; data: null; error: VotingErrorDto };

class QuotaExhaustedError extends Error {
  public readonly quotaState: ReturnType<typeof calculateVoterQuota>;
  constructor(quotaState: ReturnType<typeof calculateVoterQuota>) {
    super("Daily free vote quota exhausted");
    this.name = "QuotaExhaustedError";
    this.quotaState = quotaState;
  }
}

async function checkIdempotentVote(idempotencyKey?: string): Promise<CastVoteResultDto | null> {
  if (!idempotencyKey) return null;

  const existingVote = await db.vote.findUnique({
    where: { id: idempotencyKey },
  });

  if (!existingVote) return null;

  const contestant = await db.contestant.findUnique({
    where: { id: existingVote.contestantId },
    select: { voteCount: true },
  });

  return {
    success: true,
    voteId: existingVote.id,
    contestantId: existingVote.contestantId,
    newContestantVoteCount: contestant?.voteCount ?? 0,
    voteType: existingVote.voteType,
    voteWeight: existingVote.voteWeight,
  };
}

async function checkVoteSecurity(
  voteType: string,
  turnstileToken: string | undefined,
  deviceFingerprint: string | undefined,
  eventId: string,
  userId: string,
  clientIp: string,
): Promise<VotingErrorDto | null> {
  if (voteType !== "FREE") return null;

  const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!turnstileCheck.success) {
    return {
      code: "BOT_DETECTION_FAILED",
      message: "Security bot verification failed. Please refresh and try again.",
    };
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

  return null;
}

function checkEventEligibility(
  event: {
    publicationStatus: string;
    startsAt: Date;
    endsAt: Date;
    isFreeVotingEnabled: boolean;
  } | null,
  voteType: string,
  now: Date,
): VotingErrorDto | null {
  if (!event) {
    return {
      code: "EVENT_NOT_ACTIVE",
      message: "The requested event could not be found.",
    };
  }

  const isEventActive =
    event.publicationStatus === "PUBLISHED" &&
    now >= new Date(event.startsAt) &&
    now <= new Date(event.endsAt);

  if (!isEventActive) {
    return {
      code: "EVENT_NOT_ACTIVE",
      message: "Voting is currently closed for this event.",
    };
  }

  if (voteType === "FREE" && !event.isFreeVotingEnabled) {
    return {
      code: "FREE_VOTING_DISABLED",
      message: "Free daily voting is currently disabled for this competition phase.",
    };
  }

  return null;
}

export async function castVoteAction(rawInput: unknown): Promise<CastVoteResponse> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "You must be signed in to cast your votes.",
        },
      };
    }

    const reqHeaders = await headers();
    const clientIp =
      reqHeaders.get("cf-connecting-ip") ||
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    // 1. IP Velocity Rate Limiting
    const velocityCheck = checkIpVelocity(clientIp);
    if (!velocityCheck.allowed) {
      return {
        success: false,
        data: null,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message:
            "Too many voting requests from this network. Please wait a moment and try again.",
        },
      };
    }

    // 2. Schema Input Validation
    const parseResult = CastVoteInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: parseResult.error.issues[0]?.message || "Invalid vote submission parameters.",
        },
      };
    }

    const {
      eventId,
      contestantId,
      awardCategoryId,
      voteType,
      voteWeight,
      turnstileToken,
      deviceFingerprint,
      idempotencyKey,
    } = parseResult.data;

    // Check for existing vote with idempotency key
    const existingVoteResult = await checkIdempotentVote(idempotencyKey);
    if (existingVoteResult) {
      return {
        success: true,
        data: existingVoteResult,
        error: null,
      };
    }

    // 3. Anti-Bot and Anti-Syndicate Checks for Free Votes
    const securityError = await checkVoteSecurity(
      voteType,
      turnstileToken,
      deviceFingerprint,
      eventId,
      session.userId,
      clientIp,
    );
    if (securityError) {
      return {
        success: false,
        data: null,
        error: securityError,
      };
    }

    const now = new Date();

    // 4. Validate Event State
    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        publicationStatus: true,
        startsAt: true,
        endsAt: true,
        isFreeVotingEnabled: true,
        dailyFreeVoteLimit: true,
      },
    });

    const eventError = checkEventEligibility(event, voteType, now);
    if (eventError || !event) {
      return {
        success: false,
        data: null,
        error: eventError ?? {
          code: "EVENT_NOT_ACTIVE",
          message: "The requested event could not be found.",
        },
      };
    }

    // 5. Validate Contestant
    const contestant = await db.contestant.findFirst({
      where: {
        id: contestantId,
        eventId: event.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        voteCount: true,
      },
    });

    if (!contestant) {
      return {
        success: false,
        data: null,
        error: {
          code: "CONTESTANT_NOT_FOUND",
          message: "The candidate is not eligible to receive votes.",
        },
      };
    }

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 6. High-concurrency Atomic Database Transaction
    const transactionResult = await db.$transaction(async (tx) => {
      let quotaState;

      if (voteType === "FREE") {
        const recentVotes = await tx.vote.findMany({
          where: {
            eventId: event.id,
            voterId: session.userId,
            voteType: "FREE",
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        if (recentVotes.length >= event.dailyFreeVoteLimit) {
          const quota = calculateVoterQuota({
            dailyLimit: event.dailyFreeVoteLimit,
            isFreeVotingEnabled: event.isFreeVotingEnabled,
            isEventActive: true,
            recentFreeVoteTimestamps: recentVotes.map((v) => v.createdAt),
            now,
          });

          throw new QuotaExhaustedError(quota);
        }

        const updatedTimestamps = [...recentVotes.map((v) => v.createdAt), now];
        quotaState = calculateVoterQuota({
          dailyLimit: event.dailyFreeVoteLimit,
          isFreeVotingEnabled: event.isFreeVotingEnabled,
          isEventActive: true,
          recentFreeVoteTimestamps: updatedTimestamps,
          now,
        });
      }

      // Record Vote in Ledger
      const vote = await tx.vote.create({
        data: {
          ...(idempotencyKey ? { id: idempotencyKey } : {}),
          eventId: event.id,
          contestantId: contestant.id,
          voterId: session.userId,
          awardCategoryId: awardCategoryId ?? null,
          voteType: voteType === "BOOST" ? "BOOST" : "FREE",
          voteWeight: voteWeight,
          createdAt: now,
        },
      });

      // Increment Contestant voteCount atomically
      const updatedContestant = await tx.contestant.update({
        where: { id: contestant.id },
        data: {
          voteCount: {
            increment: voteWeight,
          },
        },
        select: {
          voteCount: true,
        },
      });

      return {
        voteId: vote.id,
        newContestantVoteCount: updatedContestant.voteCount,
        quotaState,
      };
    });

    return {
      success: true,
      data: {
        success: true,
        voteId: transactionResult.voteId,
        contestantId: contestant.id,
        newContestantVoteCount: transactionResult.newContestantVoteCount,
        voteType,
        voteWeight,
        quotaState: transactionResult.quotaState,
      },
      error: null,
    };
  } catch (err: unknown) {
    if (err instanceof QuotaExhaustedError) {
      return {
        success: false,
        data: null,
        error: {
          code: "DAILY_QUOTA_EXHAUSTED",
          message: "You have used all your free daily votes for this competition cycle.",
          details: {
            nextResetTime: err.quotaState.nextResetTime,
          },
        },
      };
    }

    console.error("[castVoteAction] Unexpected error:", err);
    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while recording your vote.",
      },
    };
  }
}
