# Tasks: Event Creation Service, Zod Schema & Slug Availability Verification API

**Branch**: `010-event-creation-service` | **Feature Directory**: `specs/010-event-creation-service` | **Spec**: [specs/010-event-creation-service/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/010-event-creation-service/spec.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared DTOs for event creation and slug verification.

- [x] T001 Define `CreateEventInput`, `CreateEventResult`, `CheckSlugResult`, and `CheckSlugQuery` interfaces in `src/features/events/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation schemas and validation unit tests that all user stories depend on.

- [x] T002 [P] Implement `RESERVED_SLUGS`, `eventSlugSchema`, `checkSlugQuerySchema`, and `createEventSchema` with 1-hour temporal refinement in `src/lib/validations/event.ts`
- [x] T003 [P] Implement unit tests for `createEventSchema`, reserved slug blocking, and temporal refinement in `tests/unit/events/create-event-validation.test.ts`

**Checkpoint**: Core validation schemas and tests passing — user story implementation can proceed.

---

## Phase 3: User Story 1 - Secure Multi-Tenant Event Creation & Initial Audit Trail (Priority: P1) 🎯 MVP

**Goal**: Authenticated organizers can create events persisted atomically with `DRAFT` status, default voting rules, and an initial `EVENT_CREATED` audit log entry.

**Independent Test**: Can be verified by executing `createEvent` / `createEventAction` with valid input from an authenticated session and verifying database records in `Event` and `EventAuditLog`.

### Tests for User Story 1

- [x] T004 [P] [US1] Create unit tests for atomic event creation and audit logging in `tests/unit/events/create-event-service.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Implement atomic event creation service `createEvent` in `src/features/events/services/create-event.ts` (using `db.$transaction` for `Event` + `EventAuditLog`)
- [x] T006 [US1] Implement Server Action `createEventAction` in `src/features/events/actions/create-event.ts`
- [x] T007 [US1] Implement `POST /api/events` Route Handler returning `ApiResponse<Event>` with HTTP 201 in `src/app/api/events/route.ts`

**Checkpoint**: User Story 1 is functional — organizers can create events with complete audit trails.

---

## Phase 4: User Story 2 - Real-Time Slug Availability & Format Verification (Priority: P2)

**Goal**: Fast endpoint `/api/events/check-slug` providing instant feedback on whether a candidate slug is available, reserved, or already taken.

**Independent Test**: Querying `/api/events/check-slug?slug=[value]` returns `{ available: true }` for free slugs and `{ available: false }` for collisions or reserved keywords.

### Tests for User Story 2

- [x] T008 [P] [US2] Create unit tests for slug verification in `tests/unit/events/check-slug.test.ts`

### Implementation for User Story 2

- [x] T009 [US2] Implement Route Handler `GET /api/events/check-slug/route.ts` checking `RESERVED_SLUGS` and case-insensitive Prisma search

**Checkpoint**: User Stories 1 and 2 functional — forms can perform live slug verification before creating events.

---

## Phase 5: User Story 3 - Strict Schema Boundary Validation & Temporal Guardrails (Priority: P3)

**Goal**: Guard against malformed payloads, reserved slug submissions, and non-compliant timelines (`endsAt < startsAt + 1h`) with clear field-level error messages.

**Independent Test**: Submitting invalid payloads returns HTTP 400 (or action error) with structured field error mappings.

### Tests & Implementation for User Story 3

- [x] T010 [P] [US3] Add boundary edge case tests for temporal delta (< 1 hour) and malformed URL validations in `tests/unit/events/create-event-validation.test.ts`
- [x] T011 [US3] Implement structured Zod issue formatting and field error mappings in `src/features/events/actions/create-event.ts` and `src/app/api/events/route.ts`

**Checkpoint**: User Stories 1, 2, and 3 functional — strict boundary validation prevents all bad data entries.

---

## Phase 6: User Story 4 - Unauthorized Request Interception (Priority: P4)

**Goal**: Ensure all unauthenticated requests to create events or actions are intercepted and rejected with 401 Unauthorized.

**Independent Test**: Sending requests without valid session tokens returns HTTP 401 Unauthorized before DB logic runs.

### Tests & Implementation for User Story 4

- [x] T012 [P] [US4] Add authentication failure tests in `tests/unit/events/create-event-service.test.ts`
- [x] T013 [US4] Enforce session verification via `getSession()` in `src/features/events/services/create-event.ts` and verify 401 handling in `src/app/api/events/route.ts`

**Checkpoint**: All user stories functional and secured.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Exports, integration verification, and code quality gates.

- [x] T014 [P] Re-export schemas, actions, types, and services in `src/features/events/index.ts`
- [x] T015 Run full validation suite per `quickstart.md` (`npm run test`, `npm run typecheck`, `npm run lint`, `npm run format:check`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 — deliver MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1.
- **User Story 3 (Phase 5)**: Depends on Phase 3 and Phase 4.
- **User Story 4 (Phase 6)**: Depends on Phase 3.
- **Polish (Phase 7)**: Depends on Phases 1–6.

---

## Parallel Opportunities

- `T002` and `T003` (Phase 2) can run in parallel.
- `T004` (US1 test) and `T008` (US2 test) can run in parallel.
- `T010` (US3 test) and `T012` (US4 test) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational schemas).
2. Implement Phase 3 (User Story 1 - Atomic event creation service + action + route).
3. Validate User Story 1 with automated tests (`tests/unit/events/create-event-service.test.ts`).

### Incremental Delivery

1. Add Phase 4 (Slug availability check).
2. Add Phase 5 (Temporal refinement & field error mapping).
3. Add Phase 6 (Auth guard enforcement & 401 tests).
4. Run Phase 7 (Quality gates & typechecking).
