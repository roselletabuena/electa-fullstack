# Quickstart & Verification Guide: Event Archetype Schema & Taxonomy Models

## 1. Overview & Setup

This guide verifies the database schema, validations, and service layer for multi-archetype event modeling in Electa.

Prerequisites:
- Dependencies linked via worktree setup
- Node.js 20+

---

## 2. Verification Scenarios

### Scenario A: Archetype Validation Tests

Run the dedicated validation unit tests:
```bash
npm run test:unit tests/unit/events/archetype-validation.test.ts
```
Expected:
- Rejects non-positive `maxSelectionsPerVoter` (< 1).
- Rejects `minSelectionsPerVoter > maxSelectionsPerVoter`.
- Accepts valid student council and hackathon position definitions.
- Validates archetype enum strings.

### Scenario B: Taxonomy Service Tests

Run the taxonomy service unit tests:
```bash
npm run test:unit tests/unit/events/taxonomy-service.test.ts
```
Expected:
- Returns unified taxonomy with `archetype`, `positions`, `divisions`, and `awardCategories`.
- Persists new positions and calculates display order.
- Deletes position without cascading destructive candidate deletions (`SetNull`).
- Reorders positions atomically.

### Scenario C: Global Verification Suite

Run full typechecking, linting, and unit test suites:
```bash
npm run typecheck
npm run lint
npm run test:unit
```
