import { z } from "zod";

export const launchMilestoneIdSchema = z.enum([
  "event-profile",
  "divisions",
  "contestants",
  "voting-rules",
]);

export type LaunchMilestoneId = z.infer<typeof launchMilestoneIdSchema>;

export const launchReadinessItemSchema = z.object({
  id: launchMilestoneIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  isCompleted: z.boolean(),
  actionLabel: z.string().min(1),
  actionHref: z.string().min(1),
});

export type LaunchReadinessItem = z.infer<typeof launchReadinessItemSchema>;

export const launchReadinessCountsSchema = z.object({
  divisionsCount: z.number().int().nonnegative().default(0),
  contestantsCount: z.number().int().nonnegative().default(0),
  votingRulesAuditCount: z.number().int().nonnegative().default(0),
});

export type LaunchReadinessCounts = z.infer<typeof launchReadinessCountsSchema>;

export const launchReadinessSnapshotSchema = z.object({
  eventId: z.string().uuid(),
  slug: z.string().min(1),
  publicationStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  divisionsCount: z.number().int().nonnegative(),
  contestantsCount: z.number().int().nonnegative(),
  hasVotingRulesConfigured: z.boolean(),
  totalMilestones: z.number().int().positive(),
  completedMilestones: z.number().int().nonnegative(),
  percentageComplete: z.number().int().min(0).max(100),
  isAllCompleted: z.boolean(),
  items: z.array(launchReadinessItemSchema),
});

export type LaunchReadinessSnapshot = z.infer<typeof launchReadinessSnapshotSchema>;
