# Feature Specification: Global Event & Candidate Search Bar with Instant Filtering & Keyboard Navigation

**Feature ID**: `030-global-search-bar`  
**Jira Key**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88)  
**Parent Epic**: [VS-86: [UI Components] Core Global Shell: Navigation Bar, Search Bar, and Footer](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Related Epic**: [VS-90: Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Execution Order**: Milestone 1.2 (Foundational Global Shell & Discovery)  
**Status**: Draft  
**Created**: 2026-10-12

---

## 🎯 Executive Summary & Overview

Electa is a high-stakes, real-time civic, collegiate, and pageant voting platform. To empower voters and public discovery, users require an instant, intuitive, and accessible search interface that enables quick discovery of active pageants, school elections, divisions, categories, and contestants.

The Global Search Bar provides instant debouncing (300ms), keyboard navigation (`Enter` to submit/scroll, `Escape` to reset, arrow key interactions), bidirectional URL synchronization via `nuqs` (`?q=`), and zero-radius Brutalist-Refined styling across Opal Light Mode and Obsidian Dark Mode.

---

## 👥 Personas & Actors

1. **Public Visitor / Event Voter**: Searches by pageant title (e.g., "Miss Luzon"), university/school, category ("Best in Evening Gown"), or contestant name ("Maria"). Expects instantaneous results without page reloads or layout shift.
2. **Keyboard-Only & Power User**: Activates search via keyboard shortcut, navigates autocomplete results or clears query instantly via `Escape`, and submits search via `Enter` to scroll smoothly to matching cards.
3. **Screen Reader User**: Relies on explicit ARIA roles, live regions announcing search result counts, accessible clear buttons, and high-contrast focus rings.

---

## 📋 Functional Requirements

1. **Instant Input Debouncing**:
   - As the user types into the input, query state updates are debounced by 300ms before firing background API queries or updating the URL.
   - Prevents unnecessary network calls while maintaining a responsive feel.

2. **Bidirectional URL Synchronization (`nuqs`)**:
   - The active search query is synchronized to the `?q=` URL search parameter using `nuqs`.
   - Initial page loads hydrate the search input value from the URL `?q=` parameter.
   - Modifying the query replaces or pushes the URL parameter shallowly without full-page reloads.

3. **Keyboard Navigation & Quick Actions**:
   - `Enter` key: Immediately commits the query (bypassing remaining debounce timeout), executes the search, and smoothly scrolls to `#search-results` or `#events-grid`.
   - `Escape` key: Clears the search input, removes `?q=` from the URL, restores initial state, and keeps input focus.
   - Clear button (`X` icon): Visible when query is non-empty; clicking clears the input and resets the URL.
   - Submit button ("SEARCH" or Search icon button): Clicking immediately executes the search.

4. **Multi-Entity Search API**:
   - A dedicated server route (`GET /api/search?q=...`) that queries published `Event` records (matching `title` or `description`), active `Contestant` records (matching `name`, `hometown`, `bio`), and `AwardCategory` records (matching `name`).
   - Validated against a strict Zod schema with sanitized inputs.
   - Returns a structured `ApiResponse<SearchResultsDto>` containing grouped matches.

5. **Design System & Zero-Radius Geometry**:
   - Brutalist-Refined zero-radius styling (`rounded-none`, `--radius: 0px`).
   - Opal Light Mode (`bg-white`, `border-slate-300`, `text-slate-900`).
   - Obsidian Dark Mode (`dark:bg-[#0d1424]`, `dark:border-slate-700`, `dark:text-slate-100`).
   - High-contrast focus outline (`focus-visible:outline-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400`).
   - Minimum WCAG 2.1 AA color contrast for placeholder, text, icons, and borders.

6. **Responsive Shell & Navigation Bar Integration**:
   - Usable as a standalone discovery search bar on landing and event catalog pages.
   - Adaptable for embedding into `SiteHeader` or secondary navigation bars across desktop and mobile viewports.

---

## 🧪 User Scenarios & Acceptance Criteria (Gherkin)

### Scenario 1: Instant Search & Input Debouncing (Happy Path)

- **Given** a user navigates to an Electa page featuring the global search bar,
- **When** the user types "Miss Luzon" into the search input,
- **Then** keystroke changes are debounced by 300ms before querying the search API or updating filtered state,
- **And** the query string is synchronized with the URL query parameter `?q=Miss+Luzon` via `nuqs`,
- **And** matching events and contestant cards update reactively.

### Scenario 2: Keyboard Navigation & Quick Actions

- **Given** the search bar contains the text "Northern",
- **When** the user presses the `Enter` key or clicks the "SEARCH" button,
- **Then** the search executes immediately and the viewport smoothly scrolls to the results container (`#search-results` or `#events-grid`),
- **When** the user presses the `Escape` key or clicks the clear (`X`) button,
- **Then** the search query is emptied, `?q=` is removed from the URL, and the results view resets to all items.

### Scenario 3: Brutalist Zero-Radius Styling & Dual-Theme Accessibility

- **Given** the search bar is rendered in either Opal Light Mode or Obsidian Dark Mode,
- **When** the input is in default, hovered, or focused states,
- **Then** all containers, input fields, and action buttons render sharp 0px corners (`rounded-none`),
- **And** the border adheres to crisp hairline styling (`border-slate-300 dark:border-slate-700`),
- **And** the focused state uses an accessible outline with minimum 3:1 contrast against the surface,
- **And** an explicit accessible `aria-label` or `<label>` element is associated with the input.

---

## ⚠️ Edge Cases & Constraints

1. **Rapid Typing & Race Conditions**: If a user types quickly and cancels, debounced network requests must not overwrite later queries. TanStack Query query keys `['search', debouncedQuery]` ensure query deduplication and cache invalidation.
2. **Special Characters & SQL/XSS Injection**: Input must be trimmed and validated with Zod string schema; Prisma parameterized queries prevent injection.
3. **Empty or Whitespace-Only Queries**: When empty or spaces only, search is bypassed, `?q=` is cleared, and default/all results are displayed.
4. **No Matching Results**: An accessible empty state message ("No events or contestants found for '{query}'") must be displayed with a button to clear the query.
5. **Next.js App Router Suspense**: Any component reading `nuqs` or search params must be wrapped in a `<Suspense>` boundary to prevent CSR bailout or build errors in Next.js 16.

---

## 🚫 Out of Scope

- Full Algolia / Elasticsearch cluster deployment (Prisma PostgreSQL ILIKE is used for current scale).
- Complex phonetic or fuzzy spell-check algorithms.
- Full landing page hero marketing layout (Milestone 1.3: `VS-91`).
- Trending events grid and status tab filters (Milestone 1.4: `VS-92`).

---

## 🏆 Success Criteria

- 100% of search inputs synchronize with the URL `?q=` parameter via `nuqs`.
- Keystrokes debounced to 300ms; zero lagging or UI freeze during fast typing.
- WCAG 2.1 AA compliance verified in both Opal Light Mode and Obsidian Dark Mode.
- 100% test pass rate across unit and component test suites.

---

## 🛡️ Dependencies & Assumptions

- Relies on: `nuqs` (`NuqsAdapter` configured in `src/app/layout.tsx`).
- Relies on: TanStack Query for server state management.
- Relies on: Prisma singleton from `src/lib/db.ts`.
- Relies on: `ApiResponse<T>` envelope from `src/lib/api/response.ts`.
- Relies on: Electa design tokens in `src/app/globals.css`.
