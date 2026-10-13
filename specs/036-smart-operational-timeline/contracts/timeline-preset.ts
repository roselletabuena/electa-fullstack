import { z } from "zod";

export const timelineDurationPresetIdSchema = z.enum(["7d", "14d", "30d"]);
export type TimelineDurationPresetId = z.infer<typeof timelineDurationPresetIdSchema>;

export const timelineDurationPresetSchema = z.object({
  id: timelineDurationPresetIdSchema,
  label: z.string(),
  days: z.number().int().positive(),
});

export type TimelineDurationPreset = z.infer<typeof timelineDurationPresetSchema>;

export const createEventDraftSchema = z.object({
  title: z.string().default(""),
  slug: z.string().default(""),
  description: z.string().default(""),
  bannerUrl: z.string().default(""),
  startsAt: z.string().default(""),
  endsAt: z.string().default(""),
  isCustomSlug: z.boolean().optional(),
  savedAt: z.number().int().nonnegative(),
});

export type CreateEventDraft = z.infer<typeof createEventDraftSchema>;
