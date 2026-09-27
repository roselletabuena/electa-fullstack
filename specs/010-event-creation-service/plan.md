# Implementation Plan: Event Creation Service, Zod Schema & Slug Availability Verification API

**Branch**: `010-event-creation-service` | **Date**: 2026-09-27 | **Spec**: [specs/010-event-creation-service/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/010-event-creation-service/spec.md)

**Input**: Feature specification from `specs/010-event-creation-service/spec.md`

---

## Summary

Deliver a production-ready, strictly validated backend layer for event creation. This includes:

1. A Zod validation schema (`createEventSchema`) enforcing title length, slug formatting & reserved word checks, description length, URL formatting, and temporal guardrails (`endsAt >= startsAt + 1 hour`).
2. A fast, case-insensitive slug availability endpoint (`GET /api/events/check-slug`).
3. An atomic multi-tenant event creation service (`createEvent`) executing inside a Prisma database transaction that provisions the `Event` record (with `DRAFT` status and default voting rules) along with an initial `EVENT_CREATED` entry in `EventAuditLog`.
4. Consumer entry points via a Server Action (`createEventAction`) and a REST Route Handler (`POST /api/events`).

---

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode enabled)  
**Primary Dependencies**: Next.js 16 (App Router), Zod, Prisma Client, `@t3-oss/env-nextjs`  
**Storage**: PostgreSQL (via Prisma singleton `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/events/`)  
**Target Platform**: Node.js / Next.js Server Components, Server Actions & Route Handlers  
**Project Type**: Fullstack Web Application (Vertical Slice Feature Architecture)  
**Performance Goals**: Slug availability check < 50ms latency (p95); Event creation transaction < 150ms  
**Constraints**: Zero `any` types; 100% boundary validation; Atomic Prisma transaction for Event + Audit Log; Strict multi-tenant isolation via Cognito JWT  
**Scale/Scope**: Support thousands of concurrent event drafting and slug validation requests

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Check / Constraint                                                                                                                   |  Status  |
| :-------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| **I. Strict Type Safety & Boundary Validation**           | Zod schema validation for all inputs (`createEventSchema`, `checkSlugQuerySchema`). Zero `any` or `!`.                               | **PASS** |
| **II. Server-First & Boundary Isolation**                 | Server Actions for UI forms; standard `ApiResponse<T>` envelope for Route Handlers; awaited async Next.js APIs.                      | **PASS** |
| **III. Strict State Separation & Single Source of Truth** | Prisma singleton used for all DB access; single source of truth in PostgreSQL.                                                       | **PASS** |
| **IV. Secure-by-Design & Auth Integrity**                 | Session extraction via `getSession()`; `organizerId` bound to authenticated session; zero raw `process.env`.                         | **PASS** |
| **V. Feature Colocation & Modular Architecture**          | Actions colocated in `src/features/events/actions/`, services in `src/features/events/services/`, schemas in `src/lib/validations/`. | **PASS** |
| **VI. Test-First & Zero-Regression Quality Gates**        | Comprehensive Vitest unit tests in `tests/unit/events/` covering validation, slug check, and creation service.                       | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/010-event-creation-service/
├── plan.md              # This file
├── research.md          # Phase 0 architectural decisions
├── data-model.md        # Data models, Zod schemas & TypeScript DTOs
├── quickstart.md        # Validation & test execution guide
├── contracts/           # API and Server Action contracts
│   ├── check-slug-api.md
│   └── create-event-api.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/
├── app/
│   └── api/
│       └── events/
│           ├── check-slug/
│           │   └── route.ts          # Slug availability route handler
│           └── route.ts              # POST /api/events handler
├── features/
│   └── events/
│       ├── actions/
│       │   └── create-event.ts       # Server Action for form submissions
│       ├── services/
│       │   └── create-event.ts       # Core atomic event creation business logic
│       └── types/
│           └── index.ts              # Exported DTOs & event action types
└── lib/
    └── validations/
        └── event.ts                  # Zod schemas (createEventSchema, checkSlugSchema)

tests/
└── unit/
    └── events/
        ├── check-slug.test.ts        # Slug check endpoint unit tests
        ├── create-event-service.test.ts # Core service & audit logging tests
        └── create-event-validation.test.ts # Zod schema & temporal refinement tests
```

**Structure Decision**: Vertical slice architecture under `src/features/events/` paired with standard Next.js Route Handlers in `src/app/api/events/` and centralized validations in `src/lib/validations/event.ts`.

---

## Complexity Tracking

> No constitutional violations or unwarranted complexity introduced.
