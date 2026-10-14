import { z } from "zod";

/**
 * Validates a single student roster row parsed from CSV.
 */
export const studentRosterRowSchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(1, "Student ID is required")
    .max(100, "Student ID cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
});

export type StudentRosterRow = z.infer<typeof studentRosterRowSchema>;

/**
 * Validates domain string, stripping optional leading '@'.
 */
export const emailDomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((val) => (val.startsWith("@") ? val.slice(1) : val))
  .pipe(
    z
      .string()
      .min(3, "Domain must be at least 3 characters")
      .max(255, "Domain cannot exceed 255 characters")
      .regex(
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/,
        "Invalid domain format"
      )
  );

/**
 * Schema for updating approved institutional email domains.
 */
export const updateEventDomainWhitelistSchema = z.object({
  domains: z
    .array(emailDomainSchema)
    .max(50, "Cannot configure more than 50 institutional domains"),
});

export type UpdateEventDomainWhitelistInput = z.infer<
  typeof updateEventDomainWhitelistSchema
>;

/**
 * Schema for querying voter eligibility.
 */
export const checkVoterEligibilitySchema = z
  .object({
    eventId: z.string().uuid("Invalid event ID format"),
    studentId: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .optional(),
  })
  .refine(
    (data) => Boolean(data.studentId || data.email),
    "Either studentId or email must be provided to verify voter eligibility"
  );

export type CheckVoterEligibilityInput = z.infer<
  typeof checkVoterEligibilitySchema
>;
