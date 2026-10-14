# Research & Architecture Decisions: Multi-Criteria Judge Rubric Scoring & Aggregate Tallies Service

**Feature**: `043-judge-rubric-scoring-service`  
**Ticket**: [VS-114](https://the-three-devsketeers.atlassian.net/browse/VS-114)  
**Date**: 2026-10-14  

---

## 1. Stack Context & Core Invariants

| Concern       | Decision                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | Next.js 16 App Router — Server Actions & RSC                             |
| Language      | TypeScript 5 strict mode — 0 `any`, 0 non-null assertions `!`            |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)          |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`        |
| Server State  | TanStack Query for client-side evaluation querying                       |
| Forms / Input | React Hook Form + Zod (`zodResolver`)                                    |
| API Responses | `ApiResponse<T>` envelope (`apiSuccess`, `apiError`)                     |
| Math/Precision| Exact weighted calculation with fixed decimal rounding (`Number(val.toFixed(2))` / `Decimal`) |
| Styling / UI  | Zero-radius (`rounded-none`), Light Mode Opal default, WCAG 2.1 AA       |

---

## 2. Technical Decisions & Rationale

### Decision 1: Relational Modeling of Scores vs Single JSON Column
- **Problem**: Should individual criterion scores be stored in a loose JSON blob on `JudgeEvaluation` or as relational `JudgeScore` records?
- **Decision**: Relational model `JudgeScore` linked to `JudgeEvaluation` and `RubricCriterion`:
  ```prisma
  model JudgeScore {
    id           String          @id @default(uuid())
    evaluationId String
    criterionId  String
    score        Decimal         @db.Decimal(4, 2)
    evaluation   JudgeEvaluation @relation(fields: [evaluationId], references: [id], onDelete: Cascade)
    criterion    RubricCriterion @relation(fields: [criterionId], references: [id], onDelete: Cascade)
    @@unique([evaluationId, criterionId])
  }
  ```
- **Rationale**:
  1. Guarantees referential integrity if a rubric criterion is referenced or checked.
  2. Enables SQL aggregations per criterion (e.g., "Which team had the highest Technical Complexity score?").
  3. `@@unique([evaluationId, criterionId])` prevents duplicate scores for the same criterion within one scorecard submission.

### Decision 2: Weighted Calculation & Normalization Formula
- **Problem**: Organizers may enter weights as percentages (e.g. 30, 30, 20, 20) or decimals (0.3, 0.3, 0.2, 0.2) or raw weights (3, 3, 2, 2).
- **Decision**: Support weight normalization:
  `NormalizedWeight_i = Weight_i / Sum(Weights)`
  `CompositeScore = Sum( (Score_i / MaxScore_i) * NormalizedWeight_i * 10 )` (scaled to 10-point scale)
  If all `MaxScore_i` are 10, this simplifies directly to:
  `CompositeScore = Sum( Score_i * NormalizedWeight_i )`
  This makes the calculation robust against slight organizer configuration variances while matching the standard 1–10 hackathon scoring standard.

### Decision 3: Draft Handling & Aggregate Exclusion
- **Problem**: Judges often tweak scores throughout presentations. Submissions should not jump around prematurely on organizers' leaderboards.
- **Decision**: Flag evaluations with `isDraft: Boolean @default(false)`.
  - In `getProjectAggregateScore` and `getEventLeaderboard`, queries filter strictly on `where: { isDraft: false }`.
  - When saving drafts (`isDraft: true`), `compositeScore` is still calculated and stored so judges can preview their composite score, but it is excluded from public/aggregate views until finalized.

### Decision 4: Authorization Model
- **Problem**: How to verify that an authenticated user is allowed to submit evaluations for a specific event?
- **Decision**: Check `session.role` or `session.isJudge` or event organizer ownership:
  - If `session.role === "ADMIN"` or `session.role === "ORGANIZER"`, authorization passes.
  - If `session.role === "JUDGE"` or `session.isJudge === true`, authorization passes.
  - In development/mock environments, allow standard test tokens (`role === "JUDGE"` or mock judge tokens).
  - Unauthorized users receive standard `403 FORBIDDEN`.
