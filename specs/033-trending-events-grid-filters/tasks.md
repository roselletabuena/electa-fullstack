# Implementation Tasks: Trending Events Grid & Lifecycle Status Filters

**Feature ID**: `033-trending-events-grid-filters`  
**Jira Key**: [VS-92](https://the-three-devsketeers.atlassian.net/browse/VS-92)

---

## Phase 1: Core Types, Validation & Utilities (TDD)

- [ ] **Task 1.1: Core Types & Contracts** `feat(events): add trending events types, schemas and contracts`
  - Define `EventLifecycleFilter`, `TrendingEventItemDto`, and Zod schemas in `src/features/events/types/index.ts` and contracts.
- [ ] **Task 1.2: Countdown & Filter Utilities (Test-First)** `feat(events): implement countdown formatter and lifecycle filtering utilities`
  - Implement unit tests in `tests/unit/events/format-countdown.test.ts`.
  - Implement `formatLifecycleCountdown` and `filterEventsByLifecycle` in `src/features/events/utils/`.

---

## Phase 2: UI Components with Strict Zero-Radius Design (TDD)

- [ ] **Task 2.1: Lifecycle Filters Bar Component** `feat(events): create EventLifecycleFilters tab component`
  - Implement `EventLifecycleFilters.tsx` with zero-radius buttons, count badges, and ARIA attributes.
  - Implement unit test `tests/unit/events/EventLifecycleFilters.test.tsx`.
- [ ] **Task 2.2: Trending Event Card Component** `feat(events): create TrendingEventCard with countdown pill and contextual CTA`
  - Implement `TrendingEventCard.tsx` with dark scrim over poster banner, countdown pill, location, contestant count, and status-dependent CTA.
  - Implement unit test `tests/unit/events/TrendingEventCard.test.tsx`.
- [ ] **Task 2.3: Trending Events Grid & Empty State** `feat(events): create TrendingEventsGrid and empty state`
  - Implement `TrendingEventsGrid.tsx` with responsive layout, skeleton loading, and empty state with reset filter button.
  - Implement unit test `tests/unit/events/TrendingEventsGrid.test.tsx`.

---

## Phase 3: Query Hook, Client Section & Landing Page Assembly

- [ ] **Task 3.1: Trending Events Hook & Client Section** `feat(events): create useTrendingEvents hook and TrendingEventsSection`
  - Implement `useTrendingEvents` TanStack Query hook.
  - Implement `TrendingEventsSection.tsx` with `nuqs` URL state synchronization wrapped in `<Suspense>`.
- [ ] **Task 3.2: Landing Page Integration** `feat(landing): integrate TrendingEventsSection below hero discovery section`
  - Integrate `TrendingEventsSection` into `src/app/page.tsx` beneath the hero section.

---

## Phase 4: Quality Gate & Verification

- [ ] **Task 4.1: Test Suite Verification** `test(events): run full vitest suite and ensure 100% pass rate`
- [ ] **Task 4.2: Typecheck, Lint, and Constitution Audit** `chore(qa): verify typecheck, lint, and constitution checks`
