import { z } from "zod";

/**
 * Zod validation schema for Cloudflare Turnstile token response.
 */
export const TurnstileVerificationSchema = z.object({
  success: z.boolean(),
  errorCodes: z.array(z.string()).optional(),
  challengeTs: z.string().optional(),
  hostname: z.string().optional(),
});

export type TurnstileVerificationResponse = z.infer<typeof TurnstileVerificationSchema>;

/**
 * Zod schema for sliding-window velocity rate limiting options.
 */
export const RateLimiterOptionsSchema = z.object({
  windowMs: z.number().default(60_000),
  maxRequests: z.number().default(10),
});

export type RateLimiterOptions = z.infer<typeof RateLimiterOptionsSchema>;

/**
 * Zod schema for vote submission payload containing bot clearance.
 */
export const VoteSubmissionPayloadSchema = z.object({
  contestantId: z.string().min(1, "Contestant ID is required"),
  categoryTrackId: z.string().optional(),
  eventSlug: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export type VoteSubmissionPayload = z.infer<typeof VoteSubmissionPayloadSchema>;
