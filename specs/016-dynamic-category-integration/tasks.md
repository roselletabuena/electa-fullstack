# Tasks: Dynamic Category Integration in Contestant Form & Public Roster Filter Bar (VS-38)

**Feature Branch**: `015-dynamic-category-integration` | **Spec**: [specs/015-dynamic-category-integration/spec.md](spec.md) | **Plan**: [specs/015-dynamic-category-integration/plan.md](plan.md)  
**Jira Issue**: [VS-38](https://the-three-devsketeers.atlassian.net/browse/VS-38) | **Parent Epic**: [VS-35](https://the-three-devsketeers.atlassian.net/browse/VS-35)

---

## Phase 1: Setup & Types

**Purpose**: Extend contestant interfaces and modal props to support custom event divisions.

- [x] T001 Update `ContestantFormModalProps` and contestant interfaces in `src/features/contestants/types/index.ts` to accept `divisions?: DivisionDto[] | DynamicDivisionItem[]` and optional `divisionId`

---

## Phase 2: Tests (TDD - Test-First)

**Purpose**: Establish unit tests for dynamic division dropdown in modal and dynamic division pills in roster filter bar before implementation.

- [x] T002 [US1] Unit test for dynamic division select options in `ContestantFormModal` in `tests/unit/contestants/contestant-form-modal.test.tsx`
- [x] T003 [US2] Unit test for dynamic division pill rendering and filtering in `tests/unit/contestants/category-filter.test.ts` and `category-filter-bar.test.tsx`

---

## Phase 3: User Story 1 - Dynamic Divisions in Contestant Form & Organizer Table (VS-38)

**Purpose**: Allow organizers to view and assign custom competition divisions when creating or editing candidates.

- [x] T004 [US1] Update `ContestantFormModal.tsx` to dynamically render custom division options from `divisions` prop with fallback to standard enums
- [x] T005 [US1] Update `OrganizerContestantTable.tsx` to accept `divisions` and forward them to `ContestantFormModal`
- [x] T006 [US1] Update `src/app/(dashboard)/events/[slug]/contestants/page.tsx` to query `db.division.findMany` and pass `divisions` to `OrganizerContestantTable`

---

## Phase 4: User Story 2 - Dynamic Division Pills on Public Roster (VS-38)

**Purpose**: Allow voters to filter the candidate roster using dynamic division pills matching the event's configured divisions.

- [x] T007 [US2] Update `ContestantRoster.tsx` to filter candidates dynamically by custom division name or ID
- [x] T008 [US2] Verify `CategoryFilterBar.tsx` division pill active styling and keyboard accessibility

---

## Phase 5: Verification & Quality Gate

**Purpose**: Verify test suite, constitutional compliance, and git commits.

- [x] T009 Run Vitest suite on `tests/unit/contestants/` and ensure 100% pass
- [x] T010 Run TypeScript typecheck to verify zero type errors
- [x] T011 Create atomic commits adhering to conventional commits

---

## Phase 6: Convergence

**Purpose**: Close remaining gaps identified by `/speckit-converge` — type divergence, missing URL-sync tests, prop type alignment, and ARIA accessibility.

- [ ] T012 Remove the local `ContestantFormModalProps` interface in `ContestantFormModal.tsx` and import and use the exported `ContestantFormModalProps` from `../types` to eliminate type duplication and restore the full `DivisionDto[] | DynamicDivisionItem[]` union for the `divisions` prop per FR-001 (partial)
- [ ] T013 Add unit tests for URL search-param-driven division selection: verify that when `ContestantRoster` is rendered with `?division=Kids` in `searchParams`, the "Kids" pill is `aria-pressed="true"` and only matching candidates are displayed, per US2/AC4 (missing)
- [ ] T014 Update `OrganizerContestantTable` `divisions` prop type from `DynamicDivisionItem[] | undefined` to `DivisionDto[] | DynamicDivisionItem[] | undefined` to match what the contestants `page.tsx` server component produces, preventing future type drift per FR-004 (partial)
- [ ] T015 Add `id="division-select"` to the Division `<select>` element and `htmlFor="division-select"` to its label in `ContestantFormModal.tsx` to ensure screen readers correctly announce the "Division" label for the combobox, per FR-010 / WCAG 2.1 AA (missing)
