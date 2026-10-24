# Implementation Tasks: Organizer Dashboard Theme Selector UI

**Feature ID**: `050-organizer-dashboard-theme-selector`  
**Ticket**: [VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Status**: Completed  
**Created**: 2026-10-24

---

## Phase 1: Foundation & Test Specifications (TDD Red)

- [x] **Task 1: ThemeSelectorCard Unit Tests** `test(events): [VS-122] add unit tests for ThemeSelectorCard component`
  - Test rendering theme name, description, swatches, and font tags.
  - Test selected state badge and active border.
  - Test selection callback on click and keyboard activation.

- [x] **Task 2: ThemeSelectorCard Integration in GeneralBrandingForm Unit Tests** `test(events): [VS-122] add unit tests for theme selection in GeneralBrandingForm and updateEventBrandingAction`
  - Test pre-selection of event theme from database.
  - Test immediate update of selection and dirty state on card click.
  - Test form dirty state and discard changes reset.
  - Test persisting theme via `updateEventBrandingAction` with audit logging.

---

## Phase 2: Component & Action Implementation (TDD Green)

- [x] **Task 3: Implement ThemeSelectorCard Component** `feat(events): [VS-122] implement ThemeSelectorCard with swatches and zero-radius brutalist styling`
  - Create `src/features/events/components/dashboard/ThemeSelectorCard.tsx`.
  - Render color swatches (Base, Surface, Primary Accent, Text Primary) and font tags.
  - Enforce strict zero-radius (`rounded-none`, `--radius: 0px`) and WCAG 2.1 AA dual-theme contrast.

- [x] **Task 4: Integrate Theme Selector into GeneralBrandingForm** `feat(events): [VS-122] integrate theme selector into GeneralBrandingForm`
  - Update `src/features/events/components/dashboard/GeneralBrandingForm.tsx`.
  - Bind `theme` into React Hook Form default values and watch updates.
  - Connect `ThemeSelectorCard` grid cleanly without bulky preview widgets.
  - Ensure "Discard Changes" restores original theme and resets dirty state.

- [x] **Task 7: Refine Server Action & Audit Logging** `feat(events): [VS-122] refine updateEventBrandingAction for theme persistence and audit trails`
  - Ensure `updateEventBrandingAction` accurately records `theme` transitions in `eventAuditLog`.
  - Verify path revalidation on `/events/${slug}/settings` and `/events/${slug}`.

---

## Phase 3: Verification & Convergence

- [x] **Task 8: Run Quality Gates & Verify Convergence** `chore(qa): [VS-122] verify typecheck, linting, and unit test suites`
  - Execute `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
  - Verify 100% test pass rate and clean code review standards.
