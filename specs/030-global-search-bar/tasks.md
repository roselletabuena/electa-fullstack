# Implementation Tasks: Global Event & Candidate Search Bar

**Feature ID**: `030-global-search-bar`  
**Jira Key**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88)  
**Parent Epic**: [VS-86: Core Global Shell](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Status**: Completed  
**Created**: 2026-10-12

---

## Phase 1: Contracts & Types

- [x] **Task 1.1: Core Types & Contracts** `feat(search): define search contracts, DTOs, and validation schemas`
  - Create `src/features/search/types/index.ts` with Zod validation schemas (`searchQuerySchema`, `searchResultsSchema`).
  - Export typed interfaces for search query input, results, and component props.

---

## Phase 2: UI Primitives & Input Component

- [x] **Task 2.1: Reusable Zero-Radius Input Primitive** `feat(ui): add brutalist zero-radius input primitive component`
  - Create `src/components/ui/input.tsx` conforming to Electa Brutalist-Refined Opal/Obsidian tokens (`rounded-none`, hairline borders, high-contrast states).
  - Export `Input` with forwardRef, accessible focus states, and styling variants.

---

## Phase 3: State Management & Hooks

- [x] **Task 3.1: Search Query & Debouncing Hook** `feat(search): implement useSearchQuery hook with nuqs and 300ms debouncing`
  - Create `src/features/search/hooks/useSearchQuery.ts` integrating `useQueryState` from `nuqs`.
  - Provide immediate local input state alongside 300ms debounced URL synchronization.
  - Implement `submitQuery()` for immediate execution on `Enter` and `clearQuery()` for `Escape` or reset.
  - Create `src/features/search/utils/search-filters.ts` for client-side multi-field filtering.

---

## Phase 4: Multi-Entity Search API

- [x] **Task 4.1: Search Route Handler** `feat(search): create multi-entity search API route handler`
  - Create `src/app/api/search/route.ts` handling `GET /api/search?q=...`.
  - Validate query with Zod `searchQuerySchema`.
  - Query PostgreSQL via Prisma singleton (`src/lib/db.ts`) across published `Event`, `Contestant`, and `AwardCategory` records.
  - Return standardized `ApiResponse<SearchResults>` envelope.

---

## Phase 5: UI Components & Keyboard Navigation

- [x] **Task 5.1: GlobalSearchBar Component** `feat(search): build GlobalSearchBar with instant filtering and keyboard navigation`
  - Create `src/features/search/components/GlobalSearchBar.tsx`.
  - Integrate search icon, zero-radius input, clear (`X`) button, and "SEARCH" submit button.
  - Implement keyboard listeners (`Enter` to submit and smooth scroll, `Escape` to clear).
  - Create `src/features/search/components/SearchResultsView.tsx` displaying categorized results or empty states.
  - Create barrel exports in `src/features/search/index.ts`.

---

## Phase 6: Landing Page & Shell Integration

- [x] **Task 6.1: Discovery Shell Integration** `feat(home): embed GlobalSearchBar into public discovery landing page`
  - Update `src/app/page.tsx` to feature `GlobalSearchBar` within a `<Suspense>` boundary.
  - Connect search query to reactive event filtering or discovery results.

---

## Phase 7: Automated Unit Tests

- [x] **Task 7.1: Unit Test Suites** `test(search): add unit test suites for search hook, search bar, and API handler`
  - Create `tests/unit/search/useSearchQuery.test.tsx` testing debouncing and `nuqs` synchronization.
  - Create `tests/unit/search/GlobalSearchBar.test.tsx` testing keyboard interactions, clear button, and accessibility.
  - Create `tests/unit/search/search-api.test.ts` testing schema validation and API handling.

---

## Phase 8: Verification & Quality Gates

- [x] **Task 8.1: Quality Verification & Sync** `chore(qa): verify test suite, typecheck, lint, and constitution checks`
  - Run `npm run typecheck` (zero TypeScript errors).
  - Run `npm run lint` (zero ESLint/Prettier errors on new code).
  - Run `npm run test:unit` (100% test pass rate across all 99 test files).
  - Run `constitution-check` and `graphify-auto-sync`.
  - Update Jira issue VS-88 status to `Done`.
