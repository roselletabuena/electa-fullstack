import { z } from "zod";

/**
 * Zod schema for office selection within a ballot
 */
export const officeSelectionSchema = z.object({
  positionId: z.string().uuid("Invalid position ID format").nullable().optional(),
  contestantIds: z
    .array(z.string().uuid("Invalid contestant ID format"))
    .min(1, "At least one candidate must be selected for this office"),
});

export type OfficeSelection = z.infer<typeof officeSelectionSchema>;

/**
 * Zod schema for the complete multi-office institutional ballot
 */
export const castBallotSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  selections: z
    .array(officeSelectionSchema)
    .min(1, "A ballot must contain at least one office or candidate selection"),
  turnstileToken: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  idempotencyKey: z.string().uuid("Invalid idempotency key format").optional(),
});

export type CastBallotInput = z.infer<typeof castBallotSchema>;

/**
 * DTO for successful ballot submission receipt
 */
export interface BallotVoteSummary {
  voteId: string;
  contestantId: string;
  positionId: string | null;
}

export interface CastBallotResult {
  success: true;
  ballotId: string;
  eventId: string;
  voterId: string;
  votesCount: number;
  votes: BallotVoteSummary[];
  submittedAt: string;
}

export type CastBallotErrorCode =
  | "NOT_AUTHENTICATED"
  | "EVENT_NOT_ACTIVE"
  | "BALLOT_ALREADY_SUBMITTED"
  | "INVALID_BALLOT_SELECTIONS"
  | "POSITION_SELECTION_LIMIT_VIOLATION"
  | "CONTESTANT_NOT_ELIGIBLE"
  | "RATE_LIMIT_EXCEEDED"
  | "DEVICE_ACCOUNT_LIMIT_EXCEEDED"
  | "BOT_DETECTION_FAILED"
  | "INTERNAL_ERROR";

export interface CastBallotError {
  code: CastBallotErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type CastBallotResponse =
  | { success: true; data: CastBallotResult; error: null }
  | { success: false; data: null; error: CastBallotError };
