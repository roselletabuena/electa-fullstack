# Data Model: Zero-Cost Institutional Voting Engine

**Feature**: `042-zero-cost-institutional-voting-engine`  
**Ticket**: [VS-85](https://the-three-devsketeers.atlassian.net/browse/VS-85)  

---

## 1. Prisma Schema Changes

### `Event` (Updated)

```prisma
model Event {
  // Existing fields ...
  archetype           EventArchetype         @default(PAGEANT)
  isFreeVotingOnly    Boolean                @default(false)
  // ...
  ballotSubmissions   BallotSubmission[]
  // ...
}
```

### `BallotSubmission` (New Model)

```prisma
model BallotSubmission {
  id        String   @id @default(uuid())
  eventId   String
  voterId   String
  createdAt DateTime @default(now())

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  votes     Vote[]

  @@unique([eventId, voterId])
  @@index([eventId])
  @@index([voterId])
}
```

### `Vote` (Updated)

```prisma
model Vote {
  // Existing fields ...
  positionId           String?
  ballotSubmissionId   String?
  // ...
  ballotSubmission     BallotSubmission?   @relation(fields: [ballotSubmissionId], references: [id], onDelete: SetNull)

  @@index([ballotSubmissionId])
}
```

---

## 2. Domain Data Transfer Objects (DTOs)

### Ballot Input Types

```typescript
export interface OfficeSelectionDto {
  positionId?: string | null;
  contestantIds: string[];
}

export interface CastBallotInputDto {
  eventId: string;
  selections: OfficeSelectionDto[];
  turnstileToken?: string;
  deviceFingerprint?: string;
  idempotencyKey?: string;
}
```

### Ballot Result Types

```typescript
export interface BallotVoteSummaryDto {
  voteId: string;
  contestantId: string;
  positionId?: string | null;
}

export interface CastBallotResultDto {
  success: true;
  ballotId: string;
  eventId: string;
  voterId: string;
  votesCount: number;
  votes: BallotVoteSummaryDto[];
  submittedAt: string;
}

export interface CastBallotErrorDto {
  code:
    | "NOT_AUTHENTICATED"
    | "EVENT_NOT_ACTIVE"
    | "BALLOT_ALREADY_SUBMITTED"
    | "INVALID_BALLOT_SELECTIONS"
    | "POSITION_SELECTION_LIMIT_VIOLATION"
    | "CONTESTANT_NOT_ELIGIBLE"
    | "RATE_LIMIT_EXCEEDED"
    | "DEVICE_ACCOUNT_LIMIT_EXCEEDED"
    | "BOT_DETECTION_FAILED"
    | "INTERNAL_ERROR";
  message: string;
  details?: Record<string, unknown>;
}
```
