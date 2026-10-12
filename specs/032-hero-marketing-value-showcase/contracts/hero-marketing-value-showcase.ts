import { z } from "zod";

/**
 * Feature tile schema
 */
export const marketingFeatureTileSchema = z.object({
  id: z.string().min(1),
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().optional(),
});

export type MarketingFeatureTile = z.infer<typeof marketingFeatureTileSchema>;

/**
 * Highlight metric schema
 */
export const marketingHighlightMetricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().optional(),
});

export type MarketingHighlightMetric = z.infer<typeof marketingHighlightMetricSchema>;

/**
 * Complete hero marketing showcase configuration schema
 */
export const heroMarketingConfigSchema = z.object({
  credentialBadge: z.string().min(1),
  headline: z.string().min(1),
  tiles: z.array(marketingFeatureTileSchema).length(4),
  metrics: z.array(marketingHighlightMetricSchema).length(4),
  assuranceFootnote: z.string().min(1),
});

export type HeroMarketingConfig = z.infer<typeof heroMarketingConfigSchema>;

/**
 * HeroMarketingCard component props contract
 */
export interface HeroMarketingCardProps {
  readonly className?: string;
  readonly config?: HeroMarketingConfig;
}
