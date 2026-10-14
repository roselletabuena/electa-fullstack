# Data Model: Multi-Criteria Judge Rubric Scoring & Aggregate Tallies Service

**Feature**: `043-judge-rubric-scoring-service`  
**Ticket**: [VS-114](https://the-three-devsketeers.atlassian.net/browse/VS-114)  
**Date**: 2026-10-14  

---

## 1. Entities & Prisma Schema Extensions

```prisma
model RubricCriterion {
  id           String       @id @default(uuid())
  eventId      String
  title        String
  description  String?
  weight       Decimal      @default(1.00) @db.Decimal(5, 2)
  maxScore     Int          @default(10)
  displayOrder Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  event        Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  scores       JudgeScore[]

  @@index([eventId])
  @@index([eventId, displayOrder])
}

model JudgeEvaluation {
  id             String       @id @default(uuid())
  eventId        String
  judgeId        String
  submissionId   String
  isDraft        Boolean      @default(false)
  notes          String?      @db.Text
  compositeScore Decimal?     @db.Decimal(5, 2)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  event          Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  scores         JudgeScore[]

  @@unique([eventId, judgeId, submissionId])
  @@index([eventId])
  @@index([judgeId])
  @@index([submissionId])
  @@index([eventId, isDraft])
}

model JudgeScore {
  id           String          @id @default(uuid())
  evaluationId String
  criterionId  String
  score        Decimal         @db.Decimal(4, 2)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  evaluation   JudgeEvaluation @relation(fields: [evaluationId], references: [id], onDelete: Cascade)
  criterion    RubricCriterion @relation(fields: [criterionId], references: [id], onDelete: Cascade)

  @@unique([evaluationId, criterionId])
  @@index([evaluationId])
  @@index([criterionId])
}
```

---

## 2. Invariants & Constraints

1. **Unique Evaluation**: A judge can only have at most one evaluation record per submission per event (`@@unique([eventId, judgeId, submissionId])`).
2. **Unique Criterion Score**: An evaluation can contain at most one score entry per criterion (`@@unique([evaluationId, criterionId])`).
3. **Draft Separation**: Leaderboard and aggregate computations strictly filter `isDraft: false`.
4. **Referential Integrity**: Cascading delete on `Event` removes associated `RubricCriterion` and `JudgeEvaluation`. Cascading delete on `JudgeEvaluation` removes associated `JudgeScore`.

---

## 3. Domain DTOs & Types

```typescript
export interface CriterionScoreInput {
  criterionId: string;
  score: number;
}

export interface SubmitScorecardInput {
  eventId: string;
  submissionId: string;
  scores: CriterionScoreInput[];
  notes?: string | undefined;
  isDraft?: boolean | undefined;
}

export interface ScorecardResult {
  evaluationId: string;
  eventId: string;
  submissionId: string;
  judgeId: string;
  isDraft: boolean;
  compositeScore: number;
  notes?: string | null;
  scores: Array<{
    criterionId: string;
    score: number;
    criterionTitle?: string;
    weight?: number;
  }>;
  submittedAt: string;
}

export interface ProjectAggregateScore {
  submissionId: string;
  completedEvaluationsCount: number;
  averageCompositeScore: number;
  criteriaBreakdown: Record<string, {
    criterionTitle: string;
    averageScore: number;
    weight: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  submissionId: string;
  averageScore: number;
  evaluationsCount: number;
}
```
