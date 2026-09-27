# Phase 1 Data Model & Types: Organizer Multi-Event Overview Dashboard

**Branch**: `007-organizer-events-dashboard` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

## 1. Domain Types & DTOs

```typescript
import type { EventPublicationStatus } from "@/generated/client/client";

export type EventStatusFilter = "ALL" | EventPublicationStatus;

export interface OrganizerEventItemDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
  publicationStatus: EventPublicationStatus;
  isLive: boolean; // computed: publicationStatus === 'PUBLISHED' && startsAt <= now <= endsAt
  isEnded: boolean; // computed: now > endsAt
  contestantsCount: number;
  votesCount: number;
  createdAt: string;
}

export interface DashboardMetricsDto {
  totalEvents: number;
  liveEvents: number;
  totalCandidates: number;
  totalVotesCast: number;
}
```

## 2. Validation Schemas (`src/lib/validations/dashboard-query.ts`)

```typescript
import { z } from "zod";

export const eventStatusFilterEnum = z.enum(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"]);

export const dashboardQuerySchema = z.object({
  status: eventStatusFilterEnum.default("ALL"),
  q: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type DashboardQueryValues = z.infer<typeof dashboardQuerySchema>;
```

## 3. Database Query Contract

```typescript
// Query executed in src/app/(dashboard)/page.tsx
const events = await prisma.event.findMany({
  where: {
    organizerId: session.userId,
  },
  include: {
    _count: {
      select: {
        contestants: true,
        votes: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});
```
