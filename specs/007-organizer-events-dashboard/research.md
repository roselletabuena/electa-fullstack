# Phase 0 Research: Organizer Multi-Event Overview Dashboard & Management Portal

**Branch**: `007-organizer-events-dashboard` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

## 1. Architectural & Routing Decisions

### Decision 1: Canonical Route & Layout Structure

- **Context**: Organizers need a home portal when logging into VoteSphere to see all their organized competitions.
- **Decision**:
  - Canonical route: `src/app/(dashboard)/page.tsx` (served at `/dashboard`).
  - Dedicated alias/redirect: `src/app/(dashboard)/events/page.tsx` (redirects to `/dashboard`).
  - Layout: Leverages `src/app/(dashboard)/layout.tsx` for shared organizer navigation shell.

### Decision 2: Data Fetching Pattern (RSC + Client Filtering)

- **Context**: Dashboard needs fast initial load with server-side authorization and multi-tenant security, but instant (<50ms) search and status filtering in the UI.
- **Decision**:
  - Server Component (`src/app/(dashboard)/page.tsx`): Authenticates the session via `getSession()`, executes an optimized Prisma query fetching only events where `organizerId === session.userId` with related contestant and vote count aggregates.
  - Client Component (`EventsDashboardClient.tsx`): Receives the serializable event DTOs and initial stats, managing reactive keyword search, status filter pills, pagination, and toast feedback.

### Decision 3: URL State Synchronization (`nuqs`)

- **Context**: Per VoteSphere Constitution §III, search parameters and filter criteria must be synchronized via `nuqs`.
- **Decision**:
  - `status`: `parseAsStringLiteral(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"]).withDefault("ALL")`
  - `q`: `parseAsString.withDefault("")`
  - `page`: `parseAsInteger.withDefault(1)`
  - All search param consumers are wrapped within explicit `<Suspense>` boundaries.

### Decision 4: Multi-Tenant Data Aggregation & Security

- **Context**: Need accurate summary cards (_Total Events_, _Live / Active_, _Total Candidates_, _Total Votes Cast_) without leaking data from other organizers.
- **Decision**:
  - Query uses Prisma `prisma.event.findMany` with `where: { organizerId: session.userId }` and `include: { _count: { select: { contestants: true, votes: true } } }`.
  - Compute Live/Active count on server/client using: `publicationStatus === "PUBLISHED" && startsAt <= now && now <= endsAt`.

---

## 2. Best Practices & Constitution Alignment

1. **Strict Type Safety (§I)**:
   - Define explicit TypeScript interfaces `OrganizerEventItemDto`, `DashboardMetricsDto`, and Zod query schema `dashboardQuerySchema`.
   - Zero `any` and zero non-null assertions `!`.
2. **Server-First Boundary Isolation (§II)**:
   - Server component handles data fetching and redirects; client component handles UI filters and clipboard copy.
3. **Colocation & Modular Architecture (§V)**:
   - Colocate dashboard overview components under `src/features/events/components/dashboard-overview/` and types under `src/features/events/types/`.
