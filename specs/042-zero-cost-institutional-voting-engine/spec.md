# Feature Specification: Zero-Cost Institutional Voting Engine & Rate Limiter

**Feature ID**: `042-zero-cost-institutional-voting-engine`  
**Ticket**: [VS-85](https://the-three-devsketeers.atlassian.net/browse/VS-85)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Draft  
**Created**: 2026-10-13  

---

## 1. Overview & Business Value

Electa's core voting service was historically designed with monetization as a primary driver (e.g., paid vote packages, transaction take-rates, coin deductions). For official school elections (`STUDENT_COUNCIL`) and hackathon judging (`HACKATHON`), monetization must be completely disabled, and strict participation guards (single-ballot or single-session vote) must be enforced at the domain service layer.

This feature implements the **Zero-Cost Institutional Voting Engine & Rate Limiter**:
1. Support for `isFreeVotingOnly: true` event mode and institutional archetypes (`STUDENT_COUNCIL`, `HACKATHON`) that completely bypasses payment gateway checks and coin balance deductions.
2. Enforces exactly 1 official ballot submission per authenticated voter identity (`BallotSubmission` persistence model with database unique constraint `@@unique([eventId, voterId])`).
3. Multi-office / multi-position ballot validation: verifies selections across configured `EventPosition`s respect `minSelectionsPerVoter` and `maxSelectionsPerVoter` bounds.
4. Atomic database transactions (`db.$transaction`) with strict concurrency control ensuring simultaneous double-vote requests (<50ms apart) result in exactly one committed ballot and a safe `409 CONFLICT` rejection for the duplicate attempt with message `"Ballot already submitted for this election."`.
5. Multi-layer security and velocity rate limiting (IP velocity, device account limits, and optional Turnstile bot mitigation).
6. 100% backward compatibility and zero regression for existing paid vote and daily free vote paths in `PAGEANT` archetypes.

---

## 2. Actors & User Stories

### User Story

> **As a** school election organizer or hackathon director,  
> **I want to** configure a zero-cost voting policy with strict 1-ballot-per-voter rate limits in the voting engine,  
> **so that** participants never encounter payment paywalls and every authorized voter can cast exactly one official ballot.

### Actors
- **Institutional Voter (Student / Hackathon Participant)**: Casts a multi-office ballot with zero monetary cost, receiving immutable submission confirmation.
- **Election Organizer / Administrator**: Sets up an institutional event where students/participants vote once without payments, with confidence that duplicate ballot attempts are rejected.
- **Platform Engine / Downstream UIs**: Consumes the unified `castBallotAction` server action and domain service (`voting-engine.ts`) to drive student council ballots (VS-109) and hackathon judging (VS-116).

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Zero-Cost Ballot Execution
- **Given** an event with `isFreeVotingOnly: true` (or `STUDENT_COUNCIL` / `HACKATHON` archetype) and an authenticated, eligible voter
- **When** the voter submits their ballot selections across valid positions
- **Then** the voting engine processes and records the ballot atomically without calling any payment gateway or decrementing coin balances,
- **And** creates a `BallotSubmission` record and associated `Vote` entries for all selected contestants,
- **And** increments each selected contestant's `voteCount` by 1,
- **And** returns a successful ballot receipt with status `200 OK`.

### Scenario 2: Validation & Error Handling - Duplicate Ballot Rejection
- **Given** a voter who has already completed a ballot submission for an institutional election
- **When** a subsequent vote request is initiated for the same event and voter identity
- **Then** the engine rejects the transaction with a `409 CONFLICT` error and message `"Ballot already submitted for this election."`,
- **And** no additional vote records or vote counts are recorded in the database.

### Scenario 3: Edge Case - High-Concurrency Double-Vote Attempt
- **Given** two identical or concurrent ballot submission requests sent simultaneously (<50ms apart) by the same voter session
- **When** the database transactions execute concurrently
- **Then** database unique constraints on `[eventId, voterId]` guarantee exactly one transaction commits and the second fails safely with `409 CONFLICT` and `"Ballot already submitted for this election."`,
- **And** the voter's votes are counted exactly once.

### Scenario 4: Validation - Multi-Office Selection Limit Enforcement
- **Given** an institutional election with positions having selection constraints (e.g. President: max 1, Senator: max 3, min 1)
- **When** a voter submits a ballot containing 4 senators or 2 presidents
- **Then** the Zod validation schema and domain service reject the submission with a `400 BAD_REQUEST` error indicating the violated position bounds,
- **And** the transaction is rolled back with no votes committed.

### Scenario 5: Backward Compatibility - Pageant Archetype Invariance
- **Given** a pageant event (`archetype: "PAGEANT"`) with paid vote or daily quota options
- **When** existing vote actions (`castVoteAction`, `castFreeVoteAction`) are executed
- **Then** the existing monetized and daily-limit workflows execute without any regression or alteration.

---

## 4. Technical Scope & Boundary Mapping

- **Database Layer (`prisma/schema.prisma`)**:
  - Add `isFreeVotingOnly Boolean @default(false)` to `Event`.
  - Add `model BallotSubmission` with `id`, `eventId`, `voterId`, `createdAt`, `@@unique([eventId, voterId])`.
  - Add `ballotSubmissionId String?` and relation `ballotSubmission BallotSubmission?` to `Vote`.
- **Validation Layer (`src/lib/validations/ballot.ts`)**:
  - Zod schemas: `castBallotSchema`, `ballotSelectionSchema`, `ballotPositionRuleSchema`.
- **Domain Service Layer (`src/features/voting/services/voting-engine.ts`)**:
  - `castInstitutionalBallot()`: orchestrates verification, position rules check, atomic Prisma transaction, and duplicate error handling.
  - `hasVoterSubmittedBallot()`: query helper to inspect prior participation status.
- **Action Layer (`src/features/voting/actions/cast-ballot.ts`)**:
  - Server action `castBallotAction()` enforcing `getSession()` authentication, client IP extraction, and typed `CastBallotResponse`.
- **Types Layer (`src/features/voting/types/ballot.ts`)**:
  - Strongly typed input, result, and error DTOs.
