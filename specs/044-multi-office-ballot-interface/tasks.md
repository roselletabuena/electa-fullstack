# Implementation Tasks: Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  

---

## Phase 1: Setup & Type Contracts
- [x] T001: Export ballot DTO interfaces (`BallotPositionDto`, `BallotCandidateDto`, `PublicBallotEventDto`, `BallotSubmissionReceiptDto`) in `src/features/voting/types/ballot.ts`

## Phase 2: Core Components & Logic (TDD)
- [x] T002: Implement `src/features/voting/components/ballot-receipt-card.tsx` with copy token functionality and zero-radius Electa styling
- [x] T003: Implement `src/features/voting/components/ballot-review-modal.tsx` with accessible dialog, office groupings, and edit/confirm actions
- [x] T004: Implement `src/features/voting/components/voter-auth-guard.tsx` for institutional sign-in prompts and ineligibility messaging
- [x] T005: Implement `src/features/voting/components/multi-office-ballot.tsx` managing seat caps, warning badges, review modal trigger, and submission state
- [x] T006: Add comprehensive unit tests in `tests/unit/voting/multi-office-ballot.test.tsx` covering all acceptance criteria scenarios

## Phase 3: Route Integration & Page Assembly
- [x] T007: Implement ballot page `src/app/(public)/events/[slug]/ballot/page.tsx` with server-side event resolution, position/candidate queries, roster eligibility checks, and duplicate submission guards
- [x] T008: Export new components in `src/features/voting/index.ts`

## Phase 4: Verification & Review Gates
- [x] T009: Run test suite (`npm run test:unit`) and verify all tests pass
- [x] T010: Run typecheck (`npm run typecheck`) and linter (`npm run lint`)
- [x] T011: Perform code review and standards audit
- [x] T012: Open Pull Request via `pr-creator` and post completion changelog to Jira VS-109



