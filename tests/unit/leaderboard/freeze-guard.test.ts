import { describe, it, expect } from "vitest";
import {
  isMysteryFreezeActive,
  redactLeaderboardForPublic,
} from "@/features/leaderboard/utils/freeze-guard";
import type { LeaderboardPayload } from "@/features/leaderboard/types";

describe("isMysteryFreezeActive", () => {
  it("returns true when isLeaderboardFrozen is explicitly true", () => {
    expect(isMysteryFreezeActive({ isLeaderboardFrozen: true })).toBe(true);
  });

  it("returns false when isLeaderboardFrozen is false and no schedule is active", () => {
    expect(isMysteryFreezeActive({ isLeaderboardFrozen: false })).toBe(false);
  });

  it("returns true when current time is within freezeStartsAt and endsAt", () => {
    const now = new Date("2026-10-02T18:00:00Z");
    const freezeStartsAt = new Date("2026-10-02T17:00:00Z");
    const endsAt = new Date("2026-10-02T20:00:00Z");

    expect(
      isMysteryFreezeActive({
        freezeStartsAt,
        endsAt,
        now,
      }),
    ).toBe(true);
  });

  it("returns false when current time is before freezeStartsAt", () => {
    const now = new Date("2026-10-02T16:00:00Z");
    const freezeStartsAt = new Date("2026-10-02T17:00:00Z");
    const endsAt = new Date("2026-10-02T20:00:00Z");

    expect(
      isMysteryFreezeActive({
        freezeStartsAt,
        endsAt,
        now,
      }),
    ).toBe(false);
  });

  it("lifts freeze when event ends and showResultsOnClose is true", () => {
    const now = new Date("2026-10-02T21:00:00Z");
    const freezeStartsAt = new Date("2026-10-02T17:00:00Z");
    const endsAt = new Date("2026-10-02T20:00:00Z");

    expect(
      isMysteryFreezeActive({
        isLeaderboardFrozen: true,
        freezeStartsAt,
        endsAt,
        showResultsOnClose: true,
        now,
      }),
    ).toBe(false);
  });
});

describe("redactLeaderboardForPublic", () => {
  it("redacts vote counts and ranks, hides totalVotes, and reorders by contestantNumber", () => {
    const mockPayload: LeaderboardPayload = {
      eventId: "11111111-1111-1111-1111-111111111111",
      eventSlug: "test-pageant",
      eventTitle: "Test Pageant",
      isFrozen: false,
      totalVotes: 500,
      lastUpdated: new Date().toISOString(),
      entries: [
        {
          id: "c2",
          contestantNumber: 5,
          name: "Leader",
          avatarUrl: "/leader.jpg",
          voteCount: 300,
          rank: 1,
          percentageShare: 60,
          gapToLeader: 0,
          gapToAhead: 0,
          isPodium: true,
        },
        {
          id: "c1",
          contestantNumber: 1,
          name: "Runner Up",
          avatarUrl: "/runner.jpg",
          voteCount: 200,
          rank: 2,
          percentageShare: 40,
          gapToLeader: 101,
          gapToAhead: 101,
          isPodium: true,
        },
      ],
    };

    const redacted = redactLeaderboardForPublic(mockPayload);

    expect(redacted.isFrozen).toBe(true);
    expect(redacted.totalVotes).toBeNull();
    expect(redacted.freezeMessage).toContain("Mystery Freeze");

    const first = redacted.entries[0];
    const second = redacted.entries[1];

    expect(first).toBeDefined();
    expect(second).toBeDefined();

    if (first && second) {
      // Ordered by contestantNumber ascending (1 before 5)
      expect(first.contestantNumber).toBe(1);
      expect(first.voteCount).toBeNull();
      expect(first.rank).toBeNull();
      expect(first.isPodium).toBe(false);

      expect(second.contestantNumber).toBe(5);
      expect(second.voteCount).toBeNull();
      expect(second.rank).toBeNull();
    }
  });
});
