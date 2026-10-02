import { z } from "zod";

export const CastFreeVoteSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  contestantId: z.string().uuid("Invalid contestant ID format"),
  awardCategoryId: z.string().uuid("Invalid award category ID format").optional(),
  turnstileToken: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type CastFreeVoteInput = z.infer<typeof CastFreeVoteSchema>;

export const CastVoteInputSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  contestantId: z.string().uuid("Invalid contestant ID format"),
  awardCategoryId: z.string().uuid("Invalid award category ID format").nullable().optional(),
  voteType: z.enum(["FREE", "BOOST"]).default("FREE"),
  voteWeight: z.number().int().min(1).max(1000).default(1),
  turnstileToken: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type CastVoteInput = z.infer<typeof CastVoteInputSchema>;

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

export interface CastVoteResultDto {
  success: boolean;
  voteId: string;
  contestantId: string;
  newContestantVoteCount: number;
  voteType: "FREE" | "BOOST";
  voteWeight: number;
  quotaState?: VoterQuotaStateDto | undefined;
}

export interface VotingErrorDto {
  code:
    | "NOT_AUTHENTICATED"
    | "EVENT_NOT_ACTIVE"
    | "FREE_VOTING_DISABLED"
    | "DAILY_QUOTA_EXHAUSTED"
    | "CONTESTANT_NOT_FOUND"
    | "BOT_DETECTION_FAILED"
    | "RATE_LIMIT_EXCEEDED"
    | "DEVICE_ACCOUNT_LIMIT_EXCEEDED"
    | "INTERNAL_ERROR";
  message: string;
  details?: {
    nextResetTime?: string | null;
    dailyLimit?: number;
    votesUsedIn24h?: number;
  };
}

export interface PendingVoteIntent {
  eventId: string;
  contestantId: string;
  contestantName?: string | undefined;
  awardCategoryId?: string | undefined;
  voteType?: "FREE" | "BOOST" | undefined;
  timestamp: number;
}
