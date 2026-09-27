# Implementation Plan: Organizer Multi-Event Overview Dashboard & Management Portal

**Branch**: `007-organizer-events-dashboard` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-organizer-events-dashboard/spec.md`

## Summary

Deliver a centralized organizer dashboard at `/dashboard` (with `/events` redirect) providing multi-event discovery, aggregate performance metrics (total events, live active voting events, registered contestants, cast votes), reactive keyword search, status filtering (`ALL`, `PUBLISHED`, `DRAFT`, `ARCHIVED`), client-side pagination (12 cards/page), quick-action links (`/contestants`, `/settings`, clipboard URL sharing), and an onboarding empty state. The implementation strictly adheres to the VoteSphere Constitution using React Server Components for authenticated data queries, `nuqs` for URL synchronization, and client-side interaction components.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, zero `any`, zero non-null assertions `!`)  
**Primary Dependencies**: Next.js 16 (App Router RSC & Server Actions), React 19, Tailwind CSS 4, Radix UI (Input, Button, Card, Toast), Lucide React, `nuqs`, Zod  
**Storage**: PostgreSQL via Supabase with Prisma ORM (`prisma/schema.prisma`, `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/`)  
**Target Platform**: Node.js 20+ Server (Next.js 16 App Router)  
**Project Type**: Next.js 16 Web Application  
**Performance Goals**: Initial dashboard load < 800ms; reactive search/filter latency < 50ms  
**Constraints**: Multi-tenant data isolation (organizer sees only their own events); unauthenticated visitors redirected to `/login`; strict WCAG 2.1 AA accessibility  
**Scale/Scope**: Multi-event management command center for organizers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Compliance Check                                                                                                                                                                                | Status |
| :-------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **I. Strict Type Safety & Boundary Validation**           | Strict Zod validation on URL search parameters (`dashboardQuerySchema`). Explicit DTO interfaces (`OrganizerEventItemDto`, `DashboardMetricsDto`). Zero `any` or `!`.                           | Passed |
| **II. Server-First & Boundary Isolation (Next.js 16)**    | Route page is an RSC (`src/app/(dashboard)/page.tsx`); interactive filtering and clipboard interactions live in `"use client"` component (`EventsDashboardClient.tsx`) wrapped in `<Suspense>`. | Passed |
| **III. Strict State Separation & Single Source of Truth** | Prisma database models `Event`, `Contestant`, and `Vote` are the single source of truth. Filter parameters synchronized via `nuqs`.                                                             | Passed |
| **IV. Secure-by-Design & Auth Integrity**                 | Authenticates session via `getSession()`. Enforces strict multi-tenant filtering (`where: { organizerId: session.userId }`).                                                                    | Passed |
| **V. Feature Colocation & Modular Architecture**          | Colocated in `src/features/events/` (`components/dashboard-overview/`, `types/`, `utils/`). Named exports used for components and helpers.                                                      | Passed |
| **VI. Test-First Quality Gates**                          | Vitest unit tests in `tests/unit/events/dashboard-overview.test.ts`. Linting and formatting gates enforced.                                                                                     | Passed |

## Project Structure

### Documentation (this feature)

```text
specs/007-organizer-events-dashboard/
├── plan.md                                    # Implementation Plan
├── research.md                                # Phase 0 Architecture decisions & data queries
├── data-model.md                              # Phase 1 DTOs, schemas & domain types
├── quickstart.md                              # Phase 1 Test execution & manual verification
├── contracts/
│   └── events-dashboard.md                   # Phase 1 Server component & client contract
└── checklists/
    └── requirements.md                        # Specification quality checklist
```

### Source Code (planned implementation)

```text
src/
├── app/
│   └── (dashboard)/
│       ├── page.tsx                           # Server Component: /dashboard route handler
│       ├── loading.tsx                        # Loading skeleton for dashboard
│       └── events/
│           └── page.tsx                       # Server Component: redirects /events -> /dashboard
├── features/events/
│   ├── components/
│   │   └── dashboard-overview/
│   │       ├── EventsDashboardClient.tsx      # Client Component: search, filters, grid & pagination
│   │       ├── DashboardGreetingBanner.tsx    # Top greeting & quick action banner
│   │       ├── DashboardMetricsCards.tsx      # Summary statistics cards (4 metrics)
│   │       ├── EventCard.tsx                  # Individual event card with badges & action triggers
│   │       └── DashboardEmptyState.tsx        # Welcoming zero-state for new organizers
│   ├── types/
│   │   └── dashboard-overview.ts              # DTOs and type definitions
│   └── utils/
│       └── dashboard-metrics.ts               # Metric aggregation & live status helper functions
└── lib/
    └── validations/
        └── dashboard-query.ts                 # Zod validation for search & status queries

tests/
└── unit/
    └── events/
        └── dashboard-overview.test.ts         # Unit tests for query parsing & metric calculation
```
