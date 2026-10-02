import { z } from "zod";

export const StageDisplayModeSchema = z.enum(["LIVE_TALLY", "WINNER_REVEAL"]);
export type StageDisplayMode = z.infer<typeof StageDisplayModeSchema>;

export const StageCandidateSchema = z.object({
  id: z.string().min(1),
  contestantNumber: z.number().int().positive(),
  name: z.string().min(1),
  avatarUrl: z.string().nullable().optional(),
  voteCount: z.number().int().nonnegative().nullable(),
  rank: z.number().int().positive().nullable(),
  divisionId: z.string().nullable().optional(),
  divisionName: z.string().nullable().optional(),
  isRevealed: z.boolean().optional(),
});
export type StageCandidate = z.infer<typeof StageCandidateSchema>;

export const StageDivisionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
export type StageDivision = z.infer<typeof StageDivisionSchema>;

export const StageCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});
export type StageCategory = z.infer<typeof StageCategorySchema>;

export const StageDisplayPayloadSchema = z.object({
  eventId: z.string().min(1),
  eventTitle: z.string().min(1),
  eventSlug: z.string().min(1),
  isFrozen: z.boolean(),
  totalVotes: z.number().int().nonnegative(),
  selectedDivisionId: z.string().nullable(),
  selectedCategoryId: z.string().nullable(),
  candidates: z.array(StageCandidateSchema),
  divisions: z.array(StageDivisionSchema),
  categories: z.array(StageCategorySchema),
  lastUpdated: z.string(),
});
export type StageDisplayPayload = z.infer<typeof StageDisplayPayloadSchema>;
