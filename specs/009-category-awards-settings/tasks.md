# Tasks: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings` | **Spec**: [specs/009-category-awards-settings/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/009-category-awards-settings/spec.md) | **Plan**: [specs/009-category-awards-settings/plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/009-category-awards-settings/plan.md)

---

## Phase 1: Setup (Types & Presets Catalog)

**Purpose**: Establish core constants, types, and preset templates.

- [x] T001 Update `SETTINGS_TABS` to include `"categories"` in `src/features/events/types/index.ts` and `src/lib/validations/event-settings.ts`
- [x] T002 [P] Define curated taxonomy presets catalog in `src/features/events/constants/taxonomy-presets.ts`

---

## Phase 2: Foundational (Query Hooks & Navigation Integration)

**Purpose**: Data fetching hooks and settings tab navigation integration.

- [x] T003 [P] Implement TanStack Query hooks for unified taxonomy operations in `src/features/events/hooks/useEventTaxonomy.ts`
- [x] T004 Update `SettingsTabNav.tsx` to include `"categories"` tab with `Layers` icon in `src/features/events/components/dashboard/SettingsTabNav.tsx`
- [x] T005 Update `SettingsTabsContainer.tsx` to conditionally mount `CategoryAwardsSettingsForm` in `src/features/events/components/dashboard/SettingsTabsContainer.tsx`

---

## Phase 3: User Story 1 - Add & Configure Custom Divisions and Award Tracks (Priority: P1) 🎯 MVP

**Goal**: Enable organizers to view, create, and manage custom divisions and award tracks on `/events/[slug]/settings?tab=categories`.

**Independent Test**: Navigate to `/events/[slug]/settings?tab=categories`, type a division name and award track name, click Add, and verify they appear immediately as interactive cards.

### Tests for User Story 1

- [x] T006 [P] [US1] Unit test for taxonomy settings rendering and inline creation in `tests/unit/events/category-awards-settings-form.test.tsx`

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement `DivisionsSection.tsx` for displaying division badges, inline addition input, and contestant count badges in `src/features/events/components/dashboard/DivisionsSection.tsx`
- [x] T008 [P] [US1] Implement `AwardCategoriesSection.tsx` for displaying award cards, descriptions, and creation input in `src/features/events/components/dashboard/AwardCategoriesSection.tsx`
- [x] T009 [US1] Implement main `CategoryAwardsSettingsForm.tsx` integrating divisions and award tracks sections in `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx`

---

## Phase 4: User Story 2 - Apply 1-Click Competition Taxonomy Presets (Priority: P2)

**Goal**: Provide 1-click preset templates (Beauty Pageant, Talent Contest, Dance Championship, Academic/Hackathon) to batch populate divisions and awards.

**Independent Test**: Click the "Beauty Pageant" preset card and verify that standard divisions (Female, Male, LGBTQ+, Teen) and awards (People's Choice, Best Gown, etc.) are batch created.

### Tests for User Story 2

- [x] T010 [P] [US2] Unit test for preset template loading and batch application in `tests/unit/events/taxonomy-presets.test.tsx`

### Implementation for User Story 2

- [x] T011 [US2] Implement `TaxonomyPresetsCard.tsx` with preset buttons and batch application logic in `src/features/events/components/dashboard/TaxonomyPresetsCard.tsx`
- [x] T012 [US2] Integrate `TaxonomyPresetsCard` into `CategoryAwardsSettingsForm.tsx` with empty state guidance in `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx`

---

## Phase 5: User Story 3 - Granular Voting Toggle & Display Ordering (Priority: P3)

**Goal**: Allow organizers to toggle public voting availability per award category and reorder display priorities.

**Independent Test**: Flip the voting toggle switch on an award category and verify the status updates to "Voting Closed" (grey badge) with persistent PATCH mutation.

### Tests for User Story 3

- [x] T013 [P] [US3] Unit test for voting availability toggle mutations and status badges in `tests/unit/events/award-category-voting-toggle.test.tsx`

### Implementation for User Story 3

- [x] T014 [US3] Implement optimistic voting toggle switch (`isVotingOpen`) and display order controls in `src/features/events/components/dashboard/AwardCategoriesSection.tsx`

---

## Phase 6: User Story 4 - Referential Integrity & Safe Deletion Dialog (Priority: P4)

**Goal**: Prevent accidental deletion of divisions or award categories that have assigned contestants via a blocker modal dialog.

**Independent Test**: Attempt to delete a division with `contestantCount > 0` and confirm a blocker dialog appears preventing deletion.

### Tests for User Story 4

- [x] T015 [P] [US4] Unit test for deletion safety blocker and confirmation dialog in `tests/unit/events/taxonomy-delete-dialog.test.tsx`

### Implementation for User Story 4

- [x] T016 [US4] Implement `TaxonomyDeleteDialog.tsx` with Radix AlertDialog supporting blocker state (`contestantCount > 0`) and destructive delete confirmation (`contestantCount === 0`) in `src/features/events/components/dashboard/TaxonomyDeleteDialog.tsx`
- [x] T017 [US4] Integrate `TaxonomyDeleteDialog` into `CategoryAwardsSettingsForm.tsx`, `DivisionsSection.tsx`, and `AwardCategoriesSection.tsx`

---

## Phase 7: User Story 5 - Dynamic Public Roster Division Filtering (Priority: P2)

**Goal**: Connect public candidate roster to dynamic event divisions so only configured divisions are rendered.

**Independent Test**: Remove "LGBTQ+" and "Teen" divisions in settings, visit public page, and verify the division filter only displays "All Candidates", "Female", and "Male".

### Tests for User Story 5

- [x] T018 [P] [US5] Unit test for dynamic division filter bar rendering and tab selection in `tests/unit/contestants/category-filter.test.ts`

### Implementation for User Story 5

- [x] T019 [US5] Update `CategoryFilterBar.tsx` and `ContestantRoster.tsx` to accept and render dynamic `divisions` array with fallback in `src/features/contestants/components/CategoryFilterBar.tsx` and `src/features/contestants/components/ContestantRoster.tsx`
- [x] T020 [US5] Update `EventPageClient.tsx` to pass dynamic taxonomy divisions to `ContestantRoster` in `src/features/events/components/EventPageClient.tsx`

---

## Phase 8: Polish & Quality Gates

**Purpose**: Comprehensive testing, static analysis, typecheck, and Jira tracking.

- [x] T021 [P] Run full test suite (`npm run test`) verifying 100% pass across all unit tests
- [x] T022 [P] Run static analysis and linting (`npm run typecheck` and `npm run lint`)
- [x] T023 Sync Jira ticket VS-37 status and comment changelog
