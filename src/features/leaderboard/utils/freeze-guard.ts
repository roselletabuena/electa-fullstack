import type { LeaderboardEntry, LeaderboardPayload } from "../types";

export interface FreezeEvaluationContext {
  isLeaderboardFrozen?: boolean | null;
  freezeStartsAt?: Date | string | null;
  endsAt?: Date | string | null;
  showResultsOnClose?: boolean | null;
  now?: Date;
}

/**
 * Determines whether the event's mystery freeze is currently active based on manual
 * toggle or schedule window.
 */
export function isMysteryFreezeActive(context: FreezeEvaluationContext): boolean {
  const now = context.now ?? new Date();

  // If event has concluded and showResultsOnClose is true, freeze is lifted
  if (context.endsAt) {
    const endsDate = new Date(context.endsAt);
    if (now >= endsDate && (context.showResultsOnClose ?? true)) {
      return false;
    }
  }

  // Explicit manual organizer freeze override
  if (context.isLeaderboardFrozen === true) {
    return true;
  }

  // Scheduled freeze window
  if (context.freezeStartsAt) {
    const startsDate = new Date(context.freezeStartsAt);
    if (now >= startsDate) {
      if (context.endsAt) {
        const endsDate = new Date(context.endsAt);
        return now < endsDate;
      }
      return true;
    }
  }

  return false;
}

/**
 * Redacts vote tallies, rank positions, and metrics for public consumption
 * to guarantee zero data leakage during an active Mystery Freeze.
 */
export function redactLeaderboardForPublic(payload: LeaderboardPayload): LeaderboardPayload {
  const redactedEntries: LeaderboardEntry[] = payload.entries.map((entry) => ({
    ...entry,
    voteCount: null,
    rank: null,
    percentageShare: 0,
    gapToLeader: 0,
    gapToAhead: 0,
    isPodium: false,
  }));

  // Re-order by contestant number ascending during freeze so rank order is never leaked
  redactedEntries.sort((a, b) => a.contestantNumber - b.contestantNumber);

  return {
    ...payload,
    isFrozen: true,
    freezeMessage:
      "Mystery Freeze in Effect — Live rankings are concealed until the grand stage announcement.",
    totalVotes: null,
    entries: redactedEntries,
  };
}
