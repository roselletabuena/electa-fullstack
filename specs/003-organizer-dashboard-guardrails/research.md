# Phase 0 Research: Organizer Dashboard Route & Ownership Authorization Guardrails

**Feature**: `003-organizer-dashboard-guardrails`  
**Date**: 2026-09-27  
**Status**: Completed

---

## Technical Context & Decisions

### Decision 1: Server-Side Event Ownership Authorization Pattern

- **Decision**: Implement a reusable server-side authorization helper `requireEventOwnership(slug: string)` colocated under `src/features/events/utils/ownership-guard.ts` and utilized within React Server Components (RSC) and Server Actions.
- **Rationale**:
  - In Next.js 16 App Router, database-backed ownership checks (`event.organizerId === session.userId`) require querying the database with the event `slug`. Middleware runs on Edge/Node runtime and should not execute heavy database queries; placing the ownership authorization directly in the RSC page/layout server entry point satisfies defense-in-depth (§IV) while keeping queries efficient.
  - If unauthenticated, `requireEventOwnership` immediately triggers `redirect('/login?redirect=/dashboard/events/' + slug + '/settings')`.
  - If the event does not exist, it triggers Next.js `notFound()`.
  - If authenticated but `event.organizerId !== session.userId`, it returns an explicit unauthorized state resulting in rendering an accessible 403 Forbidden error view.
- **Alternatives Considered**:
  - _Middleware-only auth_: Rejected because middleware does not have direct access to Prisma or the database to verify event ownership by slug without making external API calls.
  - _Client-side authorization check (`useEffect`)_: Rejected because client-side auth leaks protected shell components and causes layout shifts / security vulnerabilities.

---

### Decision 2: Dashboard Navigation Shell & Tab State Management via `nuqs`

- **Decision**: Implement the organizer settings navigation tabs (General, Schedule, Voting Rules) using `nuqs` (`useQueryState`) or searchParams in RSC with a client tab controller wrapped in `<Suspense>`, defaulting to `tab=general`.
- **Rationale**:
  - Enforces VoteSphere Constitution §III ("URL State: Search parameters, pagination, and filter criteria MUST be synchronized via `nuqs`").
  - Deep-linking directly to `/dashboard/events/[slug]/settings?tab=schedule` or `?tab=voting-rules` works seamlessly on initial server render as well as during client interactions.
  - Keeps all settings sections within a unified `/dashboard/events/[slug]/settings` controller while retaining bookmarkable tab state.
- **Alternatives Considered**:
  - _Nested App Router sub-routes (`/settings/general`, `/settings/schedule`)_: Adds unnecessary routing boilerplate and duplicate layout files for a single settings portal.
  - _Unsynchronized client state (`useState`)_: Violates Constitution §III and prevents deep-linking or browser back/forward navigation across tabs.

---

### Decision 3: Unauthorized (403) and Unauthenticated Flow UX

- **Decision**:
  - Unauthenticated visitors: Server-side `redirect("/login?redirect=" + encodeURIComponent(currentPath))`.
  - Authenticated non-owners: Render a dedicated, accessible `<ForbiddenAccessCard />` component within the dashboard shell (or page level) displaying an HTTP 403 error status code, clear explanation ("You do not have administrative permissions to configure this event"), and navigation buttons ("Back to Events", "Go to Home").
  - Non-existent slugs: Trigger standard `notFound()`.
- **Rationale**:
  - Provides clear, non-leaking feedback to users without exposing confidential configuration controls or data.
  - Meets WCAG AA accessibility standards with accessible headings, contrast ratios, and keyboard-focusable action links.
- **Alternatives Considered**:
  - _Generic 404 for unauthorized users_: Obscures access issues and makes troubleshooting difficult for legitimate multi-account organizers.
  - _Silent redirect to root_: Confuses users without explaining why their requested action was denied.

---

### Decision 4: Read-Only Parameter Summary Cards for Baseline Slice

- **Decision**: In this foundational guardrail slice (VS-32), render clean read-only summary panels in `GeneralSettingsTab`, `ScheduleSettingsTab`, and `VotingRulesSettingsTab`.
- **Rationale**:
  - Establishes the exact UI contract and layout framing for downstream stories (VS-33: General settings, VS-34: Timeline schedule adjustments, VS-35: Voting rules configuration) without creating dummy form mutations.
  - Organizers immediately see event slug, title, operational window (`startsAt`, `endsAt`), publication status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and rule summaries.
- **Alternatives Considered**:
  - _Empty placeholders with no data_: Misses the opportunity to validate end-to-end data fetching for authorized owners.
