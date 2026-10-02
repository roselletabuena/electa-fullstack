import { z } from "zod";

export const leaderboardQuerySchema = z.object({
  divisionId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

export type LeaderboardQueryParams = z.infer<typeof leaderboardQuerySchema>;

export const leaderboardEntrySchema = z.object({
  id: z.string().uuid(),
  contestantNumber: z.number().int().positive(),
  name: z.string().min(1),
  avatarUrl: z.string(),
  divisionId: z.string().uuid().nullable().optional(),
  divisionName: z.string().nullable().optional(),
  voteCount: z.number().int().nonnegative().nullable(),
  rank: z.number().int().positive().nullable(),
  percentageShare: z.number().min(0).max(100),
  gapToLeader: z.number().int().nonnegative(),
  gapToAhead: z.number().int().nonnegative(),
  isPodium: z.boolean(),
});

export const leaderboardPayloadSchema = z.object({
  eventId: z.string().uuid(),
  eventSlug: z.string().min(1),
  eventTitle: z.string().min(1),
  isFrozen: z.boolean(),
  freezeMessage: z.string().optional(),
  totalVotes: z.number().int().nonnegative().nullable(),
  selectedDivisionId: z.string().uuid().nullable().optional(),
  selectedCategoryId: z.string().uuid().nullable().optional(),
  entries: z.array(leaderboardEntrySchema),
  lastUpdated: z.string().datetime(),
});

export type LeaderboardPayload = z.infer<typeof leaderboardPayloadSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
