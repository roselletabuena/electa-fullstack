# Data Model & Schema Specification: Free Daily Voting Engine (VS-28)

## 1. Prisma Schema Additions

### Enum: `VoteType`

```prisma
enum VoteType {
  FREE
  BOOST
}
```

### Model: `Vote`

```prisma
model Vote {
  id              String        @id @default(uuid())
  eventId         String
  contestantId    String
  voterId         String
  awardCategoryId String?
  voteType        VoteType      @default(FREE)
  voteWeight      Int           @default(1)
  createdAt       DateTime      @default(now())

  event           Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  contestant      Contestant    @relation(fields: [contestantId], references: [id], onDelete: Cascade)

  @@index([eventId, voterId, createdAt])
  @@index([eventId, voterId, voteType, createdAt])
  @@index([contestantId])
  @@index([eventId, createdAt])
}
```

### Updates to Existing Models

#### `Event`

```prisma
model Event {
  // Existing fields ...
  votes Vote[]
}
```

#### `Contestant`

```prisma
model Contestant {
  // Existing fields ...
  votes Vote[]
}
```

---

## 2. TypeScript Domain Types

```typescript
export interface VoterQuotaStateDto {
  dailyLimit: number;
  votesUsedIn24h: number;
  remainingVotes: number;
  isFreeVotingEnabled: boolean;
  isEventActive: boolean;
  isInCooldown: boolean;
  nextResetTime: string | null; // ISO Date string of earliest reset when remainingVotes === 0
}

export interface CastFreeVoteInput {
  eventId: string;
  contestantId: string;
  awardCategoryId?: string;
}

export interface CastFreeVoteResultDto {
  success: boolean;
  voteId: string;
  contestantId: string;
  newContestantVoteCount: number;
  quotaState: VoterQuotaStateDto;
}
```
