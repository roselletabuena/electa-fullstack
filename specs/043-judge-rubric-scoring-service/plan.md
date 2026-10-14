# Implementation Plan: Multi-Criteria Judge Rubric Scoring & Aggregate Tallies Service

**Feature ID**: `043-judge-rubric-scoring-service`  
**Ticket**: [VS-114](https://the-three-devsketeers.atlassian.net/browse/VS-114)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  

---

## 1. Architecture & Component Mapping

```text
src/
├── features/
│   └── hackathons/
│       ├── actions/
│       │   └── submit-scorecard.ts      <-- Server action authenticated via getSession()
│       ├── services/
│       │   └── rubric-service.ts        <-- Core calculation, submission upsert, aggregate queries
│       ├── types/
│       │   ├── rubric.ts                <-- Domain DTOs, score input/output interfaces
│       │   └── index.ts
│       └── index.ts                     <-- Vertical slice barrel export
├── lib/
│   └── validations/
│       └── rubric.ts                    <-- Zod validation schemas
prisma/
├── schema.prisma                        <-- RubricCriterion, JudgeEvaluation, JudgeScore models
└── migrations/                          <-- Safe schema migration SQL
```

---

## 2. Phased Implementation Strategy

### Phase 1: Database Foundation
- Update `prisma/schema.prisma` with `RubricCriterion`, `JudgeEvaluation`, `JudgeScore` and bidirectional relations on `Event`.
- Run safe database migration or generate client with `npx prisma generate`.

### Phase 2: Contracts, Types & Validations (TDD)
- Define `src/lib/validations/rubric.ts`.
- Define `src/features/hackathons/types/rubric.ts`.
- Write unit tests in `tests/unit/hackathons/rubric-validation.test.ts` testing bounds (1-10), UUID validation, empty scores, and edge cases.

### Phase 3: Rubric Calculation Engine & Domain Service (TDD)
- Write unit tests in `tests/unit/hackathons/rubric-math.test.ts` verifying exact weighted calculations (e.g. 4 criteria with 30%, 30%, 20%, 20% weights).
- Write domain service tests in `tests/unit/hackathons/rubric-service.test.ts` for draft vs final score exclusion, leaderboard ranking, and idempotent upserts.
- Implement `src/features/hackathons/services/rubric-service.ts`.

### Phase 4: Server Action & Auth Authorization
- Implement `src/features/hackathons/actions/submit-scorecard.ts`.
- Write tests in `tests/unit/hackathons/submit-scorecard-action.test.ts` for unauthorized non-judge rejection (403), unauthenticated rejection (401), and successful submission.

### Phase 5: Verification & Quality Gates
- Execute `npm run typecheck`, `npm run lint`, `npm run test:unit`.
- Run automated two-axis code review and 5-axis quality audit.
- Automated Pull Request creation via `pr-creator`.
