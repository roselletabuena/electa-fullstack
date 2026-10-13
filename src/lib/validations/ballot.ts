import { z } from "zod";

/**
 * Zod schema for selecting candidates within a specific office or position.
 */
export const officeSelectionSchema = z.object({
  positionId: z
    .string()
    .uuid("Invalid position ID format")
    .nullable()
    .optional(),
  contestantIds: z
    .array(z.string().uuid("Invalid contestant ID format"))
    .min(1, "At least one contestant must be selected for this office"),
});

export type OfficeSelection = z.infer<typeof officeSelectionSchema>;

/**
 * Zod schema for casting a multi-office institutional ballot.
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
