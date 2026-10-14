# Feature Specification: Multi-Criteria Judge Rubric Scoring & Aggregate Tallies Service

**Feature ID**: `043-judge-rubric-scoring-service`  
**Ticket**: [VS-114](https://the-three-devsketeers.atlassian.net/browse/VS-114)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Ready for Implementation  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

Hackathon evaluations differ fundamentally from public popular voting. Rather than simple vote counts or paid boosts, verified judges evaluate entries across multi-dimensional weighted rubrics (e.g., Technical Complexity 30%, Impact 30%, Innovation 20%, Presentation 20%) on a 1–10 scale accompanied by qualitative notes and constructive feedback.

This feature implements the **Multi-Criteria Judge Rubric Scoring & Aggregate Tallies Service**:
1. **Rubric Criteria Definition**: Configurable evaluation criteria with weights (summing to 100% or normalized), maximum scores (default 10), and display order per event.
2. **Judge Scorecard Submission**: Secure server action and domain service allowing verified judges to score hackathon submissions across all criteria with optional private feedback notes.
3. **Draft vs Final Submissions**: Support for iterative judging during live pitch sessions (`isDraft: true`), permitting judges to update and refine their scores before final lock (`isDraft: false`).
4. **Precision Aggregate Engine**: High-precision weighted score calculations for individual evaluations and overall submission leaderboard rankings, strictly excluding in-progress draft scores from public or organizer tallies.
5. **Strict Authorization & Integrity**: Enforce judge authorization (`isJudge: true` or `role === "JUDGE"` or authorized judge assignment) via `getSession()`, rejecting unauthorized attendees with `403 FORBIDDEN`.

---

## 2. Actors & User Stories

### User Story
> **As an** event organizer and hackathon judge,  
> **I want** a backend service to support multi-criteria 1–10 rubric evaluations with weighted criteria calculations,  
> **so that** judges can score projects systematically and aggregate rankings are computed with precision.

### Actors
- **Hackathon Judge**: Authenticated user assigned to evaluate hackathon submissions across defined rubric criteria, save draft scores during demos, and finalize scorecards.
- **Event Organizer**: Configures rubric criteria, monitors judge submission progress, and views aggregated final leaderboard rankings.
- **Downstream UI / Judge Portal (VS-115)**: Dedicated scorecard interface consuming `submitScorecardAction` and evaluation queries.

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Scorecard Submission and Weighted Calculation
- **Given** an assigned, verified judge evaluating a hackathon submission with 4 configured criteria (e.g., Technical Complexity 30%, Impact 30%, Innovation 20%, Presentation 20%)
- **When** the judge submits final scores of 8, 9, 7, and 10 with `isDraft: false`
- **Then** the rubric service computes the exact weighted composite score:
  `Composite = (8 * 0.30) + (9 * 0.30) + (7 * 0.20) + (10 * 0.20) = 2.40 + 2.70 + 1.40 + 2.00 = 8.50`
- **And** stores the `JudgeEvaluation` record with `isDraft: false`, composite score `8.50`, and individual `JudgeScore` records atomically in a database transaction,
- **And** returns a successful scorecard response with status `200 OK`.

### Scenario 2: Validation & Error Handling - Non-Judge Authorization Rejection
- **Given** an unverified user or general attendee without judge credentials attempting to submit an evaluation
- **When** the scorecard action or route executes
- **Then** the request is rejected immediately with a `403 FORBIDDEN` error envelope and message `"Unauthorized: User does not have judge privileges for this event."`,
- **And** no evaluation records are created or updated in the database.

### Scenario 3: Edge Case - Draft Save vs Final Submission Lifecycle
- **Given** a judge actively scoring a project during demo pitches
- **When** the judge submits partial or intermediate scores with `isDraft: true`
- **Then** the scores are persisted with `isDraft: true`,
- **And** the submission is excluded from public leaderboard and aggregate tally computations until submitted with `isDraft: false`,
- **And** a subsequent final submission by the same judge updates the existing evaluation idempotently without creating duplicate evaluation rows.

### Scenario 4: Validation - Boundary & Criterion Score Validation
- **Given** a scorecard submission containing a score outside the permitted range (e.g. score `< 1` or score `> 10`), or referencing invalid/unassociated criteria IDs
- **When** the submission payload is validated by Zod schemas and domain guards
- **Then** the action rejects the request with a `400 BAD_REQUEST` validation error indicating the invalid criterion or score boundary,
- **And** no database transaction is committed.

### Scenario 5: Aggregate Tallies & Leaderboard Precision
- **Given** multiple judges evaluating the same hackathon project with completed final evaluations
- **When** the aggregate tally service calculates the overall project score
- **Then** the service computes the arithmetic mean of all final judge composite scores with 2-decimal precision (e.g., Judge A: 8.50, Judge B: 9.10 -> Average: 8.80),
- **And** ranks projects in descending order of aggregate composite score.

---

## 4. Technical Scope & Architecture

- **Domain Feature Slice**: `src/features/hackathons/`
  - `services/rubric-service.ts`: Core rubric calculations, evaluation submission, draft handling, aggregate tallies, and leaderboard ranking.
  - `actions/submit-scorecard.ts`: Server action for scorecard submissions with `getSession()` auth validation and Zod payload parsing.
  - `types/rubric.ts`: TypeScript domain models, scorecard DTOs, and leaderboard interfaces.
- **Validation Layer**: `src/lib/validations/rubric.ts`
  - Zod schemas: `rubricCriterionSchema`, `criterionScoreInputSchema`, `submitScorecardSchema`, `updateRubricSchema`.
- **Database Layer**: `prisma/schema.prisma`
  - `model RubricCriterion`: id, eventId, title, description, weight, maxScore, displayOrder.
  - `model JudgeEvaluation`: id, eventId, judgeId, submissionId, isDraft, notes, compositeScore, createdAt, updatedAt.
  - `model JudgeScore`: id, evaluationId, criterionId, score.
- **Testing**: `tests/unit/hackathons/`
  - `rubric-math.test.ts`: Floating-point/Decimal precision tests for weighted composite scores and normalized weights.
  - `rubric-service.test.ts`: Evaluation submission, draft exclusion, aggregate leaderboard calculation.
  - `submit-scorecard-action.test.ts`: Auth boundary rejection, Zod validation, happy path flow.
