import type { VoterQuotaStateDto } from "../types";

export interface QuotaCalculationParams {
  dailyLimit: number;
  isFreeVotingEnabled: boolean;
  isEventActive: boolean;
  recentFreeVoteTimestamps: (Date | string | number)[];
  now?: Date;
}

const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

/**
 * Calculates a voter's rolling 24-hour free voting quota state.
 */
export function calculateVoterQuota({
  dailyLimit,
  isFreeVotingEnabled,
  isEventActive,
  recentFreeVoteTimestamps,
  now = new Date(),
}: QuotaCalculationParams): VoterQuotaStateDto {
  const currentTime = now.getTime();
  const windowStartTime = currentTime - ROLLING_WINDOW_MS;

  // Normalize and sort timestamps ascending
  const validTimestamps = recentFreeVoteTimestamps
    .map((t) => (typeof t === "number" ? t : new Date(t).getTime()))
    .filter((t) => !isNaN(t) && t >= windowStartTime && t <= currentTime)
    .sort((a, b) => a - b);

  const votesUsedIn24h = validTimestamps.length;
  const remainingVotes = Math.max(0, dailyLimit - votesUsedIn24h);
  const isInCooldown = votesUsedIn24h >= dailyLimit;

  let nextResetTime: string | null = null;
  if (isInCooldown && validTimestamps.length > 0) {
    // When quota is exhausted, the next vote becomes available 24 hours after the oldest vote in the current full window
    const fallback = validTimestamps[0] ?? currentTime;
    const earliestExpiringTimestamp =
      validTimestamps[validTimestamps.length - dailyLimit] ?? fallback;
    nextResetTime = new Date(earliestExpiringTimestamp + ROLLING_WINDOW_MS).toISOString();
  }

  return {
    dailyLimit,
    votesUsedIn24h,
    remainingVotes,
    isFreeVotingEnabled,
    isEventActive,
    isInCooldown,
    nextResetTime,
  };
}

/**
 * Formats a millisecond duration into a clean countdown string: HH:MM:SS.
 */
export function formatCooldownCountdown(msRemaining: number): string {
  if (msRemaining <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates remaining milliseconds between now and nextResetTime.
 */
export function getRemainingMilliseconds(
  nextResetTime: string | null | undefined,
  now = new Date(),
): number {
  if (!nextResetTime) {
    return 0;
  }
  const resetMs = new Date(nextResetTime).getTime();
  if (isNaN(resetMs)) {
    return 0;
  }
  return Math.max(0, resetMs - now.getTime());
}
