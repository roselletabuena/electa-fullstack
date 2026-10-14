import type { OfficeSelection } from "@/lib/validations/ballot";

export interface SecretBallotInput {
  eventId: string;
  selections: OfficeSelection[];
  deviceFingerprint?: string;
  turnstileToken?: string;
}

export interface SecretBallotSubmissionResult {
  success: true;
  receiptHash: string;
  eventId: string;
  votesCount: number;
  submittedAt: string;
}

export type SecretBallotErrorCode =
  | "NOT_AUTHENTICATED"
  | "EVENT_NOT_ACTIVE"
  | "BALLOT_ALREADY_SUBMITTED"
  | "INVALID_BALLOT_SELECTIONS"
  | "POSITION_SELECTION_LIMIT_VIOLATION"
  | "CONTESTANT_NOT_ELIGIBLE"
  | "RATE_LIMIT_EXCEEDED"
  | "DEVICE_ACCOUNT_LIMIT_EXCEEDED"
  | "BOT_DETECTION_FAILED"
  | "TRANSACTION_FAILED"
  | "INTERNAL_ERROR";

export interface SecretBallotErrorDto {
  code: SecretBallotErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type SecretBallotResponse =
  | { success: true; data: SecretBallotSubmissionResult; error: null }
  | { success: false; data: null; error: SecretBallotErrorDto };
