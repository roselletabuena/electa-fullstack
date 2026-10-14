# Architecture Plan: Cryptographic Secret-Ballot Decoupling & Cast Ballot Processor

**Feature ID**: `045-secret-ballot-decoupling-processor`  
**Ticket**: [VS-110](https://the-three-devsketeers.atlassian.net/browse/VS-110)  

---

## 1. Architectural Strategy

1. **Schema Migration via Prisma**:
   - Add `VoterParticipation` and `BallotSelection` models to `prisma/schema.prisma`.
   - Update `Event`, `EventPosition`, and `Contestant` relations.
   - Run `npx prisma db push` or migration in local development / worktree to update client.
2. **Cryptographic Library (`src/lib/crypto/ballot-receipt.ts`)**:
   - Use `crypto.createHmac("sha256", secret)` with fallback to a cryptographically strong hash if no custom secret is provided.
   - Deterministic serialization of selections: office ID and candidate ID sorted canonically.
   - Helper `verifyBallotReceiptHash` to recompute and verify receipt authenticity.
3. **Domain Service (`src/features/voting/services/secret-ballot-service.ts`)**:
   - `castSecretBallot(params)`:
     - Pre-transaction validations: operational status, office limits, candidate eligibility, security/rate-limiting.
     - Interactive transaction `db.$transaction`:
       1. Insert `VoterParticipation(eventId, userId, votedAt)`.
       2. Generate `receiptHash`.
       3. Bulk insert `BallotSelection(eventId, officeId, candidateId, receiptHash, createdAt)`.
       4. Increment `Contestant.voteCount`.
       5. Return structured result with `receiptHash`.
     - Error handling: Catch `P2002` (unique constraint on `eventId_userId`) -> return `BALLOT_ALREADY_SUBMITTED`.
     - Transaction rollback on unexpected errors -> return `TRANSACTION_FAILED`.
   - `hasVoterParticipated(eventId, userId)`:
     - Queries `db.voterParticipation.findUnique({ where: { eventId_userId: { eventId, userId } } })`.
4. **Server Actions (`src/features/voting/actions/cast-secret-ballot.ts`)**:
   - Authenticates via `getSession()`.
   - Extracts client IP from headers.
   - Parses input via `castBallotSchema`.
   - Invokes `castSecretBallot`.
   - Returns typed `SecretBallotResponse`.
5. **Compatibility Bridge**:
   - Maintain `castBallotAction` in `cast-ballot.ts` calling the decoupled engine so existing ballot interfaces immediately benefit from privacy decoupling.
6. **Testing Suite**:
   - Unit tests verifying cryptographic receipt hashing & verification.
   - Domain service tests verifying decoupling (no userId in `BallotSelection`), duplicate prevention, and atomic rollback simulation.
