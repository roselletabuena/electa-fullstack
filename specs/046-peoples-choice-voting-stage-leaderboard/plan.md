# Implementation Plan: Demo Day People's Choice Voting & Stage Leaderboard

**Feature ID**: `046-peoples-choice-voting-stage-leaderboard`  
**Ticket**: [VS-116](https://the-three-devsketeers.atlassian.net/browse/VS-116)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  
**Status**: Ready for Implementation  

---

## 1. Architecture Overview & Component Boundaries

```
src/
├── app/
│   ├── (public)/events/[slug]/stage/
│   │   └── page.tsx                     # Fullscreen Projector Stage Display page
│   └── api/events/[slug]/
│       ├── peoples-choice/route.ts      # Route handler for casting vote and fetching status
│       └── stage-leaderboard/route.ts   # Route handler for stage display polling / live feed
└── features/hackathons/
    ├── actions/
    │   └── cast-peoples-choice-vote.ts  # Server action for 1-tap voting
    ├── components/
    │   ├── peoples-choice-vote-button.tsx # Interactive 1-tap vote button with active states
    │   ├── stage-leaderboard.tsx        # High-impact projector leaderboard console
    │   └── project-card.tsx             # Integrated with vote button
    ├── services/
    │   └── peoples-choice-service.ts    # Prisma transactions, rate limiting, and rank calculations
    └── types/
        └── peoples-choice.ts            # Strongly typed contracts & DTOs
```

---

## 2. Technical Stack & Invariants

- **Zero-Radius Geometry**: All buttons, cards, pills, progress bars, and modal docks MUST use `rounded-none`.
- **Default Light Theme**: Base surface is Opal Slate-50 (`#F8FAFC`), crisp white cards (`#FFFFFF`) with hairline slate-300 borders (`border border-slate-300`). Dark theme is scoped cleanly with `dark:`.
- **Dual-Theme WCAG 2.1 AA Contrast**: 4.5:1 minimum contrast across light and dark modes.
- **Atomic Concurrency**: Database unique constraint `@@unique([eventId, voterId])` on `ProjectVote` ensures duplicate votes cannot be committed.
- **Asynchronous Next.js 16 APIs**: `cookies()`, `headers()`, `params`, `searchParams` MUST ALWAYS be awaited.
- **TypeScript Strictness**: Zero `any`, zero non-null assertions `!`.

---

## 3. Test Strategy & TDD Workflow

1. **Unit Tests**:
   - `tests/unit/hackathons/peoples-choice-service.test.ts`:
     - Successful vote casting increments `voteCount` and records `ProjectVote`.
     - Duplicate vote by same voter rejects with `"You have already cast your People's Choice vote for this hackathon."`.
     - Concurrency test / non-existent submission error handling.
     - Leaderboard aggregation and rank calculations.
   - `tests/unit/hackathons/peoples-choice-vote-button.test.tsx`:
     - Renders unvoted state `"Vote People's Choice"`.
     - Clicking button transitions to `"Voted"` state and updates aria attributes.
     - When already voted on another project, shows accessible toast alert.
     - Disabled state when event is closed or non-hackathon.
   - `tests/unit/hackathons/stage-leaderboard.test.tsx`:
     - Renders top projects with rankings, vote tallies, percentage bars, and podium highlights.
     - Fullscreen toggle via `F` key or button.
     - Track filter pills update displayed rankings.
     - Smooth updates without layout jitter.
   - `tests/unit/hackathons/stage-page.test.tsx`:
     - Renders stage page for Hackathon archetype events.
     - Renders fallback notice for non-hackathon events.
