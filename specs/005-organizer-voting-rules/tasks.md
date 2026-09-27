# Tasks: Organizer Voting Rules & Daily Free Vote Quota Configuration

**Feature**: `005-organizer-voting-rules`  
**Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/005-organizer-voting-rules/spec.md) | **Plan**: [plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/005-organizer-voting-rules/plan.md)  
**Date**: 2026-09-27

---

## Phase 1: Setup (Schema Migration & Types)

**Purpose**: Database schema expansion, Prisma client generation, Zod schemas, and TypeScript domain types

- [x] T001 Update `prisma/schema.prisma` with `isFreeVotingEnabled Boolean @default(true)` and `dailyFreeVoteLimit Int @default(1)` on the `Event` model and run migration + Prisma client generation
- [x] T002 [P] Create Zod validation schemas for voting rules (`votingRulesFormSchema`, `updateVotingRulesInputSchema`) in `src/lib/validations/event-voting-rules.ts`
- [x] T003 [P] Define TypeScript domain types and ActionResponse envelopes for voting rules in `src/features/events/types/index.ts`

---

## Phase 2: Foundational (Server Action, Audit Logging & Unit Tests)

**Purpose**: Server action mutation, ownership guard enforcement, atomic `EventAuditLog` transaction, and validation test harness

**⚠️ CRITICAL**: Must complete before interactive UI components can be wired up

- [x] T004 [P] Implement unit tests for `votingRulesFormSchema` and `updateVotingRulesInputSchema` in `tests/unit/events/voting-rules-validation.test.ts`
- [x] T005 Implement Server Action `updateVotingRulesAction` with `requireEventOwnership(slug)` verification, schema parsing, atomic `EventAuditLog` transaction, and cache revalidation in `src/features/events/actions/update-voting-rules.ts`
- [x] T006 [P] Implement unit tests for `updateVotingRulesAction` in `tests/unit/events/update-voting-rules-action.test.ts`

**Checkpoint**: Foundation ready — server-side mutation, ownership verification, and audit logging fully tested.

---

## Phase 3: User Story 1 - Organizer Configures Daily Free Vote Quota (Priority: P1) 🎯 MVP

**Goal**: Authenticated event organizer navigates to Voting Rules settings to configure the daily free vote quota (1–5 votes per 24h, default 1), saving updates with instant feedback and audit logging.

**Independent Test**: Log in as event owner, visit `/events/[slug]/settings?tab=voting-rules`, select quota (e.g. 3), click "Save Changes", and verify that the setting persists across reloads and writes to `EventAuditLog`.

### Implementation for User Story 1

- [x] T007 [US1] Create interactive `VotingRulesForm.tsx` with React Hook Form, 1–5 daily quota selector, optional audit reason textarea, and Server Action submission in `src/features/events/components/dashboard/VotingRulesForm.tsx`
- [x] T008 [US1] Integrate `VotingRulesForm` into `src/app/(dashboard)/events/[slug]/settings/page.tsx` replacing the placeholder `VotingRulesSettingsSummaryCard` for the `voting-rules` tab

**Checkpoint**: At this point, User Story 1 is fully functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - Toggle Free Daily Voting On/Off (Priority: P2)

**Goal**: Organizer toggles free daily voting on or off (e.g. for grand coronation finals / paid-only phase), disabling free voting on public event interfaces and directing voters to paid boost options.

**Independent Test**: Toggle "Enable Free Daily Voting" to OFF, click "Save Changes", and visit the public event page as a voter to verify free vote actions are disabled and voters are prompted for paid boosts.

### Implementation for User Story 2

- [x] T009 [US2] Enhance `VotingRulesForm.tsx` with Radix UI Switch for `isFreeVotingEnabled` that dynamically toggles/dims the daily quota controls and displays contextual helper notes for grand finals / paid-only modes in `src/features/events/components/dashboard/VotingRulesForm.tsx`
- [x] T010 [US2] Update public event page voting component/banner to check `event.isFreeVotingEnabled` and guide voters to paid boost options when free voting is disabled in `src/features/events/components/EventVotingRulesBanner.tsx`

**Checkpoint**: User Stories 1 and 2 are both functional and independently testable.

---

## Phase 5: User Story 3 - Audit Trail & Governance for Voting Adjustments (Priority: P3)

**Goal**: Complete governance audit trail recording previous/new voting rules state snapshots, organizer ID, exact timestamp, and optional reason note for transparent competition oversight.

**Independent Test**: Adjust voting parameters and verify `EventAuditLog` table stores records with `action: "UPDATE_VOTING_RULES"`, previous values, and new values.

### Implementation for User Story 3

- [x] T011 [US3] Verify audit logging capture in `updateVotingRulesAction` ensuring `previousVal` and `newVal` snapshots (`{ isFreeVotingEnabled, dailyFreeVoteLimit }`), author ID, and optional reason note are accurately preserved in `src/features/events/actions/update-voting-rules.ts`

**Checkpoint**: All user stories (US1, US2, US3) are complete and independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, accessibility compliance, and end-to-end test validation

- [x] T012 [P] Verify WCAG 2.1 AA keyboard accessibility and color contrast on `VotingRulesForm` in `src/features/events/components/dashboard/VotingRulesForm.tsx`
- [x] T013 Run static analysis and type checking (`npm run typecheck`, `npm run lint`, `npm run format:check`)
- [x] T014 Run full Vitest test suite (`npm run test`) and execute validation scenarios in `specs/005-organizer-voting-rules/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (Foundational Server Action & Validation).
- **User Story 2 (Phase 4)**: Depends on Phase 3 (`VotingRulesForm` base implementation).
- **User Story 3 (Phase 5)**: Verified alongside Server Action in Phase 2 & UI integration.
- **Polish (Phase 6)**: Runs after all user story phases are implemented.

### Parallel Opportunities

- Phase 1: `T002` (Zod schemas) and `T003` (domain types) can execute in parallel after `T001`.
- Phase 2: `T004` (validation tests) and `T006` (action tests) can be authored in parallel with `T005`.
- Phase 6: `T012` (accessibility audit) can execute in parallel with static checks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Schema Migration, Zod validation, Types).
2. Complete Phase 2 (Foundational Server Action & Unit Tests).
3. Complete Phase 3 (US1 - Interactive Voting Rules Form & Settings Integration).
4. **STOP and VALIDATE**: Test User Story 1 independently in browser & unit tests.

### Incremental Delivery

1. Foundation ready (Phase 1 + Phase 2).
2. Add US1 (Daily Free Vote Quota Configuration) $\rightarrow$ Test & Deliver MVP.
3. Add US2 (Toggle Free Daily Voting On/Off & Public Gating) $\rightarrow$ Test & Deliver.
4. Add US3 (Audit Log Snapshots & Governance) $\rightarrow$ Test & Deliver.
5. Polish, Accessibility audit, Typecheck, and Test suite validation (Phase 6).
