# Research & Architecture Decisions: Trending Events Grid & Lifecycle Status Filters

**Feature**: `033-trending-events-grid-filters`  
**Date**: 2026-10-12

---

## 🏛️ Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed                               |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                                                           |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)                                       |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`                                     |
| Server State  | TanStack Query — never mirror server data in Zustand                                                  |
| Client State  | Zustand `auth-store` for session only                                                                 |
| URL State     | `nuqs` for search params, pagination, filters                                                         |
| Forms         | React Hook Form + Zod (`zodResolver`)                                                                 |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                                              |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                                                   |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                                               |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

---

## 🔍 Technical Decisions & Rationale

### 1. State Management & Filtering Architecture

- **Decision**: Use `nuqs` (`useQueryState`) inside `TrendingEventsSection` wrapped in `<Suspense>`, fetching events via TanStack Query from `/api/events`.
- **Rationale**:
  - URL state synchronization allows users to share direct links to filtered views (e.g. `/?status=active`).
  - TanStack Query provides instant client-side caching (`staleTime: 60_000`), background refetching, and clean loading/error states.
  - Zero hydration mismatch because `nuqs` handles query parameters smoothly in Next.js 16 App Router.

### 2. Operational Lifecycle Derivation

- **Decision**: Reuse existing `deriveEventState()` from `@/features/events/utils/derive-event-state` and format relative countdown time for countdown badges.
- **Rationale**:
  - Consistent logic across backend API and frontend card display.
  - Lifecycle state derivation considers authoritative `startsAt` and `endsAt` against current timestamp:
    - `startsAt > now`: `Scheduled` (Upcoming)
    - `startsAt <= now && now < endsAt`: `Active` (Live Voting)
    - `endsAt <= now`: `Closed` (Concluded)

### 3. Countdown Pill Formatting

- **Decision**: Create a lightweight utility `formatLifecycleCountdown(event, now)` that formats:
  - Active: `⏳ Xd Yh left` (or `⏳ Xh Ym left` if < 24h, or `⏳ Closing soon` if < 1h)
  - Scheduled: `Opens in Xd Yh` (or formatted date e.g. `Opens in 3d`)
  - Closed: `Final Tallies`
- **Rationale**: Clean, scannable brutalist pills without heavy external time libraries like moment.js. Uses native Date calculations.

### 4. Zero-Radius Brutalist Design & WCAG AA Contrast Compliance

- **Decision**: Strict `rounded-none` across cards, banners, badges, and buttons.
  - Filter pills: High contrast active state (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold`).
  - Card borders: `border border-slate-300 dark:border-slate-800` on surfaces `bg-white dark:bg-[#0d1424]`.
  - Image scrim: `bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent` to protect pill contrast over arbitrary banner images.

---

## 🛠️ Verification Checklist

- [x] Zero usage of `rounded-md`, `rounded-lg`, `rounded-full` (except circular avatar icons).
- [x] Dual-theme contrast verified with minimum 4.5:1 ratio for text and 3:1 for interactive borders.
- [x] Next.js 16 dynamic client boundary enclosed in `<Suspense>`.
