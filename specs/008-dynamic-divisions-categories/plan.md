# Implementation Plan: Dynamic Divisions & Award Categories Data Model and API

**Branch**: `008-dynamic-divisions-categories` | **Date**: 2026-09-27 | **Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/008-dynamic-divisions-categories/spec.md)

**Input**: Feature specification from `/specs/008-dynamic-divisions-categories/spec.md` (Jira: [VS-36](https://the-three-devsketeers.atlassian.net/browse/VS-36))

## Summary

Implement database-backed dynamic competition divisions and enhanced award categories, replacing static global enums with flexible, event-scoped custom taxonomy. Define a new `Division` model, extend the `AwardCategory` model with `displayOrder`, update `Contestant` relations, and expose Zod-validated REST Route Handlers (`GET/POST /api/events/[slug]/divisions`, `PATCH/DELETE /api/events/[slug]/divisions/[divisionId]`, `GET/POST /api/events/[slug]/award-categories`, and unified `GET /api/events/[slug]/categories`) protected by Cognito session ownership checks.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, zero `any`, zero non-null assertions `!`)  
**Primary Dependencies**: Next.js 16 (App Router Route Handlers & RSC), Zod schemas, Prisma ORM  
**Storage**: PostgreSQL via Supabase with Prisma ORM (`prisma/schema.prisma`, `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/`)  
**Target Platform**: Node.js 20+ Server (Next.js 16 App Router)  
**Project Type**: Next.js 16 Web Application (API / Backend)  
**Performance Goals**: Taxonomy query response < 200ms; mutation validation & DB persistence < 500ms  
**Constraints**: Event-scoped uniqueness `@@unique([eventId, name])`; deletion guards preventing removal of items with assigned contestants/votes; strict multi-tenant authorization (`requireEventOwnership`)  
**Scale/Scope**: Arbitrary divisions and award tracks per event across multi-tenant organizer accounts

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Compliance Check                                                                                                                                                                 | Status |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **I. Strict Type Safety & Boundary Validation**           | Input payloads validated against Zod schemas in `src/lib/validations/category-awards.ts` and `src/lib/validations/division.ts`. Strict TypeScript typing with zero `any` or `!`. | Passed |
| **II. Server-First & Boundary Isolation (Next.js 16)**    | Route Handlers return standardized `ApiResponse<T>` envelopes. Dynamic request context (`params`) awaited.                                                                       | Passed |
| **III. Strict State Separation & Single Source of Truth** | Prisma schema is the single source of truth for `Division` and `AwardCategory` entities via singleton `src/lib/db.ts`.                                                           | Passed |
| **IV. Secure-by-Design & Auth Integrity**                 | All mutation endpoints verify authenticated organizer ownership (`requireEventOwnership(slug)` / `getSession()`).                                                                | Passed |
| **V. Feature Colocation & Modular Architecture**          | Colocated types and utilities under `src/features/events/types/` and validation schemas in `src/lib/validations/`.                                                               | Passed |
| **VI. Test-First Quality Gates**                          | Comprehensive Vitest unit tests in `tests/unit/events/dynamic-divisions.test.ts` and `tests/unit/events/award-categories.test.ts`.                                               | Passed |

## Project Structure

### Documentation (this feature)

```text
specs/008-dynamic-divisions-categories/
├── plan.md                       # Implementation Plan (/speckit-plan output)
├── research.md                   # Phase 0 Architecture decisions & schema findings
├── data-model.md                 # Phase 1 Prisma schema, Zod validation & domain types
├── quickstart.md                 # Phase 1 Test execution & manual validation guide
├── contracts/
│   ├── divisions-api.md          # REST API specifications for divisions endpoints
│   ├── award-categories-api.md   # REST API specifications for award categories endpoints
│   └── event-taxonomy-api.md     # Unified taxonomy read contract
└── checklists/
    └── requirements.md           # Specification quality checklist
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                                      # Added Division model, updated AwardCategory & Contestant

src/
├── app/api/events/[slug]/
│   ├── categories/
│   │   └── route.ts                                   # Unified taxonomy retrieval & award categories handler
│   ├── award-categories/
│   │   ├── route.ts                                   # List / Create award categories
│   │   └── [categoryId]/
│   │       └── route.ts                               # Update / Delete award category
│   └── divisions/
│       ├── route.ts                                   # List / Create divisions
│       └── [divisionId]/
│           └── route.ts                               # Update / Delete division
│
├── features/events/
│   └── types/
│       └── index.ts                                   # DivisionDto, AwardCategoryDto, EventTaxonomyDto
│
├── lib/
│   └── validations/
│       ├── category-awards.ts                         # Zod schemas for Award Categories
│       └── division.ts                                # Zod schemas for Divisions
│
└── tests/
    └── unit/
        └── events/
            ├── dynamic-divisions.test.ts              # Unit tests for division validation & CRUD
            └── award-categories.test.ts               # Unit tests for category validation & CRUD
```

**Structure Decision**: Colocated Route Handlers under `src/app/api/events/[slug]/`, schemas under `src/lib/validations/`, domain types under `src/features/events/types/`, and automated tests in `tests/unit/events/`.

## Complexity Tracking

> No constitutional violations or unwarranted complexity introduced.
