# Tasks: Organizer Event Branding & Public Profile Management

**Feature**: `004-organizer-branding-settings`  
**Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/004-organizer-branding-settings/spec.md) | **Plan**: [plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/004-organizer-branding-settings/plan.md)  
**Date**: 2026-09-27

---

## Phase 1: Setup (Shared Infrastructure & Validation)

**Purpose**: Core types, Zod schemas, and action response envelopes

- [x] T001 [P] Create Zod validation schema for event branding updates in `src/lib/validations/event-branding.ts`
- [x] T002 [P] Define TypeScript domain types for branding input and ActionResponse envelope in `src/features/events/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites & Tests)

**Purpose**: Server action mutation, audit logging transaction, and validation test harness

**⚠️ CRITICAL**: Must complete before interactive UI components can be wired up

- [x] T003 [P] Implement unit tests for `updateEventBrandingSchema` in `tests/unit/events/branding-validation.test.ts`
- [x] T004 Implement Server Action `updateEventBrandingAction` with ownership verification and atomic `EventAuditLog` transaction in `src/features/events/actions/update-event-branding.ts`
- [x] T005 [P] Implement unit tests for `updateEventBrandingAction` in `tests/unit/events/update-branding-action.test.ts`

**Checkpoint**: Foundation ready — server-side mutation, authorization, and audit logging fully tested

---

## Phase 3: User Story 1 - Organizer Updates Event Branding Metadata & Banner Imagery (Priority: P1) 🎯 MVP

**Goal**: Authenticated event organizer edits event title, description, banner URL with real-time aspect ratio preview (16:9 / 21:9), and optional reason note, saving updates with audit logging.

**Independent Test**: Log in as event owner, navigate to `/events/[slug]/settings?tab=general`, edit branding fields, toggle aspect ratios, submit form, and verify updates persist in DB and header with toast feedback.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `BannerAspectPreview.tsx` supporting 16:9 and 21:9 aspect ratio toggles and broken URL error fallback in `src/features/events/components/dashboard/BannerAspectPreview.tsx`
- [x] T007 [US1] Create interactive `GeneralBrandingForm.tsx` with React Hook Form, character counters, live banner preview, and Server Action submission in `src/features/events/components/dashboard/GeneralBrandingForm.tsx`
- [x] T008 [US1] Integrate `GeneralBrandingForm` into `src/app/(dashboard)/events/[slug]/settings/page.tsx` for the `general` tab view

**Checkpoint**: At this point, User Story 1 is fully functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - 1-Click Shareable Public Event URL Copy (Priority: P2)

**Goal**: Organizer easily copies the canonical public event URL to their clipboard with 1-click confirmation feedback and cross-browser fallback.

**Independent Test**: Click the "Copy Public Link" button next to the read-only slug, confirming clipboard content matches `{origin}/events/{slug}` and checkmark feedback displays for 2 seconds.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create accessible `CopySlugButton.tsx` with clipboard copy and checkmark feedback in `src/features/events/components/dashboard/CopySlugButton.tsx`
- [x] T010 [US2] Integrate `CopySlugButton` into `GeneralBrandingForm.tsx` next to the read-only slug display
- [x] T011 [US2] Integrate `CopySlugButton` into `src/features/events/components/dashboard/OrganizerDashboardHeader.tsx`

**Checkpoint**: All user stories (US1, US2) are complete and independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, accessibility compliance, and end-to-end validation

- [x] T012 [P] Ensure WCAG 2.1 AA keyboard accessibility and color contrast in `src/features/events/components/dashboard/`
- [x] T013 Run typecheck (`npm run typecheck`), linting (`npm run lint`), and formatting check (`npm run format:check`)
- [x] T014 Run full Vitest test suite (`npm run test`) and validate all scenarios in `specs/004-organizer-branding-settings/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (Foundational Server Action & Validation).
- **User Story 2 (Phase 4)**: Can execute independently or in parallel with US1 UI assembly.
- **Polish (Phase 5)**: Runs after all user stories are implemented.

### Parallel Opportunities

- Phase 1: `T001` and `T002` can execute in parallel.
- Phase 2: `T003` (validation tests) and `T005` (action tests) can be authored in parallel with `T004`.
- Phase 3 (US1): `T006` (`BannerAspectPreview`) can be built in parallel with `T007` form structure.
- Phase 4 (US2): `T009` (`CopySlugButton`) can be built independently in parallel.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 (Setup) & Phase 2 (Foundational Server Action).
2. Complete Phase 3 (US1 - Interactive Branding Form & Aspect Ratio Preview).
3. Validate US1 independently as functional MVP.

### Incremental Delivery

1. Add US2 (1-Click Public Link Copy & Header integration).
2. Run Polish & Vitest validation suite.
