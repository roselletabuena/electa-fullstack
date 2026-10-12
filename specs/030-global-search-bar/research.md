# Research & Architecture Decisions: Global Event & Candidate Search Bar

**Feature**: `030-global-search-bar`  
**Jira Key**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88)  
**Date**: 2026-10-12

---

## 🏛️ Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only for interactivity                      |
| Language      | TypeScript 5 strict mode — zero `any`, zero `!`, zero type casting bypass                          |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)                                    |
| Server State  | TanStack Query (`@tanstack/react-query`) for API fetching                                          |
| URL State     | `nuqs` (`useQueryState`) for `?q=` URL synchronization                                             |
| Forms/Inputs  | React controlled inputs with Zod string validation                                                 |
| API Responses | Standard `ApiResponse<T>` envelope (`src/lib/api/response.ts`)                                     |
| Styling       | Tailwind CSS 4 tokens (`src/app/globals.css`), `bg-linear-to-*`                                    |
| Branding/UI   | Opal Light Mode default (`#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |
| Testing       | Vitest (`tests/unit/`), `@testing-library/react`, jsdom                                            |

---

## 🔬 Technical Decisions & Rationale

### 1. URL State Synchronization with `nuqs`

- **Decision**: Use `nuqs` (`parseAsString.withDefault("").withOptions({ shallow: true, history: "push", startTransition })`) to synchronize the search query to the `?q=` URL parameter.
- **Rationale**: Electa Constitution §III strictly mandates URL state synchronization for search, filters, and pagination via `nuqs`. This enables shareable search URLs, bookmarking, and native browser forward/back button navigation without losing search state.
- **Alternatives Considered**: Native `next/navigation` `useRouter` / `useSearchParams`. Rejected because `nuqs` provides type-safe parsers, shallow updates without RSC re-execution overhead, and smooth transition integration.

### 2. Dual-Layer Debouncing Strategy (Local vs URL)

- **Decision**: Maintain immediate local input state for smooth typing response, while debouncing the `nuqs` URL synchronization and API query trigger by 300ms.
- **Rationale**: Immediate input binding ensures 60 FPS typing without caret jump or perceptible lag. Debouncing the URL update and API request by 300ms avoids thrashing browser history and spamming the backend API.
- **Immediate Commit on `Enter`**: When the user presses `Enter` or clicks the "SEARCH" button, any pending debounce timer is cleared and the query is synchronized immediately.

### 3. Multi-Entity Search API (`/api/search`)

- **Decision**: Implement a typed `GET /api/search?q=...` route using Prisma PostgreSQL query filters (`contains` with `mode: 'insensitive'`) spanning:
  - `Event`: `title`, `description` (where `publicationStatus` is `PUBLISHED`)
  - `Contestant`: `name`, `hometown`, `bio` (where `status` is `ACTIVE` and event is `PUBLISHED`)
  - `AwardCategory`: `name`, `description`
- **Rationale**: Provides instant multi-domain discovery. Voters frequently remember a contestant's name (e.g. "Maria") or a pageant title (e.g. "Miss University") rather than the exact event slug.

### 4. Zero-Radius Brutalist Styling & Dual-Theme Contrast

- **Decision**: Enforce strict `rounded-none`, hairline borders (`border-slate-300 dark:border-slate-700`), high-contrast icons and typography.
- **Rationale**: Conforms to the Electa Design System (Brutalist-Refined Opal/Obsidian theme). Ensures WCAG 2.1 AA compliance with minimum 4.5:1 text contrast and 3:1 focus ring contrast across both themes.

### 5. Suspense Boundary Encapsulation

- **Decision**: Wrap client components consuming `nuqs` inside a `<Suspense>` fallback boundary.
- **Rationale**: Next.js App Router requires any component reading client search params to be encapsulated within a `<Suspense>` boundary to prevent server rendering de-optimization.
