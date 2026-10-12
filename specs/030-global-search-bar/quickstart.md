# Quickstart & Verification Guide: Global Event & Candidate Search Bar

**Feature ID**: `030-global-search-bar`  
**Jira Key**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88)  
**Date**: 2026-10-12

---

## 1. Overview & Setup

The Global Search Bar provides responsive, debounced search across pageants, categories, and contestants. It synchronizes with the `?q=` URL parameter via `nuqs` and enforces Brutalist-Refined zero-radius styling.

### Prerequisites

- Node.js 20+
- Dependencies installed: `npm install`
- Local dev server: `npm run dev`

---

## 2. Verification Walkthrough Scenarios

### Scenario A: Instant Search & Input Debouncing Walkthrough

1. Navigate to the Electa homepage `http://localhost:3000`.
2. Locate the global search bar.
3. Type `"Miss Luzon"` into the input.
4. **Observe**:
   - The input updates immediately with each keystroke (zero lag).
   - After a 300ms pause in typing, the URL parameter updates to `?q=Miss+Luzon`.
   - Matching event and contestant cards filter reactively.

### Scenario B: Keyboard Navigation & Quick Actions Walkthrough

1. Type a query (e.g. `"Maria"`).
2. Press `Enter` on the keyboard or click the `"SEARCH"` button.
3. **Observe**:
   - The search executes immediately without waiting for debounce timeout.
   - The viewport smoothly scrolls to the results container (`#search-results` or `#events-grid`).
4. Press `Escape` on the keyboard or click the clear (`X`) button.
5. **Observe**:
   - The input is cleared.
   - The URL parameter `?q=` is removed.
   - The event grid resets to show all items.

### Scenario C: Direct URL Bookmark Walkthrough

1. Navigate directly to `http://localhost:3000?q=Northern`.
2. **Observe**:
   - The search input is pre-populated with `"Northern"`.
   - The event grid is filtered to match `"Northern"`.

### Scenario D: Brutalist Zero-Radius & Theme Contrast Walkthrough

1. Inspect the search bar in Opal Light Mode (`#F8FAFC`).
2. Verify sharp 0px corners (`rounded-none`), hairline border (`border-slate-300`), and dark text (`text-slate-900`).
3. Click the theme switcher to toggle to Obsidian Dark Mode.
4. Verify dark surface (`dark:bg-[#0d1424]`), dark hairline border (`dark:border-slate-700`), and crisp light text (`dark:text-slate-100`).

---

## 3. Automated Test Suite Execution

Run the dedicated search unit tests:

```bash
npm run test:unit tests/unit/search/
```

Run full typecheck and linting:

```bash
npm run typecheck
npm run lint
```
