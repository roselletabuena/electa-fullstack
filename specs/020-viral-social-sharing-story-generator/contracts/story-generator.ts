import { z } from "zod";

export const storyThemeSchema = z.enum(["midnight", "coronation", "opal"]);

export const storyCardPayloadSchema = z.object({
  eventSlug: z.string().min(1),
  eventTitle: z.string().min(1),
  candidateId: z.string().min(1),
  candidateNumber: z.number().int().positive(),
  candidateName: z.string().min(1),
  candidateAvatarUrl: z.string().min(1),
  divisionName: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  votingUrl: z.string().url(),
  theme: storyThemeSchema.default("midnight"),
});

export type StoryCardPayload = z.infer<typeof storyCardPayloadSchema>;
export type StoryTheme = z.infer<typeof storyThemeSchema>;
