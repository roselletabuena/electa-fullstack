# Implementation Plan: Zero-Cost Institutional Voting Engine & Rate Limiter

**Feature**: `042-zero-cost-institutional-voting-engine`  
**Ticket**: [VS-85](https://the-three-devsketeers.atlassian.net/browse/VS-85)  

---

## 1. Technical Architecture & File Inventory

| Layer | File Path | Purpose |
| --- | --- | --- |
| **Prisma Schema** | `prisma/schema.prisma` | Add `isFreeVotingOnly` to `Event`, `BallotSubmission` model, and `ballotSubmissionId` on `Vote`. |
| **Migration** | `prisma/migrations/20261013180000_add_ballot_submission_and_free_voting_only/migration.sql` | Safe, audited migration script. |
| **Validation** | `src/lib/validations/ballot.ts` | Zod schemas for ballot selections and multi-office validation. |
| **Types** | `src/features/voting/types/ballot.ts` | Domain DTOs and type declarations for ballots. |
| **Types Barrel** | `src/features/voting/types/index.ts` | Re-exports ballot types. |
| **Domain Service** | `src/features/voting/services/voting-engine.ts` | Core domain engine: zero-cost policy, validation, atomic transactions, concurrency control. |
| **Server Action** | `src/features/voting/actions/cast-ballot.ts` | Next.js Server Action wrapping the service with session auth and IP header resolution. |
| **Feature Barrel** | `src/features/voting/index.ts` | Re-exports `castBallotAction`, types, and voting engine functions. |
| **Unit Tests** | `tests/unit/voting/ballot-validation.test.ts` | Validates Zod schema bounds and office constraints. |
| **Unit Tests** | `tests/unit/voting/voting-engine.test.ts` | Tests zero-cost voting, multi-office limits, duplicate rejection, and simulated concurrency races. |
| **Unit Tests** | `tests/unit/voting/cast-ballot-action.test.ts` | Tests Server Action authentication and error formatting. |

---

## 2. Phased Execution Sequence

### Phase 1: Database Schema & Migration
1. Update `prisma/schema.prisma` to include:
   - `isFreeVotingOnly Boolean @default(false)` on `Event`
   - `model BallotSubmission` with `id`, `eventId`, `voterId`, `createdAt`, `@@unique([eventId, voterId])`
   - `ballotSubmissionId String?` and relation on `Vote`
2. Create and apply migration `20261013180000_add_ballot_submission_and_free_voting_only`.
3. Run `npx prisma generate` and verify client compilation.

### Phase 2: Contracts, Types & Validations
1. Create `src/lib/validations/ballot.ts` with strict Zod schemas for `officeSelectionSchema` and `castBallotSchema`.
2. Create `src/features/voting/types/ballot.ts` exporting all relevant DTOs.
3. Update `src/features/voting/types/index.ts` to expose ballot types.
4. Add unit tests in `tests/unit/voting/ballot-validation.test.ts` to test bounds and validation rules.

### Phase 3: Voting Engine Domain Service
1. Implement `src/features/voting/services/voting-engine.ts`:
   - `isZeroCostElection(event)`: checks `isFreeVotingOnly === true || archetype === "STUDENT_COUNCIL" || archetype === "HACKATHON"`.
   - `hasVoterSubmittedBallot(eventId, voterId)`: inspects `BallotSubmission`.
   - `castInstitutionalBallot(input)`:
     - Fetches event, positions, and active contestants.
     - Validates event active status and operational dates (`startsAt` <= `now` <= `endsAt`).
     - Verifies rate limits (IP velocity and device limits).
     - Validates position selection counts against `minSelectionsPerVoter` and `maxSelectionsPerVoter`.
     - Validates candidates belong to event and position.
     - Executes `db.$transaction`:
       - Attempts to insert `BallotSubmission` record.
       - Catches `P2002` unique constraint violation and rolls back with `BALLOT_ALREADY_SUBMITTED`.
       - Inserts `Vote` records with `voteType: FREE`, `voteWeight: 1`, and `ballotSubmissionId`.
       - Increments `voteCount` on each selected contestant.
2. Add comprehensive unit tests in `tests/unit/voting/voting-engine.test.ts`:
   - Happy path: zero-cost submission across multiple positions.
   - Rejection: duplicate ballot submission.
   - Concurrency race: simultaneous double submissions (<50ms apart) resolving to exactly one commit.
   - Validation failure: min/max selection bounds violation.

### Phase 4: Server Action & Integration
1. Implement `src/features/voting/actions/cast-ballot.ts` using `getSession()` and `headers()`.
2. Export from `src/features/voting/index.ts`.
3. Add unit tests in `tests/unit/voting/cast-ballot-action.test.ts`.

### Phase 5: Verification, Review & Delivery
1. Run full unit test suite (`npm run test:unit`).
2. Run typecheck (`npm run typecheck`) and linter (`npm run lint`).
3. Run code review skills (`code-review` and `code-review-and-quality`).
4. Rebase and open Pull Request with `pr-creator`.
