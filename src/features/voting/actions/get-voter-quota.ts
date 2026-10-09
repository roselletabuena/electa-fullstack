"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { calculateVoterQuota } from "../utils/quota-calculator";
import type { VoterQuotaStateDto, VotingErrorDto } from "../types";

export type GetVoterQuotaResponse =
  | { success: true; data: VoterQuotaStateDto; error: null }
  | { success: false; data: null; error: VotingErrorDto };

export async function getVoterQuotaAction(eventId: string): Promise<GetVoterQuotaResponse> {
  try {
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
          message: "Event not found",
        },
      };
    }

    const now = new Date();
    const isEventActive =
      event.publicationStatus === "PUBLISHED" &&
      now >= new Date(event.startsAt) &&
      now <= new Date(event.endsAt);

    const session = await getSession();

    if (!session?.userId) {
      return {
        success: true,
        data: {
          dailyLimit: event.dailyFreeVoteLimit,
          votesUsedIn24h: 0,
          remainingVotes: event.dailyFreeVoteLimit,
          isFreeVotingEnabled: event.isFreeVotingEnabled,
          isEventActive,
          isInCooldown: false,
          nextResetTime: null,
        },
        error: null,
      };
    }

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentVotes = await db.vote.findMany({
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

    const quotaState = calculateVoterQuota({
      dailyLimit: event.dailyFreeVoteLimit,
      isFreeVotingEnabled: event.isFreeVotingEnabled,
      isEventActive,
      recentFreeVoteTimestamps: recentVotes.map((v) => v.createdAt),
      now,
    });

    return {
      success: true,
      data: quotaState,
      error: null,
    };
  } catch (err) {
    console.error("[getVoterQuotaAction] Unexpected error:", err);
    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve voter quota status",
      },
    };
  }
}
