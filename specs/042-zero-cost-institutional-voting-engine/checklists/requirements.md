# Requirements Quality Checklist: Zero-Cost Institutional Voting Engine

**Feature**: `042-zero-cost-institutional-voting-engine`  
**Ticket**: [VS-85](https://the-three-devsketeers.atlassian.net/browse/VS-85)  

---

## 1. Specification Completeness & Functional Coverage

- [x] **Zero-Cost Bypasses**: Payment gateways, fee take-rates, and wallet deduction routines are 100% bypassed when `isFreeVotingOnly` is active or archetype is `STUDENT_COUNCIL` / `HACKATHON`.
- [x] **Single-Ballot Invariant**: Exactly 1 ballot submission per authenticated identity is permitted per institutional event.
- [x] **Multi-Office Validation**: Validates all office selections against configured `minSelectionsPerVoter` and `maxSelectionsPerVoter` constraints.
- [x] **Duplicate Rejection Envelope**: Rejects duplicate submissions with HTTP 409 Conflict, code `BALLOT_ALREADY_SUBMITTED`, and message `"Ballot already submitted for this election."`.
- [x] **Concurrent Safety**: Simulated concurrent requests (<50ms apart) demonstrate that database unique constraints prevent double-voting under race conditions.
- [x] **Active Contestant Verification**: Only `ACTIVE` contestants linked to the event (and their respective positions) can receive votes.
- [x] **Event Lifecycle Guard**: Ballots cannot be cast before `startsAt` or after `endsAt`, or when `publicationStatus !== "PUBLISHED"`.

---

## 2. Electa Constitution Compliance (§I–§VI)

- [x] **§I. Strict Type Safety**: Full TypeScript 5 strict mode, zero `any`, zero `as any`, zero non-null assertions (`!`). All inputs and outputs validated via Zod schemas.
- [x] **§II. Server-First & Boundary Isolation**: Domain logic encapsulated in `src/features/voting/services/voting-engine.ts`; Server Action `castBallotAction` in `src/features/voting/actions/cast-ballot.ts`.
- [x] **§III. Single Source of Truth**: Prisma schema is the single source of truth for database state.
- [x] **§IV. Secure-by-Design**: Authenticates via `getSession()`. No raw `process.env` bypasses.
- [x] **§V. Vertical Slice Colocation**: Clean modular architecture inside `src/features/voting/` with shared validations in `src/lib/validations/ballot.ts`.
- [x] **§VI. Test-First Quality Gates**: Vitest unit test suite covering happy paths, duplicate submissions, concurrency races, invalid office limits, and boundary errors.

---

## 3. Non-Functional & Security Requirements

- [x] **IP Velocity Limiting**: Uses `checkIpVelocity` to throttle rapid automated attacks.
- [x] **Device Account Limiting**: Uses `checkDeviceAccountLimit` to prevent multi-account ballot stuffing from a single device.
- [x] **Turnstile Token Integration**: Validates Cloudflare Turnstile token when configured.
- [x] **Atomic Transactions**: All mutations (`BallotSubmission`, `Vote` records, contestant `voteCount` increments) execute within a single atomic `db.$transaction`.
