import { z } from "zod";

/**
 * OpenGraph Image Meta Contract Schema
 */
export const openGraphMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional(),
  siteName: z.literal("Electa"),
  locale: z.literal("en_PH"),
  image: z.object({
    url: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string(),
  }),
});

export type OpenGraphMeta = z.infer<typeof openGraphMetaSchema>;

/**
 * Landing Page Assembly Section Contract
 */
export const landingPageAssemblySchema = z.object({
  hasHeader: z.boolean(),
  hasHeroIntro: z.boolean(),
  hasSearchSection: z.boolean(),
  hasMarketingShowcase: z.boolean(),
  hasTrendingEventsGrid: z.boolean(),
  hasFooter: z.boolean(),
  footerVariant: z.enum(["default", "streamlined"]),
});

export type LandingPageAssembly = z.infer<typeof landingPageAssemblySchema>;
