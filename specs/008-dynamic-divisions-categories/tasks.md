# Tasks: Dynamic Divisions & Award Categories Data Model and API

**Feature**: `008-dynamic-divisions-categories`  
**Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/008-dynamic-divisions-categories/spec.md) | **Plan**: [plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/008-dynamic-divisions-categories/plan.md)  
**Date**: 2026-09-27

---

## Phase 1: Setup (Schema Migration & Types)

**Purpose**: Database schema expansion, Prisma client generation, Zod schemas, and TypeScript domain types

- [x] T001 Update `prisma/schema.prisma` with `Division` model, enhanced `AwardCategory` (`displayOrder Int @default(0)`), and updated `Contestant` relation (`divisionId String?`), and execute Prisma migration + client generation
- [x] T002 [P] Create Zod validation schemas for competition divisions (`createDivisionSchema`, `updateDivisionSchema`) in `src/lib/validations/division.ts`
- [x] T003 [P] Create Zod validation schemas for award categories (`createAwardCategorySchema`, `updateAwardCategorySchema`) in `src/lib/validations/category-awards.ts`
- [x] T004 [P] Define TypeScript domain types (`DivisionDto`, `AwardCategoryDto`, `EventTaxonomyDto`) in `src/features/events/types/index.ts`

---

## Phase 2: Foundational (Validation Tests & Test Harness)

**Purpose**: Validation test harness for schemas and input boundaries

**⚠️ CRITICAL**: Must complete before Route Handlers and mutations can be implemented

- [x] T005 [P] Implement unit tests for division validation schemas in `tests/unit/events/division-validation.test.ts`
- [x] T006 [P] Implement unit tests for award category validation schemas in `tests/unit/events/category-validation.test.ts`

**Checkpoint**: Foundation ready — Zod validation schemas and data models fully tested.

---

## Phase 3: User Story 1 - Create & Configure Custom Competition Divisions (Priority: P1) 🎯 MVP

**Goal**: Authenticated event organizers dynamically create and retrieve custom competition divisions per event with event-scoped uniqueness and display ordering.

**Independent Test**: Submit division creation requests via `POST /api/events/[slug]/divisions` and query `GET /api/events/[slug]/divisions`, verifying divisions persist with unique names and sequential display orders.

### Tests for User Story 1

- [x] T007 [P] [US1] Implement unit tests for divisions route handlers (`GET/POST /api/events/[slug]/divisions`) in `tests/unit/events/dynamic-divisions.test.ts`

### Implementation for User Story 1

- [x] T008 [US1] Implement Route Handlers for listing and creating event divisions with Zod parsing, event-scoped uniqueness, and ownership verification in `src/app/api/events/[slug]/divisions/route.ts`

**Checkpoint**: At this point, User Story 1 is fully functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - Create & Configure Custom Award Categories (Priority: P2)

**Goal**: Authenticated event organizers create and configure custom award categories per event with voting availability toggle (`isVotingOpen`) and display ordering.

**Independent Test**: Create award categories with `POST /api/events/[slug]/award-categories` and query `GET /api/events/[slug]/award-categories`, confirming proper persistence and validation.

### Tests for User Story 2

- [x] T009 [P] [US2] Implement unit tests for award categories route handlers (`GET/POST /api/events/[slug]/award-categories`) in `tests/unit/events/award-categories.test.ts`

### Implementation for User Story 2

- [x] T010 [US2] Implement Route Handlers for listing and creating award categories with Zod parsing, display order, voting toggle, and event-scoped uniqueness in `src/app/api/events/[slug]/award-categories/route.ts`

**Checkpoint**: User Stories 1 and 2 are both functional and independently testable.

---

## Phase 5: User Story 3 - Unified Retrieval of Event Taxonomy (Priority: P3)

**Goal**: Clients retrieve all configured divisions and award categories for an event in a single structured taxonomy payload sorted by display order.

**Independent Test**: Send `GET /api/events/[slug]/categories` and verify the returned envelope contains `{ divisions: [...], awardCategories: [...] }` correctly sequenced by `displayOrder`.

### Tests for User Story 3

- [x] T011 [P] [US3] Implement unit tests for unified taxonomy endpoint in `tests/unit/events/event-taxonomy.test.ts`

### Implementation for User Story 3

- [x] T012 [US3] Update `src/app/api/events/[slug]/categories/route.ts` to return unified event taxonomy (`EventTaxonomyDto` with divisions and award categories) sorted by `displayOrder`

**Checkpoint**: User Stories 1, 2, and 3 are complete and independently functional.

---

## Phase 6: User Story 4 - Division & Category Lifecycle Management (Priority: P4)

**Goal**: Organizers update division/category metadata and delete items with referential integrity safeguards that prevent deleting items with linked contestants or votes.

**Independent Test**: Issue `PATCH` and `DELETE` requests to `/api/events/[slug]/divisions/[divisionId]` and `/api/events/[slug]/award-categories/[categoryId]`, verifying successful updates and rejection of deletion when contestants are linked.

### Implementation for User Story 4

- [x] T013 [US4] Implement Route Handlers for updating and deleting individual divisions with contestant dependency guard in `src/app/api/events/[slug]/divisions/[divisionId]/route.ts`
- [x] T014 [US4] Implement Route Handlers for updating and deleting individual award categories with contestant assignment dependency guard in `src/app/api/events/[slug]/award-categories/[categoryId]/route.ts`
- [x] T015 [P] [US4] Implement unit tests for division and category mutation/deletion lifecycle and constraint checks in `tests/unit/events/taxonomy-lifecycle.test.ts`

**Checkpoint**: All user stories (US1–US4) are fully functional with complete lifecycle operations.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, static analysis, and end-to-end test validation

- [x] T016 Run static analysis, type checking, and linting (`npm run typecheck`, `npm run lint`, `npm run format:check`)
- [x] T017 Run full test suite (`npx vitest run`) and validate all scenarios from `specs/008-dynamic-divisions-categories/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 (Schema & Types) — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2.
- **User Story 2 (Phase 4)**: Depends on Phase 2.
- **User Story 3 (Phase 5)**: Depends on Phase 3 and Phase 4 (reads both divisions and award categories).
- **User Story 4 (Phase 6)**: Depends on Phase 3 and Phase 4 (mutates/deletes divisions and award categories).
- **Polish (Phase 7)**: Runs after all user story phases are implemented.

### Parallel Opportunities

- Phase 1: `T002` (division schemas), `T003` (category schemas), and `T004` (domain types) can execute in parallel after `T001`.
- Phase 2: `T005` (division tests) and `T006` (category tests) can execute in parallel.
- User Stories: Once Phase 2 is complete, US1 (`T007`, `T008`) and US2 (`T009`, `T010`) can be implemented in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Prisma schema migration, Zod validation, Types).
2. Complete Phase 2 (Validation unit tests).
3. Complete Phase 3 (US1 - Custom Divisions Route Handlers & Tests).
4. **STOP and VALIDATE**: Verify custom division creation and retrieval independently.

### Incremental Delivery

1. Foundation ready (Phase 1 + Phase 2).
2. Add US1 (Custom Divisions API) $\rightarrow$ Test & Deliver MVP.
3. Add US2 (Custom Award Categories API) $\rightarrow$ Test & Deliver.
4. Add US3 (Unified Event Taxonomy Read API) $\rightarrow$ Test & Deliver.
5. Add US4 (Lifecycle Management & Deletion Safeguards) $\rightarrow$ Test & Deliver.
6. Polish, Typecheck, and Test suite validation (Phase 7).
