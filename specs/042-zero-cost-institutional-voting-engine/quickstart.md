# Quickstart & Verification Guide: Zero-Cost Institutional Voting Engine

**Feature**: `042-zero-cost-institutional-voting-engine`  
**Ticket**: [VS-85](https://the-three-devsketeers.atlassian.net/browse/VS-85)  

---

## 1. Prerequisites & Environment Setup

Verify the isolated worktree is properly configured:
```bash
git branch --show-current
# Should be: feature/VS-85-zero-cost-institutional-voting-engine
```

Verify dependencies and database client:
```bash
npx prisma generate
```

---

## 2. Automated Test Verification

Run the dedicated test suite for the institutional voting engine and race conditions:

```bash
# Run unit tests
npm run test:unit tests/unit/voting/voting-engine.test.ts tests/unit/voting/cast-ballot.test.ts

# Run entire test suite
npm run test:unit

# Run type check and linter
npm run typecheck
npm run lint
```

---

## 3. Key Scenario Walkthroughs

### Scenario A: Zero-Cost Ballot Execution
```typescript
import { castInstitutionalBallot } from "@/features/voting/services/voting-engine";

const result = await castInstitutionalBallot({
  voterId: "user-123",
  eventId: "event-student-council",
  selections: [
    { positionId: "pos-president", contestantIds: ["candidate-alice"] },
    { positionId: "pos-senator", contestantIds: ["candidate-bob", "candidate-charlie"] }
  ],
});
// result.success === true
// result.data.votesCount === 3
```

### Scenario B: Duplicate Submission Rejection
```typescript
const duplicate = await castInstitutionalBallot({
  voterId: "user-123",
  eventId: "event-student-council",
  selections: [
    { positionId: "pos-president", contestantIds: ["candidate-alice"] }
  ],
});
// duplicate.success === false
// duplicate.error.code === "BALLOT_ALREADY_SUBMITTED"
// duplicate.error.message === "Ballot already submitted for this election."
```

### Scenario C: High Concurrency Race (<50ms apart)
```typescript
const [res1, res2] = await Promise.all([
  castInstitutionalBallot({ voterId: "user-simultaneous", eventId: "event-sc", selections: [...] }),
  castInstitutionalBallot({ voterId: "user-simultaneous", eventId: "event-sc", selections: [...] }),
]);
// Exactly one is success: true, the other is success: false (code: "BALLOT_ALREADY_SUBMITTED")
```
