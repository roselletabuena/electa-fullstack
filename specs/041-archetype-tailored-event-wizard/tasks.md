# Implementation Tasks: Archetype-Tailored Event Wizard & Taxonomy Configuration UI

**Feature ID**: `041-archetype-tailored-event-wizard`  
**Ticket**: [VS-84](https://the-three-devsketeers.atlassian.net/browse/VS-84)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  
**Branch**: `feature/VS-84-archetype-tailored-event-wizard`  

---

## Phase 1: Validation Schemas & Contracts

**Purpose**: Define the strict Zod validation schemas for dynamic archetype-tailored wizard payloads, positions, and track requirements.

- [x] T001 Implement `src/lib/validations/archetype-wizard.ts` with `createEventWizardSchema` and sub-schemas
- [x] T002 Implement unit tests in `tests/unit/events/archetype-wizard-validation.test.ts` (Red-Green)
- [x] T003 Update `src/lib/validations/event.ts` to support optional `archetype` and initial taxonomy items in `createEventSchema`

---

## Phase 2: Archetype Selector & Taxonomy Editor UI Components

**Purpose**: Build accessible, zero-radius UI components for archetype selection and dynamic taxonomy editing.

- [x] T004 Implement `src/features/events/components/archetype-selector.tsx` with zero-radius cards, WCAG 2.1 AA dual-theme contrast, and terminology preview
- [x] T005 Implement unit tests in `tests/unit/events/archetype-selector.test.tsx`
- [x] T006 Implement `src/features/events/components/taxonomy-editor.tsx` supporting positions, tracks, divisions, and seat limits in both draft and persistent mode
- [x] T007 Implement unit tests in `tests/unit/events/taxonomy-editor.test.tsx`

---

## Phase 3: Event Creation Wizard & Form State Integration

**Purpose**: Build the multi-step `event-creation-wizard.tsx` combining general details, archetype selection, and taxonomy setup with state persistence.

- [x] T008 Implement `src/features/events/components/event-creation-wizard.tsx` with multi-step progression, form preservation, and inline validation
- [x] T009 Implement unit tests in `tests/unit/events/event-creation-wizard.test.tsx`
- [x] T010 Update `src/features/events/components/CreateEventForm.tsx` and `src/app/(dashboard)/events/new/page.tsx` to integrate the new wizard
- [x] T011 Re-export new components in `src/features/events/components/index.ts` and `src/features/events/index.ts`

---

## Phase 4: Backend Service & Settings Tab Integration

**Purpose**: Connect wizard submission to `createEvent` service with atomic position/division creation and adapt the Settings page tab.

- [x] T012 Update `src/features/events/services/create-event.ts` and `src/features/events/actions/create-event.ts` to persist archetype and initial taxonomy items atomically
- [x] T013 Update `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx` to dynamically render positions/tracks when event is `STUDENT_COUNCIL` or `HACKATHON`
- [x] T014 Implement/update unit tests in `tests/unit/events/create-event-service.test.ts` and `tests/unit/events/category-awards-settings.test.tsx`

---

## Phase 5: Verification & Quality Gates

**Purpose**: Run all test suites, typechecks, linter, and constitutional checks.

- [x] T015 Run unit tests: `npm run test:unit tests/unit/events/`
- [x] T016 Run full test suite: `npm run test:unit`
- [x] T017 Run typecheck and lint: `npm run typecheck && npm run lint`
- [x] T018 Run constitution check and graphify auto-sync

---

## Phase 6: Automated Pull Request & Sync

**Purpose**: Open PR targeting `main` and report progress.

- [x] T019 Rebase onto latest `origin/main` and push branch `feature/VS-84-archetype-tailored-event-wizard`
- [x] T020 Open Pull Request via GitHub CLI with comprehensive description
- [x] T021 Add implementation comment to Jira ticket VS-84 and mark complete
