# Implementation Plan: Organizer Event Operational Schedule & Publication Lifecycle Controls

**Branch**: `006-organizer-schedule-lifecycle` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-organizer-schedule-lifecycle/spec.md`

## Summary

Deliver full organizer control over event voting operational schedules (`startsAt` / `endsAt`), publication lifecycle states (`DRAFT` / `PUBLISHED` / `ARCHIVED`), and draft review passphrases by replacing the static summary card with an interactive `ScheduleLifecycleForm` on the "Schedule & Timeline" settings tab. The implementation features strict Zod boundary validation (enforcing `endsAt > startsAt` and valid passphrase constraints), server-side ownership authorization guards, bcrypt passphrase hashing, immutable `EventAuditLog` transactions with before/after state snapshots, and accessible modal confirmation dialogs for high-impact lifecycle transitions.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, zero `any`, zero non-null assertions `!`)  
**Primary Dependencies**: Next.js 16 (App Router RSC & Server Actions), React 19, Tailwind CSS 4, Radix UI (AlertDialog / Modal, Select, Input), React Hook Form, `@hookform/resolvers/zod`, Zod schemas, bcryptjs, Sonner / Toast  
**Storage**: PostgreSQL via Supabase with Prisma ORM (`prisma/schema.prisma`, `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/`)  
**Target Platform**: Node.js 20+ Server (Next.js 16 App Router)  
**Project Type**: Next.js 16 Web Application  
**Performance Goals**: UI inputs and validation response < 50ms; form submission and audit log creation < 600ms  
**Constraints**: `endsAt` strictly after `startsAt`; draft passphrase minimum 4 characters when set; passwords never logged or returned in plain text; server-side ownership guard enforced on mutations; strict WCAG 2.1 AA accessibility compliance; immutable audit records  
**Scale/Scope**: Multi-tenant event organizer configuration with complete audit trail history

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Compliance Check                                                                                                                                                                              | Status |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **I. Strict Type Safety & Boundary Validation**           | Input payload validated using Zod schemas (`src/lib/validations/event-schedule-lifecycle.ts`). Form managed with React Hook Form + Zod resolver. Zero `any` or `!`.                           | Passed |
| **II. Server-First & Boundary Isolation (Next.js 16)**    | Settings page remains RSC; form interactivity is encapsulated in `"use client"` components (`ScheduleLifecycleForm`). Mutations use authenticated Server Actions.                             | Passed |
| **III. Strict State Separation & Single Source of Truth** | Prisma database models `Event` and `EventAuditLog` are the single source of truth. Server Action updates DB atomically and calls `revalidatePath`.                                            | Passed |
| **IV. Secure-by-Design & Auth Integrity**                 | Server Action enforces `requireEventOwnership(slug)` checking Cognito session `userId === event.organizerId`. Passphrases securely hashed via bcrypt. Zero `process.env` bypasses.            | Passed |
| **V. Feature Colocation & Modular Architecture**          | Colocated in `src/features/events/` (`components/dashboard/`, `actions/`, `types/`). UI primitives from `src/components/ui/`. Named exports used.                                             | Passed |
| **VI. Test-First Quality Gates**                          | Vitest unit tests in `tests/unit/events/schedule-lifecycle-validation.test.ts` and `tests/unit/events/update-schedule-lifecycle-action.test.ts`. Pre-commit linter/formatting gates enforced. | Passed |

## Project Structure

### Documentation (this feature)

```text
specs/006-organizer-schedule-lifecycle/
├── plan.md                                    # Implementation Plan (/speckit-plan output)
├── research.md                                # Phase 0 Architecture decisions & schema findings
├── data-model.md                              # Phase 1 Prisma schema, Zod validation & domain types
├── quickstart.md                              # Phase 1 Test execution & manual validation guide
├── contracts/
│   └── schedule-lifecycle-settings.md        # Phase 1 Server action & UI contract
└── checklists/
    └── requirements.md                        # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── features/events/
│   ├── actions/
│   │   └── update-schedule-lifecycle.ts       # Server Action for updating schedule, lifecycle & draft passphrase
│   ├── components/
│   │   └── dashboard/
│   │       ├── ScheduleLifecycleForm.tsx      # Interactive React Hook Form for Schedule & Timeline tab
│   │       └── ScheduleSettingsSummaryCard.tsx# Retained/embedded for high-level summary overview
│   └── types/
│       └── index.ts                           # Extended ScheduleLifecycleSnapshot & response types
│
├── lib/
│   └── validations/
│       └── event-schedule-lifecycle.ts        # Zod schemas for schedule and lifecycle validation
│
└── tests/
    └── unit/
        └── events/
            ├── schedule-lifecycle-validation.test.ts    # Zod validation schema unit tests
            └── update-schedule-lifecycle-action.test.ts # Server action & audit logging unit tests
```

**Structure Decision**: Vertical slice under `src/features/events/` integrating Server Actions (`actions/update-schedule-lifecycle.ts`), UI components (`components/dashboard/ScheduleLifecycleForm.tsx`), validation schemas (`lib/validations/event-schedule-lifecycle.ts`), and unit tests (`tests/unit/events/`).

## Complexity Tracking

> No constitutional violations or unwarranted complexity introduced.
