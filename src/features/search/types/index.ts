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

export type SearchEventResultDto = z.infer<typeof searchEventResultSchema>;

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

export type SearchContestantResultDto = z.infer<typeof searchContestantResultSchema>;

export const searchCategoryResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  eventId: z.string(),
  eventTitle: z.string(),
  eventSlug: z.string(),
});

export type SearchCategoryResultDto = z.infer<typeof searchCategoryResultSchema>;

export const searchResultsSchema = z.object({
  query: z.string(),
  events: z.array(searchEventResultSchema),
  contestants: z.array(searchContestantResultSchema),
  categories: z.array(searchCategoryResultSchema),
  totalMatches: z.number(),
});

export type SearchResultsDto = z.infer<typeof searchResultsSchema>;

export interface GlobalSearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  scrollTargetId?: string;
  ariaLabel?: string;
  size?: "default" | "large" | "compact";
}

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  inputSize?: "default" | "large" | "compact";
}
