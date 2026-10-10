# Tasks: Core Voting Engine, Omnichannel Auth & Anti-Fraud

**Feature ID**: `015-core-voting-engine`  
**Jira Key**: [VS-20](https://the-three-devsketeers.atlassian.net/browse/VS-20)  
**Parent Epic**: [VS-18](https://the-three-devsketeers.atlassian.net/browse/VS-18)  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Phase 1: Setup & Environment

**Purpose**: Register environment configuration and documentation for anti-fraud dependencies

- [x] T001 Register `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `src/env.ts` (Electa Constitution §IV)
- [x] T002 Document Turnstile keys in `.env.example`

---

## Phase 2: Foundational & Anti-Fraud Infrastructure

**Purpose**: Core security, rate-limiting, and bot-mitigation engines that guard vote submissions

- [x] T003 [P] Implement Cloudflare Turnstile token siteverify utility in `src/features/voting/utils/turnstile.ts`
- [x] T004 [P] Implement IP velocity and device account rate limiting engine in `src/features/voting/utils/rate-limiter.ts`
- [x] T005 [P] Implement client device fingerprint generator in `src/features/voting/utils/fingerprint.ts`
- [x] T006 [P] Add unit tests for Turnstile validation and rate limiting in `tests/unit/voting/turnstile.test.ts` and `tests/unit/voting/rate-limiter.test.ts`

**Checkpoint**: Foundation ready — Turnstile verification and rate limiting algorithms verified by unit tests.

---

## Phase 3: User Story 1 & 2 - Omnichannel Voter Authentication & Bot Mitigation

**Goal**: Deliver frictionless multi-provider voter sign-in (Google, Apple, Facebook, Magic Link, Phone OTP) and client Turnstile token generation

- [x] T007 [P] [US1] Implement passwordless helper utilities in `src/features/auth/utils/passwordless-auth.ts`
- [x] T008 [US1] Create unified `OmnichannelAuthModal.tsx` in `src/features/auth/components/OmnichannelAuthModal.tsx`
- [x] T009 [P] [US2] Implement `TurnstileWidget.tsx` in `src/features/voting/components/TurnstileWidget.tsx`
- [x] T010 [US2] Integrate Turnstile challenge and device fingerprint acquisition into `src/features/voting/components/FreeVoteButton.tsx` and `src/features/voting/components/AuthPromptModal.tsx`

**Checkpoint**: Voters can authenticate across all 5 identity channels and free voting UI acquires Turnstile tokens before submission.

---

## Phase 4: User Story 3 & 4 - High-Concurrency Atomic Voting Engine (FREE & BOOST)

**Goal**: Deliver atomic transaction execution supporting free daily votes and paid boosts with zero race conditions, double-counting immunity, and idempotency

- [x] T011 [P] [US3] Define `CastVoteInputSchema`, `CastVoteResultDto`, and anti-fraud error types in `src/features/voting/types/index.ts`
- [x] T012 [US3] Implement unified atomic transaction action `castVoteAction` in `src/features/voting/actions/cast-vote.ts` enforcing Turnstile token check, IP velocity limits, device limits, rolling 24h quota, and idempotency keys
- [x] T013 [P] [US3] Implement API Route Handler `src/app/api/voting/route.ts` returning standard `ApiResponse<T>` envelope (Constitution §II)
- [x] T014 [US3] Add unit tests for atomic vote execution, double-counting immunity, and boost handling in `tests/unit/voting/cast-vote.test.ts`

**Checkpoint**: Voting engine atomically processes free votes and paid boosts, rejecting bots and duplicate submissions.

---

## Phase 5: Polish, Quality Gates & Sync

**Purpose**: Verification, barrel exports, and constitutional compliance

- [x] T015 Export public feature symbols through `src/features/voting/index.ts` and `src/features/auth/index.ts`
- [x] T016 Run full test suite (`npm test`), static typecheck (`npm run typecheck`), and linting (`npm run lint`)
- [x] T017 Run `constitution-check` and `env-validator` to guarantee zero constitutional violations
