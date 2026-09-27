# Route & Interface Contract: Organizer Dashboard Settings

**Feature**: `003-organizer-dashboard-guardrails`  
**Date**: 2026-09-27  
**Status**: Active

---

## 1. Page Route Contract

### Route: `GET /dashboard/events/[slug]/settings`

- **Component Type**: Next.js 16 React Server Component (RSC)
- **File Location**: `src/app/(dashboard)/events/[slug]/settings/page.tsx`
- **Layout Location**: `src/app/(dashboard)/events/[slug]/layout.tsx` (or `src/app/(dashboard)/layout.tsx`)

### Parameters

- **Path Parameters**:
  - `slug` (string, required): Lowercase alphanumeric slug identifying the target event.
- **Search Parameters**:
  - `tab` (string, optional): One of `"general" | "schedule" | "voting-rules"`. Default: `"general"`.

---

## 2. Server-Side Guardrail Contract

### Function: `requireEventOwnership(slug: string)`

- **Module**: `src/features/events/utils/ownership-guard.ts`
- **Signature**: `async function requireEventOwnership(slug: string): Promise<OwnershipCheckResult>`

#### Execution Logic

```text
1. Fetch session from getSession()
2. If session is null -> return { authorized: false, reason: "UNAUTHENTICATED" }
3. Query Prisma DB for Event by unique slug
4. If event is null -> return { authorized: false, reason: "NOT_FOUND" }
5. If event.organizerId !== session.userId -> return { authorized: false, reason: "UNAUTHORIZED", session, eventTitle: event.title }
6. Return { authorized: true, event, session }
```

---

## 3. Response Behaviors

| Scenario                     | HTTP / Next.js Action                          | Rendered Output / Destination                                                        |
| :--------------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Unauthenticated**          | `redirect("/login?redirect=...")`              | 307/302 Redirect to `/login` preserving target return URL                            |
| **Non-existent slug**        | `notFound()`                                   | Standard 404 Not Found Page                                                          |
| **Unauthorized (Not Owner)** | HTTP 403 status (or `<ForbiddenAccessCard />`) | Error card displaying "403 Forbidden - Access Denied" with return buttons            |
| **Authorized Owner**         | 200 OK                                         | Full `<OrganizerDashboardShell />` + `<EventSettingsView />` with active tab content |

---

## 4. UI Component Hierarchy & Contract

```text
src/app/(dashboard)/events/[slug]/settings/page.tsx (RSC)
├── <OrganizerDashboardHeader event={event} user={session} />
├── <Suspense fallback={<SettingsTabSkeleton />}>
│   └── <SettingsTabNav activeTab={tab} slug={slug} />
└── <SettingsTabContent activeTab={tab}>
    ├── [tab === 'general'] -> <GeneralSettingsSummaryCard event={event} />
    ├── [tab === 'schedule'] -> <ScheduleSettingsSummaryCard event={event} />
    └── [tab === 'voting-rules'] -> <VotingRulesSettingsSummaryCard event={event} />
```
