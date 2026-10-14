# Feature Specification: Cryptographic Secret-Ballot Decoupling & Cast Ballot Processor

**Feature ID**: `045-secret-ballot-decoupling-processor`  
**Ticket**: [VS-110](https://the-three-devsketeers.atlassian.net/browse/VS-110)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Specified  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

In democratic student council and institutional elections, secret ballot integrity is a strict constitutional requirement. Storing voter identifiers (user ID, session token, email, or client IP) directly on vote or ballot selection records permanently compromises voter privacy and risks coercion or retaliation.

This feature implements the **Cryptographic Secret-Ballot Decoupling Engine**:
1. **Two-Step Transactional Decoupling**: Separates voter participation tracking (`VoterParticipation`) from anonymous ballot choices (`BallotSelection`).
2. **Double-Voting Prevention**: Records voter participation indexed by `(eventId, userId)` within the same atomic transaction.
3. **Cryptographic Anonymous Receipt**: Generates an irreversible HMAC-SHA256 receipt hash and token given to the voter, enabling future tally verification without revealing voter identity.
4. **Zero-Knowledge Vote Storage**: Ensures zero foreign keys or voter identifiers link back to `userId` from `BallotSelection` rows.
5. **Atomic Rollback Guarantee**: Guarantees that any transaction failure immediately aborts both participation marking and ballot selection insertion, leaving the voter eligible to retry.
6. **Server Action & Domain Service Integration**: Delivers `castSecretBallotAction` and `secret-ballot-service.ts`, seamlessly backing the multi-office ballot interface.

---

## 2. Invariants & Governance

1. **Decoupled Architecture Invariant**: Under no circumstance shall any foreign key, user ID, email, IP address, or session token be written to `BallotSelection`.
2. **Atomic All-or-Nothing Invariant**: The database transaction writing `VoterParticipation`, inserting `BallotSelection` rows, and updating candidate tallies must execute as a single atomic unit. Any failure rolls back all mutations.
3. **Double-Voting Protection Invariant**: If a record in `VoterParticipation` already exists for `(eventId, userId)`, the submission must reject immediately with `BALLOT_ALREADY_SUBMITTED`.
4. **Irreversible Receipt Invariant**: The returned `receiptHash` is calculated using HMAC-SHA256 with a secure server secret and cryptographic nonce, ensuring auditors can verify vote presence without correlating the receipt back to the user identity.
5. **Constitution Compliance**: Adheres to strict TypeScript 5 (no `any`, no non-null assertions `!`), validated via Zod, with session authorization through `getSession()` and environment access through `@/env`.

---

## 3. Actors & User Stories

### User Story 1 (Priority: P1 - Cryptographic Secret-Ballot Decoupling)
> **As an** eligible student voter,  
> **I want** my cast ballot selections to be irreversibly decoupled from my identity upon submission,  
> **so that** election administrators or system operators cannot deduce which candidates I voted for.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Decoupled secret ballot submission
  Given an authenticated eligible student submitting valid multi-office ballot selections
  When the secret ballot processor executes the transaction
  Then the voter's participation is marked in VoterParticipation with (eventId, userId, votedAt)
  And all candidate choices are inserted into BallotSelection with zero voter identifiers
  And an HMAC-SHA256 receipt hash is generated and returned to the voter
```

### User Story 2 (Priority: P1 - Atomic Rollback on Failure)
> **As a** student voter encountering a system or network anomaly during ballot casting,  
> **I want** the entire submission to roll back atomically if any error occurs,  
> **so that** I am not left in a state where my participation is marked but my votes were dropped.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Atomic transaction rollback on database failure
  Given a submission where an error occurs during BallotSelection insertion
  When the database transaction fails
  Then VoterParticipation is not recorded, candidate tallies remain unchanged, and an error response is returned
  And the voter is permitted to resubmit their ballot
```

### User Story 3 (Priority: P1 - Double-Voting Prevention)
> **As an** election administrator,  
> **I want** any repeat ballot attempt by a voter who has already cast a ballot to be blocked,  
> **so that** the principle of one student, one vote is strictly enforced.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Rejecting duplicate ballot submission
  Given a voter whose participation is already recorded in VoterParticipation for eventId
  When they attempt to submit another ballot
  Then the submission is rejected with error code BALLOT_ALREADY_SUBMITTED
  And no duplicate BallotSelection records are created
```

### User Story 4 (Priority: P2 - Cryptographic Audit Anonymity Inspection)
> **As an** election auditor or observer,  
> **I want** to query the database records for BallotSelection,  
> **so that** I can verify that no column, relationship, or log leaks the voter's identity.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Database auditor anonymity inspection
  Given an election database with cast ballots
  When an auditor inspects all columns of BallotSelection
  Then only eventId, officeId, candidateId, receiptHash, and createdAt exist
  And no userId, user foreign key, or client metadata is present
```

---

## 4. Technical Scope & Target Files

- `prisma/schema.prisma` (`VoterParticipation` and `BallotSelection` models)
- `src/lib/crypto/ballot-receipt.ts` (HMAC-SHA256 receipt generation & verification functions)
- `src/features/voting/services/secret-ballot-service.ts` (Transactional decoupling core service)
- `src/features/voting/actions/cast-secret-ballot.ts` (Server Action validating session and invoking secret ballot service)
- `src/features/voting/types/ballot.ts` (Extended receipt DTOs with cryptographic receiptHash)
- `src/features/voting/actions/cast-ballot.ts` (Adapter forwarding to secret-ballot-service for backward compatibility)
- `tests/unit/voting/secret-ballot-service.test.ts` (Comprehensive unit tests for decoupling, rollback, and duplicate guards)
- `tests/unit/crypto/ballot-receipt.test.ts` (Cryptographic verification and HMAC tests)
