import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  savePendingVoteIntent,
  getPendingVoteIntent,
  clearPendingVoteIntent,
  VOTE_INTENT_STORAGE_KEY,
} from "@/features/voting/utils/vote-intent";

describe("Vote Intent Storage Utilities", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key: string) => mockStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStore[key];
      }),
    });
  });

  it("saves and retrieves a valid pending vote intent", () => {
    const intent = {
      eventId: "event-123",
      contestantId: "contestant-456",
      contestantName: "Maria Santos",
      awardCategoryId: "cat-789",
      voteType: "FREE" as const,
    };

    savePendingVoteIntent(intent);

    const retrieved = getPendingVoteIntent();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.eventId).toBe("event-123");
    expect(retrieved?.contestantId).toBe("contestant-456");
    expect(retrieved?.contestantName).toBe("Maria Santos");
    expect(retrieved?.awardCategoryId).toBe("cat-789");
    expect(retrieved?.voteType).toBe("FREE");
    expect(typeof retrieved?.timestamp).toBe("number");
  });

  it("clears pending vote intent correctly", () => {
    savePendingVoteIntent({
      eventId: "event-123",
      contestantId: "contestant-456",
    });

    expect(getPendingVoteIntent()).not.toBeNull();

    clearPendingVoteIntent();
    expect(getPendingVoteIntent()).toBeNull();
  });

  it("returns null and clears storage when intent is expired (>15m)", () => {
    const expiredTimestamp = Date.now() - 16 * 60 * 1000;
    mockStore[VOTE_INTENT_STORAGE_KEY] = JSON.stringify({
      eventId: "event-123",
      contestantId: "contestant-456",
      timestamp: expiredTimestamp,
    });

    const retrieved = getPendingVoteIntent();
    expect(retrieved).toBeNull();
    expect(mockStore[VOTE_INTENT_STORAGE_KEY]).toBeUndefined();
  });

  it("returns null when JSON is corrupt or invalid", () => {
    mockStore[VOTE_INTENT_STORAGE_KEY] = "not-json";
    expect(getPendingVoteIntent()).toBeNull();

    mockStore[VOTE_INTENT_STORAGE_KEY] = JSON.stringify({ invalid: true });
    expect(getPendingVoteIntent()).toBeNull();
  });
});
