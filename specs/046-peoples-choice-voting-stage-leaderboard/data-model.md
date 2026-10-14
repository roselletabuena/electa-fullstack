# Data Model: Demo Day People's Choice Voting & Stage Leaderboard

**Feature ID**: `046-peoples-choice-voting-stage-leaderboard`  
**Ticket**: [VS-116](https://the-three-devsketeers.atlassian.net/browse/VS-116)  
**Date**: 2026-10-15  

---

## 1. Prisma Storage Schema

### New Model: `ProjectVote`
```prisma
model ProjectVote {
  id           String            @id @default(uuid())
  eventId      String
  submissionId String
  voterId      String
  createdAt    DateTime          @default(now())

  event        Event             @relation(fields: [eventId], references: [id], onDelete: Cascade)
  submission   ProjectSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@unique([eventId, voterId])
  @@index([eventId])
  @@index([submissionId])
  @@index([voterId])
}
```

### Updates to `ProjectSubmission` Model
```prisma
model ProjectSubmission {
  // ... existing fields ...
  voteCount     Int               @default(0)
  projectVotes  ProjectVote[]
}
```

### Updates to `Event` Model
```prisma
model Event {
  // ... existing fields ...
  projectVotes  ProjectVote[]
}
```

---

## 2. Invariants & Database Constraints

1. **Unique Voter Guarantee (`@@unique([eventId, voterId])`)**:
   - An attendee/voter identity (`voterId`) can cast at most one vote per hackathon event.
   - Any duplicate submission attempt throws Prisma `P2002`, which is caught and returned as `409 Conflict` with the standard message: `"You have already cast your People's Choice vote for this hackathon."`.
2. **Referential Integrity**:
   - Foreign keys to `Event` and `ProjectSubmission` have `onDelete: Cascade`.
3. **Atomic Tally Synchronization**:
   - In a Prisma interactive transaction:
     - `tx.projectVote.create(...)`
     - `tx.projectSubmission.update({ where: { id }, data: { voteCount: { increment: 1 } } })`
   - Guarantees that `voteCount` is always precisely equal to `COUNT(ProjectVote WHERE submissionId = id)`.

---

## 3. Data Transfer Objects (DTOs)

```typescript
export interface CastPeoplesChoiceVoteInput {
  eventId: string;
  submissionId: string;
}

export interface CastPeoplesChoiceVoteResponse {
  success: boolean;
  data: {
    submissionId: string;
    totalVotes: number;
    hasVoted: boolean;
  } | null;
  error: {
    code: "NOT_AUTHENTICATED" | "ALREADY_VOTED" | "EVENT_NOT_ACTIVE" | "SUBMISSION_NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
  } | null;
}

export interface StageProjectLeaderboardEntryDto {
  id: string;
  title: string;
  tagline: string | null;
  repositoryUrl: string;
  demoUrl: string | null;
  trackTags: string[];
  members: string[];
  voteCount: number;
  rank: number;
  votePercentage: number;
}

export interface StageLeaderboardDataDto {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  totalVotesCast: number;
  totalProjects: number;
  topProjects: StageProjectLeaderboardEntryDto[];
  tracks: string[];
}
```
