import type { LeaderboardEntry } from "../types";

export interface RawContestantVote {
  id: string;
  contestantNumber: number;
  name: string;
  avatarUrl: string;
  divisionId?: string | null | undefined;
  divisionName?: string | null | undefined;
  voteCount: number;
}

/**
 * Calculates deterministic ranks, percentage shares, podium flags, and gap metrics
 * for a list of contestants based on their vote counts.
 */
export function calculateLeaderboardRanks(rawEntries: RawContestantVote[]): LeaderboardEntry[] {
  if (rawEntries.length === 0) {
    return [];
  }

  // 1. Sort descending by voteCount, ascending by contestantNumber for deterministic tie resolution
  const sorted = [...rawEntries].sort((a, b) => {
    if (b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return a.contestantNumber - b.contestantNumber;
  });

  const totalVotes = sorted.reduce((sum, item) => sum + item.voteCount, 0);
  const leaderVoteCount = sorted[0]?.voteCount ?? 0;

  let currentRank = 1;

  return sorted.map((entry, index) => {
    // Handle standard competition ranking for ties: 1, 2, 2, 4...
    if (index > 0 && entry.voteCount < (sorted[index - 1]?.voteCount ?? 0)) {
      currentRank = index + 1;
    }

    const percentageShare =
      totalVotes > 0 ? Math.round((entry.voteCount / totalVotes) * 1000) / 10 : 0;

    const previousVoteCount =
      index > 0 ? (sorted[index - 1]?.voteCount ?? entry.voteCount) : entry.voteCount;
    const gapToAhead = index > 0 ? Math.max(0, previousVoteCount - entry.voteCount + 1) : 0;
    const gapToLeader = Math.max(0, leaderVoteCount - entry.voteCount + (index > 0 ? 1 : 0));

    return {
      id: entry.id,
      contestantNumber: entry.contestantNumber,
      name: entry.name,
      avatarUrl: entry.avatarUrl,
      divisionId: entry.divisionId ?? null,
      divisionName: entry.divisionName ?? null,
      voteCount: entry.voteCount,
      rank: currentRank,
      percentageShare,
      gapToLeader: index === 0 ? 0 : gapToLeader,
      gapToAhead: index === 0 ? 0 : gapToAhead,
      isPodium: currentRank <= 3,
    };
  });
}
