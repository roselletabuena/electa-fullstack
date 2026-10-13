import { z } from "zod";

export const RESERVED_SLUGS = [
  "new",
  "edit",
  "admin",
  "api",
  "dashboard",
  "settings",
  "check-slug",
] as const;

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const eventSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters")
  .max(60, "Slug must not exceed 60 characters")
  .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and single hyphens")
  .refine((slug) => !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]), {
    message: "This slug is reserved by the system and cannot be used",
  });

export const checkSlugQuerySchema = z.object({
  slug: eventSlugSchema,
});

export type CheckSlugQuery = z.infer<typeof checkSlugQuerySchema>;
