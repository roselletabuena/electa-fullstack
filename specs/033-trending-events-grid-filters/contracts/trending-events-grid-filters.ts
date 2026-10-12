import { z } from "zod";

/**
 * Filter status enum schema
 */
export const eventLifecycleFilterSchema = z.enum(["all", "active", "scheduled", "closed"]);
export type EventLifecycleFilter = z.infer<typeof eventLifecycleFilterSchema>;

/**
 * Trending event item DTO schema
 */
export const trendingEventItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  bannerUrl: z.string().url().or(z.string().min(1)),
  location: z.string().optional(),
  startsAt: z.string().datetime().or(z.string().min(1)),
  endsAt: z.string().datetime().or(z.string().min(1)),
  operationalState: z.enum(["Draft", "Scheduled", "Active", "Closed"]),
  contestantCount: z.number().int().nonnegative(),
  serverTime: z.string().datetime().or(z.string().min(1)),
});

export type TrendingEventItemDto = z.infer<typeof trendingEventItemSchema>;

/**
 * Filter change event payload
 */
export interface FilterChangeEvent {
  filter: EventLifecycleFilter;
  source: "tab" | "url" | "reset";
}
