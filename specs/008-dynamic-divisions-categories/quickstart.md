# Quickstart: Dynamic Divisions & Award Categories Validation Guide

**Feature**: Dynamic Divisions & Award Categories Data Model and API  
**Branch**: `008-dynamic-divisions-categories`  
**Date**: 2026-09-27

## Overview

This guide provides automated test execution and API curl verification procedures to prove the dynamic divisions and award categories data model and REST endpoints work end-to-end.

---

## 1. Prerequisites & Environment Setup

Ensure environment variables and database dependencies are ready:

```bash
# Verify environment & database connections
npm run typecheck
```

---

## 2. Automated Test Execution

Run the dedicated Vitest unit tests verifying Zod schemas, route handlers, uniqueness validation, and referential constraints:

```bash
# Run all unit tests for divisions and award categories
npx vitest run tests/unit/events/dynamic-divisions.test.ts tests/unit/events/award-categories.test.ts
```

---

## 3. End-to-End API Verification Scenarios

### Scenario A: Create Custom Competition Division

```bash
curl -X POST "http://localhost:3000/api/events/muph-2026/divisions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Miss Universe Division",
    "description": "Primary title division",
    "displayOrder": 1
  }'
```

**Expected Outcome**: Returns `201 Created` with the newly assigned division ID and properties.

---

### Scenario B: Prevent Duplicate Division Names (Event-Scoped Uniqueness)

```bash
curl -X POST "http://localhost:3000/api/events/muph-2026/divisions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Miss Universe Division",
    "displayOrder": 2
  }'
```

**Expected Outcome**: Returns `409 Conflict` stating that a division with this name already exists for the event.

---

### Scenario C: Create & Toggle Award Category

```bash
curl -X POST "http://localhost:3000/api/events/muph-2026/award-categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "People'\''s Choice",
    "description": "Public vote winner",
    "isVotingOpen": true,
    "displayOrder": 1
  }'
```

**Expected Outcome**: Returns `201 Created` with category details.

---

### Scenario D: Query Unified Event Taxonomy

```bash
curl -X GET "http://localhost:3000/api/events/muph-2026/categories"
```

**Expected Outcome**: Returns `200 OK` with `{ divisions: [...], awardCategories: [...] }` sorted by `displayOrder`.
