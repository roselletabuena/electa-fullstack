# Implementation Plan: Cast Free Daily Votes & 24-Hour Cooldown Engine

**Branch**: `012-free-daily-voting` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-free-daily-voting/spec.md`

---

## Summary

Implement the voter-facing free daily voting system and rolling 24-hour cooldown engine for VoteSphere. Authenticated voters can cast 1 to 5 daily free votes (configured per event) on candidates. The system calculates available allowances over a rolling 24-hour database window, atomically records votes in the database ledger, optimistic-updates candidate vote counts, and transitions to a disabled cooldown state with a live countdown timer (`[HH:MM:SS]`) when the quota is exhausted.

---

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode)  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma ORM, TanStack Query v5, Lucide React  
**Storage**: Supabase PostgreSQL (`Vote`, `Event`, `Contestant` models)  
**Testing**: Vitest (`tests/unit/voting/`)  
**Target Platform**: Web (Responsive Desktop & Mobile browsers)  
**Project Type**: Next.js Full-Stack Web Application  
**Performance Goals**: <500ms free vote transaction and instant optimistic UI feedback (<50ms)  
**Constraints**: Zero concurrency over-voting leaks (atomic transactional checks), WCAG 2.1 AA accessible button states  
**Scale/Scope**: Support 10,000+ daily concurrent votes during live coronation events

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Compliance Assessment                                                                                              | Status  |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :-----: |
| **§I: Strict Type Safety**        | Zero `any` or `!`. Strict Zod validation on vote inputs (`CastFreeVoteSchema`).                                    | ✅ PASS |
| **§II: Server-First & Isolation** | Server Action for vote execution; client component with explicit `<Suspense>` boundary for live countdown.         | ✅ PASS |
| **§III: State Separation**        | Prisma singleton (`src/lib/db.ts`) for vote ledger; TanStack Query (`['voting-quota', eventId]`) for server state. | ✅ PASS |
| **§IV: Secure-by-Design**         | Session verification via `getSession()` from `src/lib/auth/get-session.ts`.                                        | ✅ PASS |
| **§V: Feature Colocation**        | Colocated slice in `src/features/voting/` (`components/`, `hooks/`, `types/`, `actions/`).                         | ✅ PASS |
| **§VI: Test-First Quality**       | Vitest unit tests for 24h rolling quota algorithm, over-allocation prevention, and countdown formatting.           | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/012-free-daily-voting/
├── spec.md              # Feature specification (from /speckit-specify)
├── plan.md              # Implementation plan (this document)
├── research.md          # Technical research and architectural decisions
├── data-model.md        # Prisma schema and TypeScript types
├── quickstart.md        # Validation scenarios and test commands
├── contracts/
│   └── voting-api.md    # Action and endpoint contracts
└── checklists/
    └── requirements.md  # Spec quality validation checklist
```

### Source Code (repository root)

```text
vote-sphere/
├── prisma/
│   └── schema.prisma                           # Add Vote model & VoteType enum
├── src/
│   ├── features/
│   │   ├── voting/
│   │   │   ├── actions/
│   │   │   │   └── cast-free-vote.ts           # Server Action with atomic transaction
│   │   │   ├── hooks/
│   │   │   │   ├── use-free-vote-quota.ts      # TanStack Query hook + live countdown ticker
│   │   │   │   └── use-cast-free-vote.ts       # Mutation hook with optimistic updates
│   │   │   ├── components/
│   │   │   │   ├── FreeVoteButton.tsx          # Action button with dynamic quota badge & countdown
│   │   │   │   ├── FreeVoteCooldownBanner.tsx  # Sticky / card-level cooldown countdown indicator
│   │   │   │   └── AuthPromptModal.tsx         # Sign-in prompt for unauthenticated voters
│   │   │   ├── utils/
│   │   │   │   └── quota-calculator.ts         # Pure rolling 24h calculation & time formatter
│   │   │   └── types/
│   │   │       └── index.ts                    # Voting domain DTOs & schemas
│   │   └── contestants/
│   │       └── components/
│   │           ├── ContestantCard.tsx          # Integrate FreeVoteButton & quota state
│   │           └── ContestantProfileModal.tsx  # Integrate voting actions in full profile
└── tests/
    └── unit/
        └── voting/
            ├── quota-calculator.test.ts        # Rolling 24-hour quota calculation tests
            └── cast-free-vote.test.ts          # Atomic voting action validation tests
```

**Structure Decision**: Vertical slice architecture under `src/features/voting/` cleanly colocates all voting logic, actions, hooks, and presentation components while integrating seamlessly into the existing `contestants` and `events` feature slices.

---

## Complexity Tracking

> **No Constitution violations detected.** Direct Prisma transactional execution avoids external queue/cache overhead while guaranteeing sub-500ms ACID compliance.
