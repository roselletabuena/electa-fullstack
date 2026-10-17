# Implementation Tasks: Disable Non-Pageant Archetypes

**Feature ID**: `047-disable-non-pageant-archetypes`  
**Jira Key**: `VS-117`  
**Date**: 2026-10-17  

---

## Phase 1: Archetype Types & Data Contracts
- [x] Task 1.1: Augment `ArchetypeConfig` in `src/features/events/types/archetype.ts` with `isComingSoon?: boolean`
- [x] Task 1.2: Mark `STUDENT_COUNCIL`, `HACKATHON`, and `CUSTOM` as `isComingSoon: true` and `PAGEANT` as `isComingSoon: false` in `EVENT_ARCHETYPE_CONFIGS`
- [x] Task 1.3: Export `ACTIVE_ARCHETYPES`, `COMING_SOON_ARCHETYPES`, `isArchetypeAvailable()`, and `isArchetypeComingSoon()` helper functions

## Phase 2: Component Refactor & WCAG Contrast Styling
- [x] Task 2.1: Update `src/features/events/components/archetype-selector.tsx` to inspect `config.isComingSoon`
- [x] Task 2.2: Implement visual disabled state with `opacity-60 cursor-not-allowed` and sharp zero-radius styling (`rounded-none`)
- [x] Task 2.3: Render high-contrast dual-theme "COMING SOON" pill badge (amber-100/amber-900 light, amber-950/amber-200 dark)
- [x] Task 2.4: Enforce accessibility with `aria-disabled="true"` and suppress `onChange` execution on click and Space/Enter key presses
- [x] Task 2.5: Ensure "Beauty Pageant" remains active, selectable, and displays the "Selected" badge

## Phase 3: Server & Schema Boundary Guardrails
- [x] Task 3.1: Update `createEventSchema` in `src/lib/validations/event.ts` with refinement validating archetype availability
- [x] Task 3.2: Update `createEventWizardSchema` in `src/lib/validations/archetype-wizard.ts` to reject disabled archetypes
- [x] Task 3.3: Add defense-in-depth guardrail in `src/features/events/services/create-event.ts` returning 400 validation error for disabled archetypes
- [x] Task 3.4: Verify `src/features/events/components/event-creation-wizard.tsx` initializes and locks active archetype to Pageant

## Phase 4: Automated Testing & TDD Verification
- [x] Task 4.1: Update `tests/unit/events/archetype-selector.test.tsx` to verify disabled states, badges, keyboard suppression, and accessibility attributes
- [x] Task 4.2: Update `tests/unit/events/archetype-validation.test.ts` to test schema rejection of coming soon archetypes
- [x] Task 4.3: Update `tests/unit/events/create-event-service.test.ts` to assert rejection of `STUDENT_COUNCIL`, `HACKATHON`, and `CUSTOM`
- [x] Task 4.4: Run full unit test suite `npm run test:unit`

## Phase 5: Code Review, Quality Gates & Pull Request
- [x] Task 5.1: Run `npm run typecheck` and `npm run lint`
- [x] Task 5.2: Execute Code Review audit (spec & standards axes + 5 quality dimensions)
- [x] Task 5.3: Run `constitution-check` and `graphify-auto-sync`
- [x] Task 5.4: Post completion comment to Jira issue `VS-117` and trigger `pr-creator`
