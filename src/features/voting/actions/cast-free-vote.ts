"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { CastFreeVoteSchema } from "../types";
import { calculateVoterQuota } from "../utils/quota-calculator";
import type { CastFreeVoteResultDto, VotingErrorDto } from "../types";

export type CastFreeVoteResponse =
  | { success: true; data: CastFreeVoteResultDto; error: null }
  | { success: false; data: null; error: VotingErrorDto };

class QuotaExhaustedError extends Error {
  public readonly quotaState: ReturnType<typeof calculateVoterQuota>;
  constructor(quotaState: ReturnType<typeof calculateVoterQuota>) {
    super("Daily free vote quota exhausted");
    this.name = "QuotaExhaustedError";
    this.quotaState = quotaState;
  }
}

export async function castFreeVoteAction(rawInput: unknown): Promise<CastFreeVoteResponse> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "You must be signed in to cast your free daily votes.",
        },
      };
    }

    const parseResult = CastFreeVoteSchema.safeParse(rawInput);
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

    const { eventId, contestantId, awardCategoryId } = parseResult.data;
    const now = new Date();

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
          message: "Voting is currently closed for this event.",
        },
      };
    }

    if (!event.isFreeVotingEnabled) {
      return {
        success: false,
        data: null,
        error: {
          code: "FREE_VOTING_DISABLED",
          message: "Free daily voting is currently disabled for this competition phase.",
        },
      };
    }

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

    // Atomic transaction enforcing quota and recording vote
    const transactionResult = await db.$transaction(async (tx) => {
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

      // 1. Record atomic vote entry
      const vote = await tx.vote.create({
        data: {
          eventId: event.id,
          contestantId: contestant.id,
          voterId: session.userId,
          awardCategoryId: awardCategoryId ?? null,
          voteType: "FREE",
          voteWeight: 1,
          createdAt: now,
        },
      });

      // 2. Increment contestant vote tally
      const updatedContestant = await tx.contestant.update({
        where: { id: contestant.id },
        data: {
          voteCount: {
            increment: 1,
          },
        },
        select: {
          voteCount: true,
        },
      });

      const updatedTimestamps = [...recentVotes.map((v) => v.createdAt), now];
      const newQuotaState = calculateVoterQuota({
        dailyLimit: event.dailyFreeVoteLimit,
        isFreeVotingEnabled: event.isFreeVotingEnabled,
        isEventActive: true,
        recentFreeVoteTimestamps: updatedTimestamps,
        now,
      });

      return {
        voteId: vote.id,
        newContestantVoteCount: updatedContestant.voteCount,
        quotaState: newQuotaState,
      };
    });

    return {
      success: true,
      data: {
        success: true,
        voteId: transactionResult.voteId,
        contestantId: contestant.id,
        newContestantVoteCount: transactionResult.newContestantVoteCount,
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

    console.error("[castFreeVoteAction] Unexpected error:", err);
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
