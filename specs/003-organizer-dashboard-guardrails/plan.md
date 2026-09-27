# Implementation Plan: Organizer Dashboard Route & Event Ownership Authorization Guardrails

**Branch**: `003-organizer-dashboard-guardrails` | **Date**: 2026-09-27 | **Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/003-organizer-dashboard-guardrails/spec.md)

**Input**: Feature specification from `/specs/003-organizer-dashboard-guardrails/spec.md`

## Summary

Establish the organizer dashboard layout shell and enforce strict server-side ownership authorization for the event settings route (`/dashboard/events/[slug]/settings`). This implementation provides defense-in-depth protection ensuring unauthenticated visitors are redirected to `/login`, authenticated non-owners receive an accessible HTTP 403 Forbidden screen, and verified event owners have access to an administrative dashboard with deep-linkable navigation tabs (General, Schedule, Voting Rules) powered by `nuqs` URL state synchronization.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, zero `any`, zero non-null assertions `!`)  
**Primary Dependencies**: Next.js 16 (App Router RSC), React 19, Tailwind CSS 4, Radix UI / Lucide React, `nuqs` (URL search param synchronization), Zod schemas, React Hook Form  
**Storage**: PostgreSQL via Supabase with Prisma ORM (`prisma/schema.prisma`, `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/`)  
**Target Platform**: Node.js 20+ Server (Next.js 16 App Router)  
**Project Type**: Next.js 16 Web Application  
**Performance Goals**: Dashboard page initial load < 2.0s; tab transitions instantaneous with zero layout shifts; authorization check overhead < 50ms  
**Constraints**: Server-authoritative ownership evaluation before rendering any management controls; strict WCAG AA contrast and keyboard accessibility  
**Scale/Scope**: Multi-tenant event organizer isolation supporting hundreds of events and organizers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Compliance Check                                                                                                                                                                                                                                                   | Status |
| :-------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **I. Strict Type Safety & Boundary Validation**           | All slug route params and tab search parameters validated using Zod schemas (`src/lib/validations/event-settings.ts`). Zero `any` or `!`.                                                                                                                          | Passed |
| **II. Server-First & Boundary Isolation (Next.js 16)**    | `/dashboard/events/[slug]/settings/page.tsx` is an RSC performing server-side ownership checks via `requireEventOwnership`. Client interactivity (`SettingsTabNav`) isolated into `"use client"` wrapped in `<Suspense>`. Dynamic params and searchParams awaited. | Passed |
| **III. Strict State Separation & Single Source of Truth** | Prisma database model `Event` with `organizerId` is the single source of truth. URL state (`?tab=...`) synchronized via `nuqs`.                                                                                                                                    | Passed |
| **IV. Secure-by-Design & Auth Integrity**                 | Authenticated session verified via `getSession()` from `src/lib/auth/get-session.ts`. Strict server-side verification comparing `session.userId === event.organizerId`.                                                                                            | Passed |
| **V. Feature Colocation & Modular Architecture**          | Colocated in `src/features/events/` (`components/`, `types/`, `utils/`). Shared UI primitives used from `src/components/ui/`. Named exports used throughout.                                                                                                       | Passed |
| **VI. Test-First Quality Gates**                          | Automated unit tests in `tests/unit/events/ownership-guard.test.ts` and `tests/unit/events/event-settings-validation.test.ts`.                                                                                                                                     | Passed |

## Project Structure

### Documentation (this feature)

```text
specs/003-organizer-dashboard-guardrails/
├── plan.md              # Implementation Plan
├── research.md          # Architecture decisions & auth guard patterns
├── data-model.md        # Entities, session types, and Zod schemas
├── quickstart.md        # Validation scenarios & test commands
├── contracts/
│   └── dashboard-settings.md # Route and guardrail contract
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       └── events/
│           └── [slug]/
│               └── settings/
│                   ├── page.tsx                           # RSC settings entry point & ownership check
│                   └── loading.tsx                        # Skeleton fallback
│
├── features/events/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── OrganizerDashboardHeader.tsx               # Organizer header with event title & badge
│   │   │   ├── SettingsTabNav.tsx                         # nuqs-synchronized tab navigation bar
│   │   │   ├── ForbiddenAccessCard.tsx                    # Accessible HTTP 403 error card
│   │   │   ├── GeneralSettingsSummaryCard.tsx             # Read-only general info card
│   │   │   ├── ScheduleSettingsSummaryCard.tsx            # Read-only operational schedule card
│   │   │   └── VotingRulesSettingsSummaryCard.tsx         # Read-only voting rules summary card
│   ├── types/
│   │   └── index.ts                                       # SettingsTabId, SettingsTabConfig types
│   └── utils/
│       └── ownership-guard.ts                             # requireEventOwnership helper
│
├── lib/
│   └── validations/
│       └── event-settings.ts                              # Zod schemas for slug & tab query params
│
└── tests/
    └── unit/
        └── events/
            ├── ownership-guard.test.ts                    # Guardrail auth unit tests
            └── event-settings-validation.test.ts          # Zod schema validation tests
```

**Structure Decision**: Vertical slice in `src/features/events/` with Next.js 16 App Router route in `src/app/(dashboard)/events/[slug]/settings/page.tsx` and unit tests in `tests/unit/events/`.

## Complexity Tracking

> No constitutional violations or unwarranted complexity introduced.
