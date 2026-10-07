# Tasks: Draft Event Passphrase Protection & Access Control

**Input**: Design artifacts from `specs/028-draft-passphrase-protection/`  
**Parent Ticket**: [VS-80](https://the-three-devsketeers.atlassian.net/browse/VS-80)  
**Branch**: `feature/VS-80-draft-passphrase-protection`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification of environment and test harnesses

- [x] T001 Verify existing unit test harness and draft auth tests in `tests/unit/events/draft-auth.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and cryptographic utilities required by all user stories

**⚠️ CRITICAL**: No user story implementation can begin until foundational tasks are complete.

- [x] T002 [P] Extend `PublicEventDto` with `organizerId?: string` in `src/features/events/types/index.ts`
- [x] T003 [P] Add `organizerId` to `mockDraftEvent` in `src/features/events/utils/mock-data.ts`
- [x] T004 Implement `computePassphraseDigest` and update `PreviewTokenPayload` in `src/features/events/utils/preview-token.ts`

**Checkpoint**: Core types and digest helper ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Verified Ownership Enforcement for Draft Previews (Priority: P1) 🎯 MVP

**Goal**: Ensure only authentic event owners bypass the draft passphrase prompt, while non-owners (logged-in voters or visitors) are strictly challenged.

**Independent Test**: Log in as a non-owner user, navigate to `/events/preview-draft-contest`, and verify the `DraftPassphraseModal` is shown instead of direct event access.

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Unit test draft ownership gating logic for owner bypass vs non-owner challenge in `tests/unit/events/draft-ownership.test.ts`

### Implementation for User Story 1

- [x] T006 [US1] Update `getPublicEvent` to include `organizerId` in `src/app/(public)/events/[slug]/page.tsx`
- [x] T007 [US1] Replace `if (session)` with strict ownership check `session?.userId === event.organizerId` in `src/app/(public)/events/[slug]/page.tsx`

**Checkpoint**: User Story 1 functional; non-owners can no longer bypass draft preview security.

---

## Phase 4: User Story 2 - Public Event API Protection for Unpublished Events (Priority: P1)

**Goal**: Prevent data leakage of draft event details and contestant rosters via the public event API endpoint.

**Independent Test**: Issue a direct `GET /api/events/preview-draft-contest` without session or preview cookies, and verify HTTP 404 response with no contestant data.

### Tests for User Story 2 ⚠️

- [x] T008 [P] [US2] Unit and route handler tests for draft authorization in `tests/unit/events/draft-api-route.test.ts`

### Implementation for User Story 2

- [x] T009 [US2] Protect `GET /api/events/[slug]` against unauthenticated draft requests returning 404 in `src/app/api/events/[slug]/route.ts`

**Checkpoint**: Public API route no longer leaks draft event rosters to unauthorized callers.

---

## Phase 5: User Story 3 - Instant Invalidation on Passphrase Rotation & Removal (Priority: P2)

**Goal**: Cryptographically bind preview tokens to the active passphrase digest so rotating or removing a passphrase immediately invalidates outstanding preview cookies.

**Independent Test**: Generate a token with Digest A, rotate passphrase to generate Digest B, and verify token verification fails immediately with digest mismatch.

### Tests for User Story 3 ⚠️

- [x] T010 [P] [US3] Unit tests for digest-bound token generation, verification, and rotation invalidation in `tests/unit/events/draft-auth.test.ts`

### Implementation for User Story 3

- [x] T011 [US3] Update `signPreviewToken` and `verifyPreviewToken` to validate passphrase digest in `src/features/events/utils/preview-token.ts`
- [x] T012 [US3] Update `POST /api/events/[slug]/preview-auth` to issue digest-bound tokens in `src/app/api/events/[slug]/preview-auth/route.ts`
- [x] T013 [US3] Pass active passphrase digest to `verifyPreviewToken` in `src/app/(public)/events/[slug]/page.tsx` and `src/app/api/events/[slug]/route.ts`

**Checkpoint**: Passphrase rotation and removal immediately invalidates all active preview cookies.

---

## Phase 6: User Story 4 - Organizer Guidance for Preview Testing (Priority: P3)

**Goal**: Inform organizers in settings why they bypass the passphrase prompt and guide them to use incognito mode for testing.

**Independent Test**: Open `/events/[slug]/settings?tab=schedule` on a draft event and verify the guidance banner appears beneath the Draft Review Passphrase input with working copy URL button.

### Implementation for User Story 4

- [x] T014 [US4] Add zero-radius organizer preview guidance callout and copy preview link action in `src/features/events/components/dashboard/ScheduleLifecycleForm.tsx`

**Checkpoint**: Organizers have clear in-context testing guidance, preventing false-positive reports.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, static analysis, and end-to-end quickstart validation

- [x] T015 [P] Run full unit test suite via `npm run test:unit -- tests/unit/events/`
- [x] T016 [P] Run TypeScript typecheck via `npm run typecheck`
- [x] T017 [P] Run linter validation via `npm run lint`
- [x] T018 Execute verification flow from `specs/028-draft-passphrase-protection/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; BLOCKS all user stories.
- **Phase 3 (US1 - Ownership)**: Depends on Phase 2; critical P1 MVP.
- **Phase 4 (US2 - API Route)**: Depends on Phase 2 and US1 types; critical P1.
- **Phase 5 (US3 - Token Invalidation)**: Depends on Phase 2 utilities; P2 security hardening.
- **Phase 6 (US4 - Guidance UI)**: Depends on Phase 2; P3 UX improvement.
- **Phase 7 (Polish)**: Depends on all user stories being complete.

### Parallel Opportunities

- Foundational tasks T002, T003 can execute in parallel.
- Test tasks T005, T008, T010 can be written in parallel.
- Polish tasks T015, T016, T017 can run concurrently.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (US1 - Ownership bypass fix) and validate with T005.
3. Complete Phase 4 (US2 - API leak fix) and validate with T008.
4. **Checkpoint**: Critical security vulnerabilities from VS-80 resolved.

### Incremental Hardening

1. Add Phase 5 (US3 - Token invalidation on rotation) to eliminate stale session reuse.
2. Add Phase 6 (US4 - Organizer guidance UI) to eliminate user confusion during testing.
3. Run Phase 7 (Polish) quality gates.
