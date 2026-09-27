# Tasks: Organizer Event Operational Schedule & Publication Lifecycle Controls

**Feature**: `006-organizer-schedule-lifecycle`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: 2026-09-27

---

## Phase 1: Setup (Validation Schemas & Types)

**Purpose**: Zod validation schemas, TypeScript domain types, and ActionResponse envelopes for schedule and lifecycle controls

- [x] T001 [P] Create Zod validation schemas for schedule & lifecycle (`scheduleLifecycleFormSchema`, `updateScheduleLifecycleSchema`, `eventPublicationStatusSchema`) in `src/lib/validations/event-schedule-lifecycle.ts`
- [x] T002 [P] Define TypeScript domain types and ActionResponse envelopes for schedule and lifecycle in `src/features/events/types/index.ts`

---

## Phase 2: Foundational (Server Action, Audit Logging & Unit Tests)

**Purpose**: Server action mutation, ownership guard enforcement, bcrypt passphrase hashing, atomic `EventAuditLog` transaction, and validation test harness

**⚠️ CRITICAL**: Must complete before interactive UI components can be wired up

- [x] T003 [P] Implement unit tests for `scheduleLifecycleFormSchema` and `updateScheduleLifecycleSchema` in `tests/unit/events/schedule-lifecycle-validation.test.ts`
- [x] T004 Implement Server Action `updateScheduleLifecycleAction` with `requireEventOwnership(slug)` verification, schema parsing, bcrypt passphrase hashing, atomic `EventAuditLog` transaction, and cache revalidation in `src/features/events/actions/update-schedule-lifecycle.ts`
- [x] T005 [P] Implement unit tests for `updateScheduleLifecycleAction` in `tests/unit/events/update-schedule-lifecycle-action.test.ts`

**Checkpoint**: Foundation ready — server-side mutation, ownership verification, and audit logging fully tested.

---

## Phase 3: User Story 1 - Organizer Configures Voting Schedule Window (Priority: P1) 🎯 MVP

**Goal**: Authenticated event organizer navigates to Schedule & Timeline settings to configure `startsAt` and `endsAt` operational window in Philippine Time (`Asia/Manila`), enforcing `endsAt > startsAt` with instant feedback and audit logging.

**Independent Test**: Log in as event owner, visit `/events/[slug]/settings?tab=schedule`, adjust `startsAt` and `endsAt` dates, click "Save Changes", and verify that the new dates persist, update the public countdown banner, and write to `EventAuditLog`.

### Implementation for User Story 1

- [x] T006 [US1] Create interactive `ScheduleLifecycleForm.tsx` with React Hook Form, date-time inputs for `startsAt` and `endsAt` (formatted for `Asia/Manila`), duration indicator, optional audit reason textarea, and Server Action submission in `src/features/events/components/dashboard/ScheduleLifecycleForm.tsx`
- [x] T007 [US1] Integrate `ScheduleLifecycleForm` into `src/app/(dashboard)/events/[slug]/settings/page.tsx` replacing the static summary card for the `schedule` tab

**Checkpoint**: At this point, User Story 1 is fully functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - Organizer Manages Publication Lifecycle States (Priority: P1)

**Goal**: Organizer transitions event status between `DRAFT`, `PUBLISHED`, and `ARCHIVED` with accessible confirmation modal prompts explaining the consequences before committing the transition.

**Independent Test**: Transition an event from `DRAFT` to `PUBLISHED` via confirmation modal and verify public access; transition to `ARCHIVED` and confirm voting actions are locked.

### Implementation for User Story 2

- [x] T008 [US2] Implement publication status selector and Radix UI confirmation modal dialog (`role="alertdialog"`) in `ScheduleLifecycleForm.tsx` for transitions (`DRAFT` → `PUBLISHED`, `PUBLISHED` → `ARCHIVED`, `PUBLISHED` → `DRAFT`) in `src/features/events/components/dashboard/ScheduleLifecycleForm.tsx`
- [x] T009 [US2] Verify public event access and voting banner behavior when status changes between `DRAFT`, `PUBLISHED`, and `ARCHIVED` in `src/features/events/components/EventBanner.tsx` and `src/features/events/components/EventStateBadge.tsx`

**Checkpoint**: User Stories 1 and 2 are both functional and independently testable.

---

## Phase 5: User Story 3 - Organizer Configures Draft Preview Passphrase (Priority: P2)

**Goal**: Organizer configures, updates, or removes a draft preview passphrase (min 4 characters) to permit confidential stakeholder reviews before public launch.

**Independent Test**: Set a draft preview passphrase in settings, open `/events/[slug]` in an incognito window, unlock access via passphrase entry, then remove passphrase in settings and verify that access is locked.

### Implementation for User Story 3

- [x] T010 [US3] Add draft passphrase input, show/hide toggle, and "Remove Passphrase" action in `ScheduleLifecycleForm.tsx` in `src/features/events/components/dashboard/ScheduleLifecycleForm.tsx`
- [x] T011 [US3] Update draft preview authentication handler to verify bcrypt passphrase hashes against `event.draftPassphraseHash` in `src/app/api/events/[slug]/preview-auth/route.ts`

**Checkpoint**: User Stories 1, 2, and 3 are all functional and independently testable.

---

## Phase 6: User Story 4 - Audit Trail for Schedule & Lifecycle Adjustments (Priority: P3)

**Goal**: Complete governance audit trail recording previous/new operational dates, publication status, and draft passphrase presence for transparent competition oversight.

**Independent Test**: Adjust schedule dates, publication status, and passphrase settings, then verify `EventAuditLog` table records entries with `action: "UPDATE_SCHEDULE_LIFECYCLE"`, previous values, and new values.

### Implementation for User Story 4

- [x] T012 [US4] Verify audit logging capture in `updateScheduleLifecycleAction` ensuring `previousVal` and `newVal` state snapshots (`{ startsAt, endsAt, publicationStatus, hasDraftPassphrase }`), author ID, and optional reason note are accurately preserved in `src/features/events/actions/update-schedule-lifecycle.ts`

**Checkpoint**: All user stories (US1, US2, US3, US4) are complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, accessibility compliance, and end-to-end test validation

- [x] T013 [P] Verify WCAG 2.1 AA keyboard accessibility, screen reader announcements, and focus trapping on `ScheduleLifecycleForm` and transition modals in `src/features/events/components/dashboard/ScheduleLifecycleForm.tsx`
- [x] T014 Run static analysis and type checking (`npm run typecheck`, `npm run lint`, `npm run format:check`)
- [x] T015 Run full Vitest test suite (`npm run test`) and execute validation scenarios in `specs/006-organizer-schedule-lifecycle/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (Foundational Server Action & Validation).
- **User Story 2 (Phase 4)**: Depends on Phase 3 (`ScheduleLifecycleForm` base implementation).
- **User Story 3 (Phase 5)**: Depends on Phase 3 & Phase 4.
- **User Story 4 (Phase 6)**: Verified alongside Server Action in Phase 2 & UI integration.
- **Polish (Phase 7)**: Runs after all user story phases are implemented.

### Parallel Opportunities

- Phase 1: `T001` (Zod schemas) and `T002` (domain types) can execute in parallel.
- Phase 2: `T003` (validation tests) and `T005` (action tests) can be authored in parallel with `T004`.
- Phase 7: `T013` (accessibility audit) can execute in parallel with static checks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Zod validation, Types).
2. Complete Phase 2 (Foundational Server Action & Unit Tests).
3. Complete Phase 3 (US1 - Interactive Schedule Form & Settings Page Integration).
4. **STOP and VALIDATE**: Test User Story 1 independently in browser & unit tests.

### Incremental Delivery

1. Foundation ready (Phase 1 + Phase 2).
2. Add US1 (Voting Schedule Window Configuration) $\rightarrow$ Test & Deliver MVP.
3. Add US2 (Publication Lifecycle Transitions & Confirmation Modals) $\rightarrow$ Test & Deliver.
4. Add US3 (Draft Preview Passphrase Management & Bcrypt Auth) $\rightarrow$ Test & Deliver.
5. Add US4 (Audit Log Snapshots & Governance) $\rightarrow$ Test & Deliver.
6. Polish, Accessibility audit, Typecheck, and Test suite validation (Phase 7).
