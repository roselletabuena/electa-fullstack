# Tasks: Cloudflare Turnstile & Free-Tier Velocity Bot Mitigation

**Input**: Design documents from `specs/018-turnstile-bot-mitigation/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/bot-mitigation.ts`  
**Organization**: Tasks are grouped by user story (US1: Bot Clearance, US2: Velocity Throttling, US3: Fail-Closed Resilience) to enable independent testing and incremental delivery.

---

## Phase 1: Setup & Contracts

**Purpose**: Establish data boundary contracts and verification schemas

- [x] T001 [P] Define Turnstile validation and rate limiter contracts in `specs/018-turnstile-bot-mitigation/contracts/bot-mitigation.ts`
- [x] T002 [P] Configure Cloudflare Turnstile environment secret access via `src/env.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core security utilities and verification services

- [x] T003 [P] Implement server-side Turnstile siteverify client with test-bypass in `src/features/voting/utils/turnstile.ts`
- [x] T004 [P] Implement in-memory sliding-window IP velocity rate limiter in `src/features/voting/utils/rate-limiter.ts`
- [x] T005 Wire bot clearance and IP rate-limiting guards into `castVoteAction` in `src/features/voting/actions/cast-vote.ts`

**Checkpoint**: Core verification utilities ready.

---

## Phase 3: User Story 1 - Invisible Bot Verification Challenge (Priority: P1) 🎯 MVP

**Goal**: Reject automated vote submissions that lack valid Cloudflare clearance tokens.  
**Independent Test**: POST vote payload to `/api/events/[slug]/vote` without valid token and verify HTTP 403 Forbidden is returned.

- [x] T006 [P] [US1] Unit test Turnstile token verification, siteverify parsing, and bypass logic in `tests/unit/voting/turnstile.test.ts`
- [x] T007 [US1] Create event-scoped vote route handler in `src/app/api/events/[slug]/vote/route.ts`
- [x] T008 [US1] Unit test `/api/events/[slug]/vote` for bot rejection and successful vote dispatch in `tests/unit/voting/event-vote-route.test.ts`

**Checkpoint**: User Story 1 is fully functional and independently verified.

---

## Phase 4: User Story 2 - IP-Based Velocity Throttling (Priority: P2)

**Goal**: Throttle free-tier voting attempts exceeding 10 requests per 60 seconds per IP with HTTP 429 Too Many Requests.  
**Independent Test**: Rapidly submit 11 requests from same IP in unit test and verify 11th request receives HTTP 429.

- [x] T009 [P] [US2] Unit test sliding window rate limiter burst tracking in `tests/unit/voting/rate-limiter.test.ts`
- [x] T010 [US2] Map `RATE_LIMIT_EXCEEDED` and `DEVICE_ACCOUNT_LIMIT_EXCEEDED` error codes to HTTP 429 in `src/app/api/events/[slug]/vote/route.ts`

**Checkpoint**: User Stories 1 and 2 operate independently and protect endpoints.

---

## Phase 5: User Story 3 - Resilient Fail-Closed Degradation (Priority: P3)

**Goal**: Safely reject requests on network timeout or security anomalies without corrupting vote tallies or quotas.  
**Independent Test**: Mock network failure on siteverify fetch and verify safe fail-closed denial.

- [x] T011 [P] [US3] Unit test network timeout and JSON parse error handling in `tests/unit/voting/turnstile.test.ts`
- [x] T012 [US3] Ensure fail-closed rejection mapping in `src/features/voting/actions/cast-vote.ts`

---

## Phase 6: Polish & Verification

**Purpose**: Repository-wide typecheck, linting, and test regression validation

- [x] T013 [P] Execute quickstart validation scenarios from `specs/018-turnstile-bot-mitigation/quickstart.md`
- [x] T014 Run full TypeScript compiler typecheck (`npm run typecheck`)
- [x] T015 Run complete unit test suite (`npm run test:unit`)

---

## Dependencies & Execution Order

1. **Setup (Phase 1)** → **Foundational (Phase 2)**
2. **User Story 1 (P1)** → **User Story 2 (P2)** → **User Story 3 (P3)**
3. **Polish & Verification (Phase 6)**
