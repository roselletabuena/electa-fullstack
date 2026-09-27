import { z } from "zod";

export const updateEventBrandingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Event title must be at least 3 characters")
    .max(100, "Event title must not exceed 100 characters"),
  description: z.string().trim().max(2000, "Description must not exceed 2000 characters"),
  bannerUrl: z
    .string()
    .trim()
    .url("Banner image URL must be a valid URL")
    .regex(/^https:\/\/.+/i, "Banner image URL must use secure HTTPS protocol"),
  reason: z.string().trim().max(500, "Reason must not exceed 500 characters").optional(),
});

export type UpdateEventBrandingInput = z.infer<typeof updateEventBrandingSchema>;
