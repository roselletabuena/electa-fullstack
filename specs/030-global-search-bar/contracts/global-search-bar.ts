import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query must contain at least 1 character")
    .max(100, "Search query must not exceed 100 characters"),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;

export const searchEventResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  bannerUrl: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  publicationStatus: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]),
});

export type SearchEventResult = z.infer<typeof searchEventResultSchema>;

export const searchContestantResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  contestantNumber: z.number(),
  hometown: z.string().nullable(),
  bio: z.string().nullable(),
  eventId: z.string(),
  eventTitle: z.string(),
  eventSlug: z.string(),
});

export type SearchContestantResult = z.infer<typeof searchContestantResultSchema>;

export const searchCategoryResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  eventId: z.string(),
  eventTitle: z.string(),
  eventSlug: z.string(),
});

export type SearchCategoryResult = z.infer<typeof searchCategoryResultSchema>;

export const searchResultsSchema = z.object({
  query: z.string(),
  events: z.array(searchEventResultSchema),
  contestants: z.array(searchContestantResultSchema),
  categories: z.array(searchCategoryResultSchema),
  totalMatches: z.number(),
});

export type SearchResults = z.infer<typeof searchResultsSchema>;
