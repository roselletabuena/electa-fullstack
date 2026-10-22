import { z } from "zod";

export const EVENT_THEME_VALUES = ["ELECTA_DEFAULT", "PAGEANT_EDITORIAL"] as const;

export const eventThemeSchema = z.enum(EVENT_THEME_VALUES, {
  message: "Invalid event theme identifier",
});

export const updateEventThemeSchema = z.object({
  theme: eventThemeSchema,
  reason: z.string().trim().max(500, "Reason must not exceed 500 characters").optional(),
});

export type EventThemeInput = z.infer<typeof eventThemeSchema>;
export type UpdateEventThemeInput = z.infer<typeof updateEventThemeSchema>;
