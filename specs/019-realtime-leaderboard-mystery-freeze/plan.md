# Implementation Plan: Real-Time Live Leaderboard & Stealth Mystery Freeze

**Feature**: `019-realtime-leaderboard-mystery-freeze`  
**Jira Key**: `VS-22`  
**Branch**: `feature/VS-22-realtime-leaderboard-mystery-freeze`

---

## 1. Architecture & Module Structure

```text
src/
├── app/
│   ├── (public)/
│   │   └── events/
│   │       └── [slug]/
│   │           └── leaderboard/
│   │               └── page.tsx          # Public Leaderboard Page (RSC + Suspense)
│   └── api/
│       └── events/
│           └── [slug]/
│               └── leaderboard/
│                   └── route.ts          # Event-scoped leaderboard API route handler
├── features/
│   └── leaderboard/
│       ├── components/
│       │   ├── LeaderboardView.tsx       # Main client container with realtime listener
│       │   ├── PodiumSection.tsx         # Top 3 Gold/Silver/Bronze visual podium
│       │   ├── LeaderboardRoster.tsx     # 4th place and below list ranking cards
│       │   ├── MysteryFreezeBanner.tsx   # "Mystery Freeze in Effect" alert banner
│       │   └── CategoryFilterTabs.tsx    # Division & award category filter pills
│       ├── hooks/
│       │   └── useLeaderboardRealtime.ts # Hook subscribing to Supabase Realtime / polling
│       ├── utils/
│       │   ├── rank-calculator.ts        # Pure utility for sorting, rank & gap math
│       │   └── freeze-guard.ts           # Evaluates freeze schedule & field redaction
│       └── types/
│           └── index.ts                  # Exported types and schemas
tests/
└── unit/
    └── leaderboard/
        ├── rank-calculator.test.ts       # Unit tests for rank math, tie handling, gap metrics
        ├── freeze-guard.test.ts          # Unit tests for freeze evaluation & payload redaction
        ├── leaderboard-route.test.ts     # Unit tests for /api/events/[slug]/leaderboard
        └── podium-section.test.tsx       # Unit tests for Top 3 podium rendering & WCAG
```

---

## 2. Technical Stack & Governance

- **Framework**: Next.js 16 App Router (React Server Component entry point with dynamic client boundary).
- **Styling**: Tailwind CSS v4, Electa Light Opal default, strict zero-radius (`rounded-none`), Outfit / Sora typography.
- **State**: `nuqs` for URL tab params, TanStack Query for caching and periodic background sync.
- **Constitution**: §I (strict TypeScript, Zod), §II (RSC & Suspense, await params), §III (Prisma singleton), §IV (auth guard via `getSession()`), §V (colocation in `src/features/leaderboard/`).
