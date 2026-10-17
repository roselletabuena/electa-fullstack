# Tasks: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings` | **Spec**: [specs/009-category-awards-settings/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/electa-workspace/electa-fullstack/specs/009-category-awards-settings/spec.md) | **Plan**: [specs/009-category-awards-settings/plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/electa-workspace/electa-fullstack/specs/009-category-awards-settings/plan.md)

---

## Phase 1: Setup (Types & Architecture Cleanup)

**Purpose**: Establish core constants, types, and remove presets dependency.

- [x] T001 Update `SETTINGS_TABS` to include `"categories"` in `src/features/events/types/index.ts` and `src/lib/validations/event-settings.ts`
- [x] T002 Remove `TaxonomyPresetsCard` invocation from `CategoryAwardsSettingsForm.tsx` and deprecate preset imports in `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx`

---

## Phase 2: Foundational (Query Hooks & Navigation Integration)

**Purpose**: Data fetching hooks and settings tab navigation integration.

- [x] T003 Verify `useUpdateDivision` and `useUpdateAwardCategory` mutation hooks in `src/features/events/hooks/useEventTaxonomy.ts`
- [x] T004 Mount `CategoryAwardsSettingsForm` in `src/features/events/components/dashboard/SettingsTabsContainer.tsx`

---

## Phase 3: User Story 1 - Add & Configure Custom Divisions and Award Tracks (Priority: P1) 🎯 MVP

**Goal**: Enable organizers to view, create, and manage custom divisions and award tracks on `/events/[slug]/settings?tab=categories`.

**Independent Test**: Navigate to `/events/[slug]/settings?tab=categories`, type a division name and award track name, click Add, and verify they appear immediately as interactive cards.

### Implementation for User Story 1

- [x] T005 [P] [US1] Display division cards and inline addition input in `src/features/events/components/dashboard/DivisionsSection.tsx`
- [x] T006 [P] [US1] Display award cards, voting status, and creation input in `src/features/events/components/dashboard/AwardCategoriesSection.tsx`
- [x] T007 [US1] Mount divisions and award tracks sections in `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx`

---

## Phase 4: User Story 2 - In-Place Inline Editing of Divisions and Award Categories (Priority: P1)

**Goal**: Enable organizers to edit names, descriptions, and display orders for existing divisions and award categories in-place without modal overlays, while preserving contestant linkages.

**Independent Test**: Click "Edit" on a division card, modify its name from "Female Category" to "Women's Division", click "Save Changes", and verify the card updates optimistically and persists on page reload.

### Tests for User Story 2

- [x] T008 [P] [US2] Unit tests for division and award category inline editing (edit mode trigger, field prepopulation, cancel revert, PATCH mutation, duplicate name error) in `tests/unit/events/category-awards-settings-form.test.tsx`

### Implementation for User Story 2

- [x] T009 [P] [US2] Implement inline card editing mode, Pencil action button, Save/Cancel controls, and `UpdateDivisionInput` handling in `src/features/events/components/dashboard/DivisionsSection.tsx`
- [x] T010 [P] [US2] Implement inline card editing mode, Pencil action button, Save/Cancel controls, and `UpdateAwardCategoryInput` handling in `src/features/events/components/dashboard/AwardCategoriesSection.tsx`
- [x] T011 [US2] Wire `useUpdateDivision` and `useUpdateAwardCategory` mutations in `CategoryAwardsSettingsForm.tsx` and implement Concurrent Edit Guard (disabling other edit/add triggers while an edit is active) in `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx`

---

## Phase 5: User Story 3 - Granular Voting Toggle & Display Ordering (Priority: P3)

**Goal**: Allow organizers to independently toggle public voting availability per award category with immediate visual badge feedback.

**Independent Test**: Flip the voting switch on an award category to Closed and verify `isVotingOpen: false` persists.

### Implementation for User Story 3

- [x] T012 [P] [US3] Voting status toggle switch and optimistic status badge in `src/features/events/components/dashboard/AwardCategoriesSection.tsx`

---

## Phase 6: User Story 4 - Referential Integrity & Safe Deletion Dialog (Priority: P4)

**Goal**: Safeguard candidate assignments and voting integrity with deletion blocker dialogs.

**Independent Test**: Attempt to delete a division with assigned contestants and verify hard deletion is blocked with a warning dialog.

### Implementation for User Story 4

- [x] T013 [P] [US4] Implement referential integrity blocker and confirmation dialog in `src/features/events/components/dashboard/TaxonomyDeleteDialog.tsx`

---

## Phase 7: User Story 5 - Dynamic Public Roster Division Filtering (Priority: P2)

**Goal**: Ensure public roster division filter dynamically mirrors the active divisions configured in Settings.

**Independent Test**: Add a custom division and verify it appears in the public candidate roster filter bar.

### Implementation for User Story 7

- [x] T014 [US5] Dynamic division filter pills rendering in `src/features/events/components/CategoryFilterBar.tsx`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification and regression testing.

- [x] T015 [P] Remove obsolete preset tests and run full unit test suite via `npm run test:unit`
- [x] T016 Run typecheck and lint verification via `npm run typecheck` and `npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phases 1 & 2)**: Core types & hooks ready.
- **User Story 1 (Phase 3)**: Complete.
- **User Story 2 (Phase 4)**: Currently actionable! Can execute T008 (test), T009 (DivisionsSection), T010 (AwardCategoriesSection), and T011 (CategoryAwardsSettingsForm).
- **Polish (Phase 8)**: Executes after User Story 2 implementation to verify gates.

### Parallel Opportunities

- `T009` (`DivisionsSection.tsx`) and `T010` (`AwardCategoriesSection.tsx`) can be implemented in parallel.
- `T008` unit tests can be authored concurrently with component updates.

---

## Implementation Strategy (User Story 2)

1. **Step 1**: Write unit tests for inline editing in `tests/unit/events/category-awards-settings-form.test.tsx` (`T008`).
2. **Step 2**: Add edit mode and form controls to `DivisionsSection.tsx` (`T009`).
3. **Step 3**: Add edit mode and form controls to `AwardCategoriesSection.tsx` (`T010`).
4. **Step 4**: Remove presets and connect update handlers with concurrent edit lock in `CategoryAwardsSettingsForm.tsx` (`T002`, `T011`).
5. **Step 5**: Run tests and linting (`T015`, `T016`).
