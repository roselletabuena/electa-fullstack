import { z } from "zod";

export const CastFreeVoteSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  contestantId: z.string().uuid("Invalid contestant ID format"),
  awardCategoryId: z.string().uuid("Invalid award category ID format").optional(),
});

export type CastFreeVoteInput = z.infer<typeof CastFreeVoteSchema>;

export interface VoterQuotaStateDto {
  dailyLimit: number;
  votesUsedIn24h: number;
  remainingVotes: number;
  isFreeVotingEnabled: boolean;
  isEventActive: boolean;
  isInCooldown: boolean;
  nextResetTime: string | null; // ISO Date string of earliest reset when remainingVotes === 0
}

export interface CastFreeVoteResultDto {
  success: boolean;
  voteId: string;
  contestantId: string;
  newContestantVoteCount: number;
  quotaState: VoterQuotaStateDto;
}

export interface VotingErrorDto {
  code:
    | "NOT_AUTHENTICATED"
    | "EVENT_NOT_ACTIVE"
    | "FREE_VOTING_DISABLED"
    | "DAILY_QUOTA_EXHAUSTED"
    | "CONTESTANT_NOT_FOUND"
    | "INTERNAL_ERROR";
  message: string;
  details?: {
    nextResetTime?: string | null;
    dailyLimit?: number;
    votesUsedIn24h?: number;
  };
}
