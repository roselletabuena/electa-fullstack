import type { PendingVoteIntent } from "../types";

export const VOTE_INTENT_STORAGE_KEY = "electa_pending_vote_intent";
const INTENT_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes validity

/**
 * Saves a pending vote intent into sessionStorage.
 */
export function savePendingVoteIntent(
  intent: Omit<PendingVoteIntent, "timestamp"> & { timestamp?: number },
): void {
  if (typeof window === "undefined") return;

  const payload: PendingVoteIntent = {
    ...intent,
    timestamp: intent.timestamp ?? Date.now(),
  };

  try {
    sessionStorage.setItem(VOTE_INTENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Gracefully handle storage quota or private browsing exceptions
  }
}

/**
 * Retrieves the pending vote intent if valid and unexpired.
 */
export function getPendingVoteIntent(): PendingVoteIntent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(VOTE_INTENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.eventId !== "string" ||
      typeof candidate.contestantId !== "string" ||
      typeof candidate.timestamp !== "number"
    ) {
      return null;
    }

    // Check expiration
    if (Date.now() - candidate.timestamp > INTENT_EXPIRY_MS) {
      clearPendingVoteIntent();
      return null;
    }

    return {
      eventId: candidate.eventId,
      contestantId: candidate.contestantId,
      contestantName:
        typeof candidate.contestantName === "string" ? candidate.contestantName : undefined,
      awardCategoryId:
        typeof candidate.awardCategoryId === "string" ? candidate.awardCategoryId : undefined,
      voteType:
        candidate.voteType === "BOOST" || candidate.voteType === "FREE"
          ? candidate.voteType
          : "FREE",
      timestamp: candidate.timestamp,
    };
  } catch {
    return null;
  }
}

/**
 * Clears any pending vote intent from sessionStorage.
 */
export function clearPendingVoteIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(VOTE_INTENT_STORAGE_KEY);
  } catch {
    // Ignored
  }
}
