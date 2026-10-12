# Data Model: Global Event & Candidate Search Bar

**Feature**: `030-global-search-bar`  
**Jira Key**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88)  
**Date**: 2026-10-12

---

## 1. Entities & DTOs

### Search Query Parameters (`SearchQueryInput`)

```typescript
interface SearchQueryInput {
  q: string; // Trimmed query string, 1..100 characters
  limit?: number; // Maximum matches per entity type (default: 5, max: 20)
}
```

### Search Result Entities (`SearchResultsDto`)

```typescript
interface SearchEventResultDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  publicationStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}

interface SearchContestantResultDto {
  id: string;
  name: string;
  contestantNumber: number;
  hometown: string | null;
  bio: string | null;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
}

interface SearchCategoryResultDto {
  id: string;
  name: string;
  description: string | null;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
}

interface SearchResultsDto {
  query: string;
  events: SearchEventResultDto[];
  contestants: SearchContestantResultDto[];
  categories: SearchCategoryResultDto[];
  totalMatches: number;
}
```

---

## 2. Invariants & Validation Rules

1. **Query Length**: Queries with length 0 after trimming are treated as empty; no API call is made, and default results remain shown.
2. **Maximum Length**: Maximum 100 characters enforced by Zod schema to avoid ReDoS or oversized database queries.
3. **Public Exposure**: Only `PUBLISHED` events are returned to public voters. Contestants associated with unpublished or archived events are excluded from global public search results.
4. **Sanitization**: All input strings are trimmed and stripped of null bytes prior to Prisma parameterized queries.
