import { z } from "zod";
import { EVENT_THEMES } from "@/features/events/types/theme";

/**
 * Validation schema for Pageant Editorial theme configuration.
 */
export const pageantEditorialThemeSchema = z.object({
  theme: z.enum(EVENT_THEMES),
  slug: z.literal("pageant-editorial"),
  tokens: z.object({
    bgBase: z.string().startsWith("#"),
    bgSurface: z.string().startsWith("#"),
    bgSurfaceElevated: z.string().startsWith("#"),
    bgSurfaceHover: z.string().startsWith("#"),
    borderHairline: z.string(),
    borderAccent: z.string(),
    borderAccentBright: z.string().startsWith("#"),
    accentPrimary: z.string().startsWith("#"),
    accentSecondary: z.string().startsWith("#"),
    accentMuted: z.string().startsWith("#"),
    textPrimary: z.string().startsWith("#"),
    textSecondary: z.string().startsWith("#"),
    textTertiary: z.string().startsWith("#"),
    fontHeading: z.string(),
    fontBody: z.string(),
    fontSerif: z.string().optional(),
    radiusSm: z.string(),
    radiusMd: z.string(),
    radiusLg: z.string(),
    radiusPill: z.string(),
  }),
});

export type PageantEditorialThemeConfig = z.infer<typeof pageantEditorialThemeSchema>;
