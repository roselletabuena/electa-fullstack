# Architecture & Technical Research: Zero-Cost Institutional Voting Engine

**Feature**: `042-zero-cost-institutional-voting-engine`  
**Ticket**: [VS-85](https://the-three-devsketeers.atlassian.net/browse/VS-85)  

---

## 1. Context & Problem Statement

Electa's original voting architecture prioritized monetization: each vote deduction required calculating package balances, interacting with payment gateways (`PAYMONGO`), or managing daily free quotas that refresh every 24 hours (`calculateVoterQuota`).

In institutional elections (Student Councils, Organization Officers) and hackathon judging:
1. **Monetization is prohibited**: No payment prompts, coin deductions, or transaction processing fees may occur.
2. **Strict Participation Limit**: Each authenticated voter is allowed exactly **one** official ballot per election.
3. **Multi-Office Structure**: A single ballot represents selections across several distinct positions (e.g. 1 President, 1 Vice President, up to 5 Senators).
4. **Race Condition Hazard**: In high-traffic school elections where voting opens simultaneously for thousands of students, concurrent ballot submissions (<50ms apart) by duplicate tabs, automation scripts, or rapid clicks must not allow double-voting.

---

## 2. Architectural Decisions & Alternatives Considered

### Decision 1: Dedicated `BallotSubmission` Entity vs Querying Existing `Vote` Table

- **Alternative A (Querying `Vote` table count)**:
  - Check `SELECT COUNT(*) FROM Vote WHERE eventId = :eventId AND voterId = :voterId`.
  - *Drawback*: Subject to classic TOCTOU (Time-of-Check to Time-of-Use) race conditions under high concurrency unless SERIALIZABLE transaction isolation or explicit table locks are used, degrading database performance.
- **Alternative B (Dedicated `BallotSubmission` table with unique constraint) - SELECTED**:
  - Introduce `BallotSubmission` with a composite unique index `@@unique([eventId, voterId])`.
  - In `db.$transaction`, create the `BallotSubmission` record first.
  - PostgreSQL automatically enforces uniqueness at the storage engine level. If two requests execute concurrently, PostgreSQL guarantees one transaction commits and the other throws a unique violation (`P2002`).
  - The domain service catches `P2002` and cleanly maps it to HTTP `409 Conflict` with `"Ballot already submitted for this election."`.

### Decision 2: Zero-Cost Policy Enforcement

- **Policy Specification**:
  - An event is treated as zero-cost institutional voting if `event.isFreeVotingOnly === true` OR `event.archetype === "STUDENT_COUNCIL"` OR `event.archetype === "HACKATHON"`.
  - All payment checks, package validations, and wallet queries are completely bypassed.
  - All resulting `Vote` entries are tagged with `voteType: "FREE"`, `voteWeight: 1`, `paymentTransactionId: null`, and `ballotSubmissionId: ballot.id`.

### Decision 3: Multi-Office Ballot Validation

- Positions defined in `EventPosition` specify:
  - `minSelectionsPerVoter`: minimum candidates the voter must pick for this office (e.g., 0 for optional, 1 for required).
  - `maxSelectionsPerVoter`: maximum candidates allowed (e.g., 1 for single-seat executive, 5 for senators).
- Validation pipeline:
  1. Zod input schema validates payload structure, UUIDs, and basic bounds.
  2. The voting engine queries the event's positions and contestants in a single query.
  3. Ensures:
     - All referenced `positionId`s exist in the event and have `isVotingOpen === true`.
     - Candidate count for each position satisfies `min <= count <= max`.
     - No candidate is selected multiple times within the same position.
     - All candidates have `status === "ACTIVE"` and belong to the correct `positionId`.

### Decision 4: Rate Limiting & Bot Mitigation

- Reuse Electa's battle-tested security utilities:
  - `checkIpVelocity`: throttles excessive rapid requests from identical IPs.
  - `checkDeviceAccountLimit`: prevents a single device from voting across many fake student accounts.
  - `verifyTurnstileToken`: validates Cloudflare Turnstile token when enabled.

---

## 3. Technology Stack & Dependencies

- **Prisma ORM**: Data modeling, migrations, and atomic `$transaction` execution.
- **Zod 3**: Schema definition and boundary validation (§I).
- **TypeScript 5 (Strict Mode)**: Strict typing, zero `any`, zero non-null assertions `!`.
- **Next.js 16 Server Actions**: Boundary isolation (§II) via `castBallotAction`.
- **Vitest**: Unit testing with simulated concurrent race condition tests.
