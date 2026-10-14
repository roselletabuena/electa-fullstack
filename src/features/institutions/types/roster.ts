import type { StudentRosterRow } from "@/lib/validations/roster";

export interface NormalizedRosterEntry {
  studentIdHash: string;
  email: string;
}

export interface ParseRosterCsvResult {
  entries: StudentRosterRow[];
  totalLines: number;
  duplicateCount: number;
  skippedCount: number;
}

export interface IngestRosterOptions {
  eventId: string;
  csvContent: string | Buffer;
  batchSize?: number;
  replace?: boolean;
}

export interface RosterUploadSummary {
  totalProcessed: number;
  totalIngested: number;
  totalDuplicatesSkipped: number;
  durationMs: number;
}

export type VoterMatchStrategy =
  | "ROSTER_STUDENT_ID"
  | "ROSTER_EMAIL"
  | "EMAIL_DOMAIN"
  | "NONE";

export interface VoterEligibilityResult {
  isEligible: boolean;
  matchType: VoterMatchStrategy;
  reason?: string;
}

export interface EventRosterStatusDto {
  eventId: string;
  totalStudents: number;
  allowedEmailDomains: string[];
  hasRoster: boolean;
  lastUpdated: string | null;
}
