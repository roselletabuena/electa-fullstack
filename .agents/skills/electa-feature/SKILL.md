---
name: "electa-feature"
description: "Bootstrap a complete Electa feature from scratch — creates the complete spec directory with all canonical SpecKit artifacts (spec.md, research.md, data-model.md, contracts/, checklists/requirements.md, plan.md, quickstart.md, tasks.md), full src/features slice, API route shell, and test folder in a single command."
metadata:
  author: "Electa Engineering Team"
  version: "1.1.0"
---

# Electa Feature Bootstrap

Bootstrap a complete, convention-compliant Electa feature in one command. This is always the **first step** before running `/speckit`. It guarantees that **all 8 canonical SpecKit artifacts** are scaffolded properly.

## User Input

```text
$ARGUMENTS
```

The argument is the feature name in `kebab-case` (e.g., `voting-engine`, `contestant-profile`, `results-dashboard`).

If `$ARGUMENTS` is empty, **ERROR**: "Provide a feature name in kebab-case. Example: `/skill:vote-sphere-feature voting-engine`"

---

## Execution Steps

### Step 1 — Determine feature number

1. List all directories inside `specs/` in the workspace root.
2. For each directory, extract the leading 3-digit number prefix (e.g., `001`, `002`).
3. Find the highest number. The new feature number is `highest + 1`, zero-padded to 3 digits.
4. If `specs/` is empty or has no numbered directories, start at `001`.
5. Construct:
   - `FEATURE_NUM` = e.g., `002`
   - `FEATURE_NAME` = the kebab-case argument (e.g., `voting-engine`)
   - `SPEC_DIR` = `specs/<FEATURE_NUM>-<FEATURE_NAME>` (e.g., `specs/002-voting-engine`)
   - `FEATURE_SLUG` = `<FEATURE_NUM>-<FEATURE_NAME>`

---

### Step 2 — Create the complete spec directory with all 8 canonical artifacts

Create the following files and directories under `SPEC_DIR/`:

#### 1. `SPEC_DIR/spec.md` — Feature specification template:
```markdown
# Feature Specification: <FEATURE_NAME_TITLE_CASE>

**Feature ID**: `<FEATURE_SLUG>`
**Status**: Draft
**Created**: <TODAY_DATE>

---

## Overview

<!-- One paragraph: what this feature does and why it matters to Electa users. -->

## Actors

- **Organizer**: ...
- **Voter**: ...

## Functional Requirements

1. ...
2. ...
3. ...

## User Scenarios & Acceptance Criteria

### Scenario 1: Happy Path

**Given** ...
**When** ...
**Then** ...

## Edge Cases & Constraints

- ...

## Out of Scope

- ...

## Success Criteria

- Users can ...
- System handles ...

## Dependencies & Assumptions

- Relies on: AWS Cognito session via `getSession()`
- Relies on: Prisma singleton from `src/lib/db.ts`
- Assumes: ...
```

#### 2. `SPEC_DIR/research.md` — Pre-seeded with Electa stack decisions:
```markdown
# Research & Architecture Decisions: <FEATURE_NAME_TITLE_CASE>

**Feature**: `<FEATURE_SLUG>`
**Date**: <TODAY_DATE>

## Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                             |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)         |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`       |
| Server State  | TanStack Query — never mirror server data in Zustand                    |
| Client State  | Zustand `auth-store` for session only                                   |
| URL State     | nuqs for search params, pagination, filters                             |
| Forms         | React Hook Form + Zod (`zodResolver`)                                   |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                     |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                 |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

## Technical Decisions & Rationale

### 1. Architecture Strategy
- **Decision**: ...
- **Rationale**: ...
- **Alternatives Considered**: ...
```

#### 3. `SPEC_DIR/data-model.md` — Entity models & storage structures:
```markdown
# Data Model: <FEATURE_NAME_TITLE_CASE>

**Feature**: `<FEATURE_SLUG>`
**Date**: <TODAY_DATE>

## 1. Entities & Data Structures

<!-- Document Prisma models, DTOs, or client session storage types -->

## 2. Invariants & Validation Rules

<!-- Validation bounds, unique constraints, foreign keys -->
```

#### 4. `SPEC_DIR/contracts/` — API route & component interface contracts:
Create `SPEC_DIR/contracts/<FEATURE_NAME>.ts` containing request/response TypeScript interfaces and Zod schemas.

#### 5. `SPEC_DIR/checklists/requirements.md` — Requirements quality checklist ("Unit tests for English"):
```markdown
# Requirements Quality Checklist: <FEATURE_NAME_TITLE_CASE>

**Feature ID**: `<FEATURE_SLUG>`
**Purpose**: Requirements Quality Validation
**Created**: <TODAY_DATE>

## 1. Requirement Completeness
- [ ] **CHK001** - Are all primary user flows documented? [Completeness]
- [ ] **CHK002** - Are error and failure response structures specified? [Completeness]

## 2. Requirement Clarity & Measurability
- [ ] **CHK003** - Are numeric boundaries and performance thresholds quantified? [Clarity]

## 3. Design System & Accessibility Parity
- [ ] **CHK004** - Are strict zero-radius (`rounded-none`) rules enforced across all components? [Branding]
- [ ] **CHK005** - Does the UI guarantee WCAG 2.1 AA contrast in both Light Mode (Opal) and Dark Mode? [Accessibility]

## 4. Scenario & Edge Case Coverage
- [ ] **CHK006** - Are edge cases and unauthenticated fallback states documented? [Edge Cases]
```

#### 6. `SPEC_DIR/plan.md` — Technical implementation plan:
```markdown
# Implementation Plan: <FEATURE_NAME_TITLE_CASE>

**Feature ID**: `<FEATURE_SLUG>`

## 1. Architecture & Component Mapping
- Components: `src/features/<FEATURE_NAME>/components/`
- Hooks / Queries: `src/features/<FEATURE_NAME>/hooks/`
- Server Actions / Routes: `src/features/<FEATURE_NAME>/actions/`

## 2. Test Plan
- Unit tests under `tests/unit/<FEATURE_NAME>/`
```

#### 7. `SPEC_DIR/quickstart.md` — Verification & testing run guide:
```markdown
# Quickstart & Verification Guide: <FEATURE_NAME_TITLE_CASE>

## 1. Overview & Setup
<!-- Prerequisites and local config -->

## 2. Verification Scenarios
### Scenario A: Happy Path Walkthrough
1. Navigate to ...
2. Click ...
3. Verify ...

## 3. Automated Test Suite Execution
```bash
npm run typecheck
npm run lint
npm run test:unit tests/unit/<FEATURE_NAME>/
```
```

#### 8. `SPEC_DIR/tasks.md` — Actionable implementation tasks:
```markdown
# Implementation Tasks: <FEATURE_NAME_TITLE_CASE>

- [ ] **Task 1: Core Types & Contracts** `feat(<FEATURE_NAME>): add types and validations`
- [ ] **Task 2: Backend Services / Actions** `feat(<FEATURE_NAME>): implement server actions and API routes`
- [ ] **Task 3: UI Components & Electa Branding** `feat(<FEATURE_NAME>): build components with zero-radius Opal design system`
- [ ] **Task 4: Quality Gate & Verification** `chore(qa): verify test suite, lint, and typecheck`
```

---

### Step 3 — Create the feature slice

Create the following directory structure under `src/features/<FEATURE_NAME>/`:

```
src/features/<FEATURE_NAME>/
├── components/        ← React components scoped to this feature
├── hooks/             ← Custom hooks (use-*.ts) — TanStack Query queries live here
├── types/             ← TypeScript interfaces and Zod schemas for this feature
├── actions/           ← Next.js Server Actions (server-side mutations)
└── utils/             ← Pure utility functions for this feature
```

Place a `.gitkeep` in each empty directory so they are tracked by git.
Also create a barrel index at `src/features/<FEATURE_NAME>/index.ts`.

---

### Step 4 — Create the API route shell

Create `src/app/api/<FEATURE_NAME>/route.ts` with typed `ApiResponse<T>` envelope.

---

### Step 5 — Create the test directory

Create `tests/unit/<FEATURE_NAME>/.gitkeep`.

---

### Step 6 — Update `.specify/feature.json`

Overwrite `.specify/feature.json` with:

```json
{
  "feature_directory": "<SPEC_DIR>"
}
```

---

## Completion Report

After completing all steps, output a structured summary confirming that all 8 SpecKit artifacts have been scaffolded.
