# Phase 1 Contract: Organizer Events Dashboard

**Branch**: `007-organizer-events-dashboard` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

## 1. Page Component Data Fetching Contract (`src/app/(dashboard)/page.tsx`)

- **Route**: `/dashboard` (GET)
- **Access**: Protected (Requires authenticated session with role `ORGANIZER` or valid user session).
- **Unauthenticated Behavior**: Redirects HTTP 307 to `/login?redirect=%2Fdashboard`.
- **Props Received**:
  - `searchParams`: `Promise<{ status?: string; q?: string; page?: string }>`
- **Data Flow**:
  1. Await `searchParams` and validate using `dashboardQuerySchema`.
  2. Call `getSession()`. If null, redirect to `/login`.
  3. Query `prisma.event.findMany` where `organizerId === session.userId`.
  4. Transform DB events into `OrganizerEventItemDto[]` and compute `DashboardMetricsDto`.
  5. Render `<EventsDashboardClient events={events} metrics={metrics} user={session} />` wrapped in `<Suspense>`.

---

## 2. Client Interactive Component Contract (`EventsDashboardClient.tsx`)

- **Props**:
  - `events`: `OrganizerEventItemDto[]`
  - `metrics`: `DashboardMetricsDto`
  - `user`: `SessionUser`
- **Internal Reactive State (via `nuqs`)**:
  - `status`: Synced to `?status=ALL|PUBLISHED|DRAFT|ARCHIVED`
  - `q`: Synced to `?q=<search_text>`
  - `page`: Synced to `?page=<number>`
- **Card Quick Actions**:
  - **Candidates**: Routes via Next.js `<Link>` to `/events/${slug}/contestants`.
  - **Settings**: Routes via Next.js `<Link>` to `/events/${slug}/settings`.
  - **Share Link**: Invokes `navigator.clipboard.writeText(origin + '/events/' + slug)` and triggers toast confirmation.
