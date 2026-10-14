# Quickstart: Secret-Ballot Decoupling Service

**Feature ID**: `045-secret-ballot-decoupling-processor`  
**Ticket**: [VS-110](https://the-three-devsketeers.atlassian.net/browse/VS-110)  

---

## Example Usage

### 1. Generating & Verifying Cryptographic Receipts

```typescript
import { generateBallotReceiptHash, verifyBallotReceiptHash } from "@/lib/crypto/ballot-receipt";

const { receiptHash, nonce, timestamp } = generateBallotReceiptHash({
  eventId: "evt-uuid",
  selections: [
    { officeId: "off-pres", candidateId: "cand-1" },
    { officeId: "off-vp", candidateId: "cand-2" },
  ],
});

const isValid = verifyBallotReceiptHash({
  receiptHash,
  eventId: "evt-uuid",
  nonce,
  timestamp,
  selections: [
    { officeId: "off-pres", candidateId: "cand-1" },
    { officeId: "off-vp", candidateId: "cand-2" },
  ],
});
// isValid === true
```

### 2. Submitting a Decoupled Secret Ballot

```typescript
import { castSecretBallotAction } from "@/features/voting/actions/cast-secret-ballot";

const response = await castSecretBallotAction({
  eventId: "event-id-123",
  selections: [
    { positionId: "position-pres-id", contestantIds: ["cand-alice"] },
    { positionId: "position-senator-id", contestantIds: ["cand-bob", "cand-carol"] },
  ],
});

if (response.success) {
  console.log("Voted successfully with receipt:", response.data.receiptHash);
} else {
  console.error("Submission failed:", response.error.message);
}
```
