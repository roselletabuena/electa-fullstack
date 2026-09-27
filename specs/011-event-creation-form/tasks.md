# Tasks: Dedicated Event Creation Page & Real-Time Slug Validation UI

**Branch**: `011-event-creation-form` | **Feature Directory**: `specs/011-event-creation-form` | **Spec**: [specs/011-event-creation-form/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/011-event-creation-form/spec.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and state structures for slug availability and form UI.

- [x] T001 Define `SlugAvailabilityStatus` and `SlugValidationState` in `src/features/events/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hook and badge component providing debounced slug availability verification and visual feedback.

- [x] T002 [P] Implement `useDebouncedSlugCheck` hook in `src/features/events/hooks/useDebouncedSlugCheck.ts`
- [x] T003 [P] Implement `SlugAvailabilityBadge` component in `src/features/events/components/SlugAvailabilityBadge.tsx`
- [x] T004 [P] Implement unit tests for `SlugAvailabilityBadge` in `tests/unit/events/slug-availability-badge.test.tsx`

**Checkpoint**: Foundational hook and badge ready — user story implementation can proceed.

---

## Phase 3: User Story 1 - Dedicated Event Creation Page & Protected Routing (Priority: P1) 🎯 MVP

**Goal**: Dedicated `/events/new` route guarded with session auth, redirecting unauthenticated visitors to `/login?redirect=%2Fevents%2Fnew` and rendering the creation page shell.

**Independent Test**: Loading `/events/new` redirects unauthenticated users to `/login`, while authenticated users see the page header, creation form, and a working "Cancel" button routing back to `/dashboard`.

### Tests for User Story 1

- [x] T005 [P] [US1] Create unit tests for route protection and page shell rendering in `tests/unit/events/create-event-page.test.tsx`

### Implementation for User Story 1

- [x] T006 [US1] Implement protected Next.js Server Component page at `src/app/(dashboard)/events/new/page.tsx` with `getSession()` guard and `<Suspense>` wrapper
- [x] T007 [US1] Implement `CreateEventForm` shell with Cancel button routing back to `/dashboard` in `src/features/events/components/CreateEventForm.tsx`

**Checkpoint**: User Story 1 complete — page routes and renders cleanly with auth protection.

---

## Phase 4: User Story 2 - Debounced Slug Generation & Real-Time Availability Badge (Priority: P2)

**Goal**: Title-to-slug auto-population with 300ms debouncing against `/api/events/check-slug`, visual status badges, and manual override mode.

**Independent Test**: Typing "Summer Gala 2026" in Title automatically sets Slug to `summer-gala-2026` with a green badge; typing a reserved word shows a warning badge and disables submission.

### Tests for User Story 2

- [x] T008 [P] [US2] Create unit tests for auto-slug derivation and live availability badge states in `tests/unit/events/create-event-form.test.tsx`

### Implementation for User Story 2

- [x] T009 [US2] Integrate Title-to-slug auto-generation, manual override toggle, and `useDebouncedSlugCheck` into `src/features/events/components/CreateEventForm.tsx`

**Checkpoint**: User Stories 1 and 2 functional — organizers receive real-time slug feedback as they type.

---

## Phase 5: User Story 3 - Banner Configuration with Live Aspect Preview (Priority: P3)

**Goal**: Banner URL input with integrated `BannerAspectPreview` (16:9 / 21:9 toggle), loading states, and broken image fallback.

**Independent Test**: Entering a valid image URL renders the live banner preview card; clearing or entering an invalid URL displays the fallback placeholder without crashing.

### Tests for User Story 3

- [x] T010 [P] [US3] Add unit tests for banner preview URL input and broken image fallback in `tests/unit/events/create-event-form.test.tsx`

### Implementation for User Story 3

- [x] T011 [US3] Integrate `BannerAspectPreview` component and URL input field into `src/features/events/components/CreateEventForm.tsx`

**Checkpoint**: User Stories 1, 2, and 3 functional — branding and banner framing can be previewed live.

---

## Phase 6: User Story 4 - Schedule Temporal Guardrails & Submission Lifecycle (Priority: P4)

**Goal**: Datetime picker inputs enforcing `endsAt >= startsAt + 1h`, `createEventAction` submission, loading spinner, error banners, success toast, and redirect to `/events/[slug]/settings`.

**Independent Test**: Selecting an invalid duration shows an inline error and blocks submission; submitting a valid form calls the Server Action and redirects to the settings portal.

### Tests & Implementation for User Story 4

- [x] T012 [P] [US4] Add unit tests for 1-hour temporal window validation and form submission in `tests/unit/events/create-event-form.test.tsx`
- [x] T013 [US4] Implement datetime-local inputs, temporal validation errors, `createEventAction` submission, loading spinner, toast notifications, and redirect in `src/features/events/components/CreateEventForm.tsx`

**Checkpoint**: All user stories functional — complete end-to-end event creation flow.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Exports, integration verification, and code quality gates.

- [x] T014 [P] Re-export `CreateEventForm`, `SlugAvailabilityBadge`, and `useDebouncedSlugCheck` in `src/features/events/index.ts`
- [x] T015 Run full validation suite per `quickstart.md` (`npm run test`, `npm run typecheck`, `npm run lint`, `npm run format:check`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 — deliver MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 3.
- **User Story 3 (Phase 5)**: Depends on Phase 3.
- **User Story 4 (Phase 6)**: Depends on Phase 3, 4, 5.
- **Polish (Phase 7)**: Depends on Phases 1–6.

---

## Parallel Opportunities

- `T002` and `T003` (Phase 2) can run in parallel.
- `T005` (US1 test) and `T008` (US2 test) can run in parallel.
- `T010` (US3 test) and `T012` (US4 test) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational badge and hook).
2. Implement Phase 3 (User Story 1 - Protected route `/events/new` and form shell).
3. Validate User Story 1 with automated tests (`tests/unit/events/create-event-page.test.tsx`).

### Incremental Delivery

1. Add Phase 4 (Auto-slug derivation & real-time badge).
2. Add Phase 5 (Banner aspect preview).
3. Add Phase 6 (Schedule picker, temporal guardrail & Server Action submission).
4. Run Phase 7 (Quality gates & typechecking).
