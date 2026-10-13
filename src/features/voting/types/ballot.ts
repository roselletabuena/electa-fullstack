import type { OfficeSelection, CastBallotInput } from "@/lib/validations/ballot";

export type { OfficeSelection, CastBallotInput };

export interface BallotVoteSummaryDto {
  voteId: string;
  contestantId: string;
  positionId: string | null;
}

export interface CastBallotResultDto {
  success: true;
  ballotId: string;
  eventId: string;
  voterId: string;
  votesCount: number;
  votes: BallotVoteSummaryDto[];
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

export interface CastBallotErrorDto {
  code: CastBallotErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type CastBallotResponse =
  | { success: true; data: CastBallotResultDto; error: null }
  | { success: false; data: null; error: CastBallotErrorDto };
