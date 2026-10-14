# Technical Research: Cryptographic Secret-Ballot Decoupling Architecture

**Feature ID**: `045-secret-ballot-decoupling-processor`  
**Ticket**: [VS-110](https://the-three-devsketeers.atlassian.net/browse/VS-110)  

---

## 1. Architectural Patterns for Secret-Ballot Privacy

### Problem Analysis
In conventional multi-tenant database designs, a foreign key `userId` is naturally placed on the vote record (`Vote.userId`). While simple, this allows anyone with database read access (DBAs, hosting platform admins, compromised credentials) to execute:
```sql
SELECT c.name, o.name FROM "Vote" v 
JOIN "Contestant" c ON v."contestantId" = c.id 
WHERE v."userId" = 'student-alice-id';
```
This violates institutional voting privacy.

### The Decoupling Pattern
To resolve this without needing complex multi-party zero-knowledge computation:
1. **Participation Ledger (`VoterParticipation`)**:
   Tracks that a user participated: `(eventId, userId, votedAt)`.
   Stores NO reference to the candidate votes cast, NO reference to the ballot receipt hash.
2. **Anonymous Selection Ledger (`BallotSelection`)**:
   Tracks the anonymous vote records: `(eventId, officeId, candidateId, receiptHash, createdAt)`.
   Zero link to `userId`.
3. **Cryptographic Receipt Hash**:
   An HMAC-SHA256 signature calculated over `eventId`, a random cryptographic salt/nonce, and the canonical ordered candidate selections. The voter receives the receipt token immediately upon submission.
   The voter can verify their ballot was recorded in public tally boards (FE: 2.4) by looking up their `receiptHash`, while no third party can correlate the `receiptHash` to their `userId`.

---

## 2. Concurrency & Atomicity

Using Prisma interactive transactions `db.$transaction(async (tx) => { ... })`:
1. Attempt creation of `VoterParticipation`:
   - Unique constraint `@@unique([eventId, userId])` enforces that concurrent submissions or duplicate attempts will fail with Prisma error `P2002`.
2. Generate `receiptHash`:
   - Using Node.js native `crypto.createHmac("sha256", secret)` with server secret `AUTH_SECRET` from `@/env`.
3. Bulk insert `BallotSelection`:
   - Insert individual choices for all offices selected on the ballot.
4. Increment candidate tallies:
   - Increment `voteCount` on each chosen contestant to ensure instantaneous certified results.
5. If any step fails or times out:
   - Entire transaction rolls back automatically.
   - Voter participation is NOT recorded, allowing the student to retry cleanly.

---

## 3. Cryptographic Receipt Specification

```typescript
export interface GenerateBallotReceiptParams {
  eventId: string;
  selections: Array<{ officeId: string; candidateId: string }>;
  nonce?: string;
  timestamp?: Date;
}

export function generateBallotReceiptHash(
  params: GenerateBallotReceiptParams,
  secret: string
): { receiptHash: string; nonce: string; timestamp: string }
```
- The payload is sorted deterministically: `selections.sort((a, b) => a.officeId.localeCompare(b.officeId) || a.candidateId.localeCompare(b.candidateId))`.
- String canonical representation: `${eventId}|${nonce}|${timestamp}|${sortedSelectionsJson}`.
- Digest: Hex string HMAC-SHA256.
