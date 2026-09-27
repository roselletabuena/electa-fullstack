# Tasks: Organizer Dashboard Route & Event Ownership Authorization Guardrails

**Feature**: `003-organizer-dashboard-guardrails`  
**Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/003-organizer-dashboard-guardrails/spec.md) | **Plan**: [plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/003-organizer-dashboard-guardrails/plan.md)  
**Date**: 2026-09-27

---

## Phase 1: Setup (Shared Infrastructure & Validation)

**Purpose**: Core types, tab definitions, and Zod parameter schemas

- [x] T001 [P] Define dashboard settings tab types and navigation configurations in `src/features/events/types/index.ts`
- [x] T002 [P] Create Zod validation schemas for event slug params and settings tab query parameters in `src/lib/validations/event-settings.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side authorization guardrails and test harness

**⚠️ CRITICAL**: Must complete before user story routes can be wired up

- [x] T003 [P] Implement unit tests for Zod validation schemas in `tests/unit/events/event-settings-validation.test.ts`
- [x] T004 Implement server-side ownership authorization utility `requireEventOwnership(slug)` in `src/features/events/utils/ownership-guard.ts`
- [x] T005 [P] Implement unit tests for `requireEventOwnership` in `tests/unit/events/ownership-guard.test.ts`

**Checkpoint**: Foundation ready — server-side authorization and validation logic fully tested

---

## Phase 3: User Story 1 - Authorized Organizer Accesses Event Settings (Priority: P1) 🎯 MVP

**Goal**: Authenticated event owner accesses `/dashboard/events/[slug]/settings`, viewing the organizer dashboard shell, tab navigation (General, Schedule, Voting Rules), and read-only parameter summary cards.

**Independent Test**: Log in with `userId === event.organizerId` and navigate to `/dashboard/events/[slug]/settings`, verifying header, tab switching with `nuqs` URL sync, and card rendering.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `OrganizerDashboardHeader.tsx` displaying event title, slug, publication status badge, and public link in `src/features/events/components/dashboard/OrganizerDashboardHeader.tsx`
- [x] T007 [P] [US1] Create `SettingsTabNav.tsx` using `nuqs` `useQueryState` with accessible Radix tabs and `general` fallback in `src/features/events/components/dashboard/SettingsTabNav.tsx`
- [x] T008 [P] [US1] Create `GeneralSettingsSummaryCard.tsx` rendering event metadata summary in `src/features/events/components/dashboard/GeneralSettingsSummaryCard.tsx`
- [x] T009 [P] [US1] Create `ScheduleSettingsSummaryCard.tsx` rendering operational timeline window in `src/features/events/components/dashboard/ScheduleSettingsSummaryCard.tsx`
- [x] T010 [P] [US1] Create `VotingRulesSettingsSummaryCard.tsx` rendering voting rules summary in `src/features/events/components/dashboard/VotingRulesSettingsSummaryCard.tsx`
- [x] T011 [US1] Implement settings dashboard layout loading skeleton in `src/app/(dashboard)/events/[slug]/settings/loading.tsx`
- [x] T012 [US1] Implement RSC settings page controller in `src/app/(dashboard)/events/[slug]/settings/page.tsx` integrating `requireEventOwnership`, `OrganizerDashboardHeader`, `SettingsTabNav`, and summary cards

**Checkpoint**: At this point, User Story 1 is fully functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - Unauthenticated Visitor Redirection (Priority: P2)

**Goal**: Unauthenticated visitors attempting to access `/dashboard/events/[slug]/settings` are safely redirected to `/login` with target return destination.

**Independent Test**: Clear cookies and access `/dashboard/events/[slug]/settings`, confirming 307/302 redirect to `/login?redirect=...`.

### Implementation for User Story 2

- [x] T013 [US2] Integrate redirect-with-destination handling for unauthenticated requests in `src/features/events/utils/ownership-guard.ts` and `src/app/(dashboard)/events/[slug]/settings/page.tsx`
- [x] T014 [US2] Add unit test assertions for unauthenticated redirect flow in `tests/unit/events/ownership-guard.test.ts`

**Checkpoint**: Unauthenticated access is strictly blocked and redirected.

---

## Phase 5: User Story 3 - Unauthorized User Access Denial (Priority: P3)

**Goal**: Authenticated non-owners receive an accessible HTTP 403 Forbidden Access Denied card preventing exposure of event settings.

**Independent Test**: Log in with `userId !== event.organizerId` and access `/dashboard/events/[slug]/settings`, confirming 403 Forbidden screen renders.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create accessible `ForbiddenAccessCard.tsx` displaying HTTP 403 status, explanation, and safe navigation links in `src/features/events/components/dashboard/ForbiddenAccessCard.tsx`
- [x] T016 [US3] Wire 403 Forbidden handling into `src/app/(dashboard)/events/[slug]/settings/page.tsx` when user does not own the target event
- [x] T017 [US3] Add unit test assertions for unauthorized 403 scenarios in `tests/unit/events/ownership-guard.test.ts`

**Checkpoint**: All user stories (US1, US2, US3) are complete and independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, accessibility compliance, and end-to-end validation

- [x] T018 [P] Ensure WCAG 2.1 AA keyboard accessibility and contrast compliance in `src/features/events/components/dashboard/`
- [x] T019 Run typecheck (`npm run typecheck`), linting (`npm run lint`), and formatting check (`npm run format:check`)
- [x] T020 Run full Vitest test suite (`npm run test`) and validate all scenarios in `specs/003-organizer-dashboard-guardrails/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - **US1 (P1)**: Core MVP.
  - **US2 (P2)**: Extends auth guardrail for unauthenticated redirects.
  - **US3 (P3)**: Extends auth guardrail for 403 Forbidden UI.
- **Polish (Phase 6)**: Runs after all user stories are implemented.

### Parallel Opportunities

- Phase 1: `T001` and `T002` can execute in parallel.
- Phase 2: `T003` and `T005` tests can be authored in parallel with `T004`.
- Phase 3 (US1): `T006`, `T007`, `T008`, `T009`, `T010` (components) can be authored in parallel before assembling in `T012`.
- Phase 5 (US3): `T015` component can be developed in parallel with test updates in `T017`.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 (Setup) & Phase 2 (Foundational Guardrails).
2. Complete Phase 3 (US1 - Authorized Dashboard Shell & Tab Sync).
3. Validate US1 independently as functional MVP.

### Incremental Delivery

1. Add US2 (Unauthenticated Login Redirect).
2. Add US3 (Unauthorized 403 Forbidden Screen).
3. Run Polish phase and complete full test suite verification.
