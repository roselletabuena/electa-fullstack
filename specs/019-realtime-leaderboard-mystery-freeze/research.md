# Research: Real-Time Live Leaderboard & Stealth Mystery Freeze

**Feature**: `019-realtime-leaderboard-mystery-freeze`  
**Jira Key**: `VS-22`  
**Date**: 2026-10-02

---

## 1. Real-Time Transport Architecture

### Context

VoteSphere requires instant updates to vote counts and leaderboard rankings when votes are cast without overloading backend databases or exhausting free-tier serverless limits.

### Decision: Supabase Realtime Broadcast / Polling Fallback

- **Mechanism**: Use Supabase Realtime Channels (`events:<eventId>:leaderboard`) for lightweight broadcast events triggered whenever votes are cast.
- **Client Fallback**: If WebSocket connection fails or in local development without Supabase Live credentials, fallback to client-side periodic polling (e.g. TanStack Query `refetchInterval: 15_000`).
- **Data Payload**: Broadcast event sends `{ eventId, contestantId, increment, timestamp }` allowing client-side optimistic tally adjustments before full sync.

---

## 2. Mystery Freeze Security & Anti-Leak Safeguards

### Context

During the Mystery Freeze window (typically 1–2 hours before final stage coronation), public leaderboards must hide the true rankings and exact tallies to preserve dramatic suspense while backend voting remains 100% operational.

### Decision: Server-Side Field Redaction

- **Anti-Leak Invariant**: The server route `/api/events/[slug]/leaderboard` MUST NOT return `voteCount` or `rank` to unauthenticated/public clients when `isFrozen = true`.
- **Obfuscation**: During freeze, contestant items are shuffled or returned in alphabetical/contestant-number order with `isFrozen: true`, `voteCount: null`, and `rank: null`.
- **Organizer Bypass**: Requests containing a valid organizer session for the event receive the full unredacted payload (`showFullResults: true`).

---

## 3. Top 3 Podium & Visual Design

### Context

Pageant leaderboards require clear podium hierarchy (#1 Gold, #2 Silver, #3 Bronze) with gap-to-leader metrics ("Needs 12 votes to take 1st!").

### Decision: Electa Brutalist-Refined Zero-Radius Design

- **Geometry**: Sharp 0px corners (`rounded-none`).
- **Theme**: Light Mode Opal (`#F8FAFC`) default, with high-contrast metallic badges:
  - 🥇 Gold: Amber/Yellow gradient badge (`bg-amber-500 text-slate-950 font-black border border-amber-600`)
  - 🥈 Silver: Slate/Zinc metallic badge (`bg-slate-300 text-slate-900 font-bold border border-slate-400 dark:bg-slate-700 dark:text-slate-100`)
  - 🥉 Bronze: Copper/Orange badge (`bg-orange-600 text-white font-bold border border-orange-700`)
- **Typography**: Outfit for numbers/ranks, Sora for candidate names, JetBrains Mono for vote counters.

---

## 4. Multi-Category & Award Track Aggregation

### Context

Events contain multiple dynamic divisions (Kids, Teens, Adults, etc.) and specialized award tracks (Best in Swimsuit, Evening Gown, People's Choice).

### Decision: In-Memory / SQL Filtered Aggregation

- Route accepts optional `?divisionId=<id>` and `?categoryId=<id>` query parameters.
- When `categoryId` is provided, tallies are aggregated from `Vote` records matching `awardCategoryId: categoryId`.
- When omitted, global division/overall vote counts from `Contestant.voteCount` are displayed.
