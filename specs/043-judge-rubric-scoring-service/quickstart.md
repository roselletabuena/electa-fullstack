# Quickstart & Verification Guide: Multi-Criteria Judge Rubric Scoring & Aggregate Tallies Service

**Feature ID**: `043-judge-rubric-scoring-service`  
**Ticket**: [VS-114](https://the-three-devsketeers.atlassian.net/browse/VS-114)  

---

## 1. Overview & Setup

This guide details how to verify the rubric scoring engine, validation boundaries, draft handling, and aggregate leaderboard calculations.

---

## 2. Verification Scenarios

### Scenario A: Mathematical Precision Verification
Run the math unit tests to confirm floating point precision:
```bash
npx vitest run tests/unit/hackathons/rubric-math.test.ts
```
Expected: Composite scores computed across uneven weights match exact expected totals (e.g. `8.50`, `9.12`) without floating point drift.

### Scenario B: Judge Authorization Boundary Verification
Run the action auth tests:
```bash
npx vitest run tests/unit/hackathons/submit-scorecard-action.test.ts
```
Expected: Unauthenticated requests return `401 UNAUTHORIZED`. Non-judge sessions return `403 FORBIDDEN`. Verified judge sessions succeed with `200 OK`.

### Scenario C: Draft Exemption from Aggregate Leaderboard
Run the domain service tests:
```bash
npx vitest run tests/unit/hackathons/rubric-service.test.ts
```
Expected: Evaluations saved with `isDraft: true` are excluded from `getProjectAggregateScore` and `getEventLeaderboard`. Once submitted with `isDraft: false`, they are immediately reflected in aggregate tallies.

---

## 3. Automated Verification Commands

```bash
npm run typecheck
npm run lint
npm run test:unit tests/unit/hackathons/
```
