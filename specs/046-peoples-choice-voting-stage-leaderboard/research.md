# Research & Architecture Decisions: Demo Day People's Choice Voting & Stage Leaderboard

**Feature ID**: `046-peoples-choice-voting-stage-leaderboard`  
**Ticket**: [VS-116](https://the-three-devsketeers.atlassian.net/browse/VS-116)  
**Date**: 2026-10-15  

---

## 1. Context & Prior Art

Electa provides multi-archetype voting:
- Pageant voting (`PAGEANT`): monetized boost votes, free daily votes with cooldown timers.
- Student Council elections (`STUDENT_COUNCIL`, VS-85, VS-109): zero-cost multi-office ballots.
- Hackathons (`HACKATHON`, VS-112, VS-113, VS-114, VS-115): multi-track project submission and judge rubric evaluations.

**People's Choice Voting** represents the attendee crowd-favorite layer of hackathons. Unlike judges who submit detailed 1-10 rubric scorecards, attendees vote once for their favorite project.

---

## 2. Technical Decisions & Rationale

### Decision 1: Database Storage Model (`ProjectVote` + `ProjectSubmission.voteCount`)
- **Alternative A**: Re-use generic `Vote` model with dummy `contestantId`.
  - *Cons*: `Vote.contestantId` is non-nullable and strictly foreign-keyed to `Contestant`. Creating fake contestants for hackathon project submissions contaminates the pageant/contestant tables and breaks queries.
- **Alternative B (Chosen)**: Introduce dedicated `ProjectVote` model:
  ```prisma
  model ProjectVote {
    id           String            @id @default(uuid())
    eventId      String
    submissionId String
    voterId      String
    createdAt    DateTime          @default(now())

    event        Event             @relation(fields: [eventId], references: [id], onDelete: Cascade)
    submission   ProjectSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

    @@unique([eventId, voterId])
    @@index([eventId])
    @@index([submissionId])
    @@index([voterId])
  }
  ```
  And add cached `voteCount Int @default(0)` to `ProjectSubmission` for instantaneous `O(1)` leaderboard reads and ordering.
  - *Pros*: Completely clean separation of concerns; database-level `@@unique([eventId, voterId])` guarantees concurrency safety (<50ms double-clicks fail gracefully with P2002); atomic transactions update `voteCount`.

### Decision 2: Voter Identification & Session Resolution
- Supports authenticated users via `getSession()` (`session.userId`).
- Also supports anonymous/attendee web visitors via a persistent attendee cookie (`electa_attendee_id` or `vs_attendee_id`), generating a secure UUID v4 if no session cookie exists.
- This ensures frictionless 1-tap voting during live demo day pitch rounds without forcing users through a 5-step registration funnel, while strictly enforcing 1 vote per attendee session per event.

### Decision 3: Stage Leaderboard Real-Time Synchronization
- Stage projectors run continuously for 1-3 hours during Demo Day ceremonies.
- Implementation uses automated polling with interval (e.g. 4 seconds) and optional Server-Sent Events / manual refresh trigger.
- View Transitions or CSS keyframe animations ensure smooth ranking updates without layout jank or screen flashing.
- Operator HUD provides fullscreen toggle (`F` key) and track filter tabs.

---

## 3. Technology Stack Compliance
- **Framework**: Next.js 16 App Router (RSC for page shell, `"use client"` for interactive vote buttons and stage display).
- **Styling**: Tailwind CSS v4, zero-radius geometry (`rounded-none`), light mode default (`#F8FAFC`), Opal Slate palette.
- **State Management**: TanStack Query / polling hooks + local optimistic state.
- **Testing**: Vitest + React Testing Library for button and stage leaderboard unit tests.
