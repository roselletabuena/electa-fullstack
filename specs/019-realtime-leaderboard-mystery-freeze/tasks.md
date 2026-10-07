# Tasks: Real-Time Live Leaderboard & Stealth Mystery Freeze

**Input**: Design documents from `specs/019-realtime-leaderboard-mystery-freeze/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/leaderboard.ts`  
**Organization**: Tasks are grouped by user story (US1: Live Leaderboard & Podium, US2: Mystery Freeze, US3: Multi-Category Filtering) to enable independent delivery.

---

## Phase 1: Setup & Contracts

**Purpose**: Establish data boundary contracts and schemas

- [x] T001 [P] Define leaderboard types, schemas, and DTOs in `src/features/leaderboard/types/index.ts`
- [x] T002 [P] Sync contracts with `specs/019-realtime-leaderboard-mystery-freeze/contracts/leaderboard.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core calculation utilities and security freeze logic

- [x] T003 [P] Implement rank calculation, gap-to-leader, and percentage share utility in `src/features/leaderboard/utils/rank-calculator.ts`
- [x] T004 [P] Implement freeze state evaluation and payload redaction guard in `src/features/leaderboard/utils/freeze-guard.ts`
- [x] T005 [P] Unit test rank calculation, ties, and gap metrics in `tests/unit/leaderboard/rank-calculator.test.ts`
- [x] T006 [P] Unit test freeze evaluation and payload redaction in `tests/unit/leaderboard/freeze-guard.test.ts`

**Checkpoint**: Core calculation and freeze utilities tested and verified.

---

## Phase 3: User Story 1 - Live Real-Time Leaderboard & Top-3 Podium (Priority: P1) 🎯 MVP

**Goal**: Render real-time ranked candidate list with highlighted Top-3 podium cards (Gold, Silver, Bronze) and dynamic vote gap badges.  
**Independent Test**: Request `/api/events/[slug]/leaderboard` and verify calculated podium ranks and gap indicators.

- [x] T007 [P] [US1] Create Top-3 visual podium component with zero-radius geometry in `src/features/leaderboard/components/PodiumSection.tsx`
- [x] T008 [P] [US1] Create 4th-and-below candidate ranking roster in `src/features/leaderboard/components/LeaderboardRoster.tsx`
- [x] T009 [US1] Implement event-scoped leaderboard API route handler in `src/app/api/events/[slug]/leaderboard/route.ts`
- [x] T010 [US1] Implement realtime subscriber hook with polling fallback in `src/features/leaderboard/hooks/useLeaderboardRealtime.ts`
- [x] T011 [US1] Create public leaderboard container in `src/features/leaderboard/components/LeaderboardView.tsx`
- [x] T012 [US1] Build public event leaderboard page in `src/app/(public)/events/[slug]/leaderboard/page.tsx`
- [x] T013 [US1] Unit test `/api/events/[slug]/leaderboard` route handler in `tests/unit/leaderboard/leaderboard-route.test.ts`
- [x] T013b [US1] Conditionally render "Live Leaderboard" button in `EventBanner.tsx` only when voting is actively live (`operationalState === 'Active'`) and `totalVotes > 1`

**Checkpoint**: User Story 1 fully functional and independently verified.

---

## Phase 4: User Story 2 - Stealth Mystery Freeze Window (Priority: P2)

**Goal**: Hide live vote tallies and rank positions behind a "Mystery Freeze" notice while continuing to accept votes in secret.  
**Independent Test**: Enable freeze mode and verify public API returns redacted counts, while organizer request sees full counts.

- [x] T014 [P] [US2] Create Mystery Freeze alert banner in `src/features/leaderboard/components/MysteryFreezeBanner.tsx`
- [x] T015 [US2] Integrate organizer session bypass and public field redaction in `src/app/api/events/[slug]/leaderboard/route.ts`
- [x] T016 [US2] Unit test mystery freeze public redaction and organizer bypass in `tests/unit/leaderboard/freeze-guard.test.ts`

**Checkpoint**: User Stories 1 and 2 operate securely and independently.

---

## Phase 5: User Story 3 - Multi-Division & Award Category Tab Filtering (Priority: P3)

**Goal**: Allow instant switching between divisions and specialized award categories with URL state persistence.  
**Independent Test**: Pass `?divisionId=` or `?categoryId=` to route handler and verify category-scoped rankings.

- [x] T017 [P] [US3] Create category and division filter pill bar in `src/features/leaderboard/components/CategoryFilterTabs.tsx`
- [x] T018 [US3] Support division and award category query parameters in `/api/events/[slug]/leaderboard/route.ts`

---

## Phase 6: Polish & Verification

**Purpose**: Verify end-to-end integration, design system compliance, and test suite

- [x] T019 [P] Execute quickstart scenarios from `specs/019-realtime-leaderboard-mystery-freeze/quickstart.md`
- [x] T020 Run full TypeScript compiler typecheck (`npm run typecheck`)
- [x] T021 Run complete unit test suite (`npm run test:unit`)

---

## Dependencies & Execution Order

1. **Setup (Phase 1)** → **Foundational (Phase 2)**
2. **User Story 1 (P1)** → **User Story 2 (P2)** → **User Story 3 (P3)**
3. **Polish & Verification (Phase 6)**
