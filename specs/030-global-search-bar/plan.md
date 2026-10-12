# Implementation Plan: Global Event & Candidate Search Bar

**Feature ID**: `030-global-search-bar`  
**Jira Key**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88)  
**Parent Epic**: [VS-86: Core Global Shell](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Related Epic**: [VS-90: Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Date**: 2026-10-12

---

## 1. Architectural Boundaries & Component Mapping

```text
src/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # Typed GET /api/search?q=... route returning ApiResponse<SearchResultsDto>
│   └── page.tsx                  # Public landing / home page integrating GlobalSearchBar and discovery results
├── features/
│   ├── search/
│   │   ├── components/
│   │   │   ├── GlobalSearchBar.tsx        # Zero-radius debounced search bar with nuqs and keyboard bindings
│   │   │   ├── SearchInput.tsx            # Accessible zero-radius input primitive with clear button
│   │   │   ├── SearchResultsView.tsx      # Grouped results card list for events, contestants, and categories
│   │   │   └── index.ts                   # Component barrel exports
│   │   ├── hooks/
│   │   │   ├── useSearchQuery.ts          # nuqs useQueryState + 300ms debouncing hook
│   │   │   └── index.ts                   # Hook barrel exports
│   │   ├── types/
│   │   │   └── index.ts                   # Search query interfaces and Zod schemas
│   │   ├── utils/
│   │   │   ├── search-filters.ts          # Client-side filtering utilities and string normalizers
│   │   │   └── index.ts
│   │   └── index.ts                       # Feature slice barrel export
│   └── navigation/
│       └── components/
│           └── site-header.tsx            # Optionally supports embedding GlobalSearchBar
└── components/
    └── ui/
        └── input.tsx                      # Brutalist-refined zero-radius Input UI primitive
```

---

## 2. Design System Alignment

- **Corners**: Strict zero-radius (`rounded-none`, `--radius: 0px`) across all search containers, inputs, buttons, and result items.
- **Color Palette**:
  - Light Mode (Opal): `bg-white`, `border-slate-300`, `text-slate-900`, `placeholder:text-slate-500`.
  - Dark Mode (Obsidian): `dark:bg-[#0d1424]`, `dark:border-slate-700`, `dark:text-slate-100`, `dark:placeholder:text-slate-400`.
  - Search Submit Button: Primary action button styling (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase`).
- **Typography**: `font-sans` for input text, `font-heading` for search button and section headers.
- **Accessibility**: Explicit `aria-label="Search events, pageants, and contestants"`, accessible keyboard shortcuts, minimum 4.5:1 text contrast and 3:1 focus ring contrast (`outline-2 outline-sky-600 dark:outline-sky-400`).

---

## 3. Test Plan

### Test File: `tests/unit/search/useSearchQuery.test.tsx`

- Tests URL query synchronization with `nuqs`.
- Tests 300ms debouncing behavior (immediate local state update, debounced URL sync).
- Tests immediate execution on `submitQuery()`.
- Tests clearing query and resetting URL on `clearQuery()`.

### Test File: `tests/unit/search/GlobalSearchBar.test.tsx`

- Tests rendering with default, empty, and initial query states.
- Tests typing with debounced callback triggering.
- Tests pressing `Enter` executing search immediately and invoking scroll callback.
- Tests pressing `Escape` clearing the input and resetting URL.
- Tests clicking the clear (`X`) button resetting the input.
- Tests accessibility attributes (`aria-label`, role).

### Test File: `tests/unit/search/search-api.test.ts`

- Tests validation of search query parameters using Zod.
- Tests empty/whitespace query rejection or graceful fallback.
- Tests multi-entity search logic across events, contestants, and categories.

---

## 4. Quality & Constitutional Verification Gates

- Pass `npm run typecheck` (strict TypeScript 5, zero `any`, zero non-null assertions `!`).
- Pass `npm run lint` (ESLint 9 + Prettier).
- Pass `npm run test:unit` (Vitest unit tests).
- Pass `constitution-check` (§I–§VI).
- Pass `graphify-auto-sync`.
