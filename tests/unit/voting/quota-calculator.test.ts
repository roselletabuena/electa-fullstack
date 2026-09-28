import { describe, it, expect } from "vitest";
import { calculateVoterQuota } from "@/features/voting/utils/quota-calculator";

describe("calculateVoterQuota", () => {
  const baseNow = new Date("2026-09-28T12:00:00.000Z");

  it("calculates full remaining quota when voter has no recent votes", () => {
    const result = calculateVoterQuota({
      dailyLimit: 3,
      isFreeVotingEnabled: true,
      isEventActive: true,
      recentFreeVoteTimestamps: [],
      now: baseNow,
    });

    expect(result.dailyLimit).toBe(3);
    expect(result.votesUsedIn24h).toBe(0);
    expect(result.remainingVotes).toBe(3);
    expect(result.isInCooldown).toBe(false);
    expect(result.nextResetTime).toBeNull();
  });

  it("calculates partial quota when voter has cast some votes in rolling 24h", () => {
    const vote1 = new Date("2026-09-28T02:00:00.000Z"); // 10h ago
    const result = calculateVoterQuota({
      dailyLimit: 3,
      isFreeVotingEnabled: true,
      isEventActive: true,
      recentFreeVoteTimestamps: [vote1],
      now: baseNow,
    });

    expect(result.votesUsedIn24h).toBe(1);
    expect(result.remainingVotes).toBe(2);
    expect(result.isInCooldown).toBe(false);
    expect(result.nextResetTime).toBeNull();
  });

  it("detects quota exhaustion and computes accurate nextResetTime for rolling 24h", () => {
    const vote1 = new Date("2026-09-27T16:00:00.000Z"); // 20h ago (earliest of 3)
    const vote2 = new Date("2026-09-28T02:00:00.000Z"); // 10h ago
    const vote3 = new Date("2026-09-28T10:00:00.000Z"); // 2h ago

    const result = calculateVoterQuota({
      dailyLimit: 3,
      isFreeVotingEnabled: true,
      isEventActive: true,
      recentFreeVoteTimestamps: [vote1, vote2, vote3],
      now: baseNow,
    });

    expect(result.votesUsedIn24h).toBe(3);
    expect(result.remainingVotes).toBe(0);
    expect(result.isInCooldown).toBe(true);
    // Next reset should be vote1 + 24h = 2026-09-28T16:00:00.000Z
    expect(result.nextResetTime).toBe("2026-09-28T16:00:00.000Z");
  });

  it("ignores votes older than 24 hours in rolling window", () => {
    const oldVote = new Date("2026-09-27T10:00:00.000Z"); // 26h ago (expired)
    const recentVote = new Date("2026-09-28T08:00:00.000Z"); // 4h ago

    const result = calculateVoterQuota({
      dailyLimit: 2,
      isFreeVotingEnabled: true,
      isEventActive: true,
      recentFreeVoteTimestamps: [oldVote, recentVote],
      now: baseNow,
    });

    expect(result.votesUsedIn24h).toBe(1);
    expect(result.remainingVotes).toBe(1);
    expect(result.isInCooldown).toBe(false);
  });
});
