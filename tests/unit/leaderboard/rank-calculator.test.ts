import { describe, it, expect } from "vitest";
import {
  calculateLeaderboardRanks,
  type RawContestantVote,
} from "@/features/leaderboard/utils/rank-calculator";

describe("calculateLeaderboardRanks", () => {
  it("returns an empty array when given no entries", () => {
    expect(calculateLeaderboardRanks([])).toEqual([]);
  });

  it("calculates ranks, percentages, and podium status correctly for standard entries", () => {
    const raw: RawContestantVote[] = [
      { id: "c1", contestantNumber: 1, name: "Alice", avatarUrl: "/alice.jpg", voteCount: 100 },
      { id: "c2", contestantNumber: 2, name: "Bob", avatarUrl: "/bob.jpg", voteCount: 80 },
      { id: "c3", contestantNumber: 3, name: "Charlie", avatarUrl: "/charlie.jpg", voteCount: 20 },
    ];

    const result = calculateLeaderboardRanks(raw);

    expect(result).toHaveLength(3);
    const first = result[0];
    const second = result[1];
    const third = result[2];

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();

    if (first && second && third) {
      // #1 Alice
      expect(first).toMatchObject({
        id: "c1",
        contestantNumber: 1,
        rank: 1,
        isPodium: true,
        percentageShare: 50,
        gapToLeader: 0,
        gapToAhead: 0,
      });

      // #2 Bob
      expect(second).toMatchObject({
        id: "c2",
        contestantNumber: 2,
        rank: 2,
        isPodium: true,
        percentageShare: 40,
        gapToLeader: 21,
        gapToAhead: 21,
      });

      // #3 Charlie
      expect(third).toMatchObject({
        id: "c3",
        contestantNumber: 3,
        rank: 3,
        isPodium: true,
        percentageShare: 10,
        gapToLeader: 81,
        gapToAhead: 61,
      });
    }
  });

  it("handles ties deterministically using contestant number and identical ranks", () => {
    const raw: RawContestantVote[] = [
      { id: "c2", contestantNumber: 5, name: "Tie 2", avatarUrl: "/t2.jpg", voteCount: 50 },
      { id: "c1", contestantNumber: 2, name: "Tie 1", avatarUrl: "/t1.jpg", voteCount: 50 },
      { id: "c3", contestantNumber: 3, name: "Winner", avatarUrl: "/w.jpg", voteCount: 100 },
    ];

    const result = calculateLeaderboardRanks(raw);
    const first = result[0];
    const second = result[1];
    const third = result[2];

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(third).toBeDefined();

    if (first && second && third) {
      expect(first.id).toBe("c3");
      expect(first.rank).toBe(1);

      // Tie 1 has lower contestant number (2 vs 5)
      expect(second.id).toBe("c1");
      expect(second.rank).toBe(2);

      expect(third.id).toBe("c2");
      expect(third.rank).toBe(2);
    }
  });

  it("marks ranks beyond 3 as non-podium (isPodium: false)", () => {
    const raw: RawContestantVote[] = [
      { id: "c1", contestantNumber: 1, name: "A", avatarUrl: "/a.jpg", voteCount: 10 },
      { id: "c2", contestantNumber: 2, name: "B", avatarUrl: "/b.jpg", voteCount: 9 },
      { id: "c3", contestantNumber: 3, name: "C", avatarUrl: "/c.jpg", voteCount: 8 },
      { id: "c4", contestantNumber: 4, name: "D", avatarUrl: "/d.jpg", voteCount: 7 },
    ];

    const result = calculateLeaderboardRanks(raw);
    const fourth = result[3];
    expect(fourth).toBeDefined();
    if (fourth) {
      expect(fourth.rank).toBe(4);
      expect(fourth.isPodium).toBe(false);
    }
  });
});
