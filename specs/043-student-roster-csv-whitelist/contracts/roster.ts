import { z } from "zod";

/**
 * Schema for validating individual student rows.
 */
export const studentRosterRowSchema = z.object({
  studentId: z.string().min(1, "Student ID cannot be empty").max(100),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

export type StudentRosterRowInput = z.infer<typeof studentRosterRowSchema>;

/**
 * Schema for updating event domain whitelist.
 */
export const updateEventDomainWhitelistSchema = z.object({
  domains: z
    .array(
      z
        .string()
        .min(2)
        .transform((val) => (val.startsWith("@") ? val.slice(1).toLowerCase() : val.toLowerCase()))
    )
    .max(50, "Cannot specify more than 50 domains"),
});

export type UpdateEventDomainWhitelistInput = z.infer<typeof updateEventDomainWhitelistSchema>;

/**
 * Schema for checking voter eligibility.
 */
export const checkVoterEligibilitySchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  studentId: z.string().min(1).optional(),
  email: z.string().email().toLowerCase().trim().optional(),
}).refine(
  (data) => Boolean(data.studentId || data.email),
  "Either studentId or email must be provided to verify voter eligibility"
);

export type CheckVoterEligibilityInput = z.infer<typeof checkVoterEligibilitySchema>;

/**
 * Result DTO returned upon CSV upload.
 */
export interface RosterUploadResponseDto {
  success: boolean;
  totalProcessed: number;
  totalIngested: number;
  totalDuplicatesSkipped: number;
  durationMs: number;
}

/**
 * Eligibility result returned to voter auth services.
 */
export interface VoterEligibilityResponseDto {
  isEligible: boolean;
  matchType?: "ROSTER_STUDENT_ID" | "ROSTER_EMAIL" | "EMAIL_DOMAIN" | "NONE";
  reason?: string;
}
