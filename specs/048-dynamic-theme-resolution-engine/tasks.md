# Implementation Tasks: Dynamic Theme Resolution Engine

**Feature ID**: `048-dynamic-theme-resolution-engine`  
**Ticket**: [VS-120](https://the-three-devsketeers.atlassian.net/browse/VS-120)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Branch**: `feature/VS-120-dynamic-theme-resolution-engine`  

---

## Phase 1: Domain Types & Validation Contracts

**Purpose**: Define TypeScript types, contracts, and Zod schemas for event theme inputs.

- [x] T001 Define `EventTheme`, `ThemeTokens`, `ThemeDefinition` in `src/features/events/types/theme.ts`
- [x] T002 Extend `PublicEventDto` with `theme?: EventTheme` in `src/features/events/types/index.ts` and re-export theme types
- [x] T003 Update `updateEventBrandingSchema` in `src/lib/validations/event-branding.ts` to support optional `theme`
- [x] T004 Implement unit tests in `tests/unit/events/branding-validation.test.ts` for branding schema theme validation

---

## Phase 2: Theme Registry & Token Resolution Engine (TDD)

**Purpose**: Build token dictionaries for `ELECTA_DEFAULT` and `PAGEANT_EDITORIAL` with fail-safe resolution and warning logs.

- [x] T005 Write unit tests for `resolveEventTheme` and token mapping in `tests/unit/events/theme-resolution.test.ts` (Red)
- [x] T006 Implement `src/features/events/theme/theme-registry.ts` with `THEME_REGISTRY`, `resolveEventTheme`, and token-to-CSS-variables mapper (Green)
- [x] T007 Create barrel export in `src/features/events/theme/index.ts`

---

## Phase 3: EventThemeProvider & SSR Integration

**Purpose**: Implement server/client theme container injecting `data-event-theme` and scoped CSS variables to guarantee zero FOUT.

- [x] T008 Write component tests in `tests/unit/events/theme-provider.test.tsx` verifying SSR HTML output and attribute injection
- [x] T009 Implement `src/features/events/theme/EventThemeProvider.tsx`
- [x] T010 Integrate `EventThemeProvider` into `src/app/(public)/events/[slug]/page.tsx`
- [x] T011 Update mock event data in `src/features/events/utils/mock-data.ts` to include default theme

---

## Phase 4: Database Schema & Safe Migration

**Purpose**: Add `EventTheme` enum and `Event.theme` column with safe default `ELECTA_DEFAULT` via `db-migrate`.

- [x] T012 Update `prisma/schema.prisma` with `EventTheme` enum and `Event.theme` field
- [x] T013 Run safe Prisma migration and regenerate client via `db-migrate`

---

## Phase 5: Verification, Quality Gates & Pull Request

**Purpose**: Execute all verification gates, code review standards audit, and trigger `pr-creator`.

- [x] T014 Run full unit test suite: `npm run test:unit`
- [x] T015 Run typecheck and lint: `npm run typecheck && npm run lint`
- [x] T016 Perform two-axis Code Review (Spec & Standards) and 5-axis quality audit
- [ ] T017 Trigger `pr-creator` to rebase on `origin/main`, push, and open PR
- [ ] T018 Post completion changelog and PR link comment to Jira ticket VS-120
