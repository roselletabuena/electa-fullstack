import { z } from "zod";
import { SETTINGS_TABS } from "@/features/events/types";

export const eventSlugParamsSchema = z.object({
  slug: z
    .string()
    .min(1, "Event slug is required")
    .max(60, "Slug must not exceed 60 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and single hyphens",
    ),
});

export const eventSettingsTabQuerySchema = z.object({
  tab: z.enum(SETTINGS_TABS).default("general").catch("general"),
});

export type EventSlugParams = z.infer<typeof eventSlugParamsSchema>;
export type EventSettingsTabQuery = z.infer<typeof eventSettingsTabQuerySchema>;
