---
name: "vote-sphere-feature"
description: "Bootstrap a complete VoteSphere feature from scratch — creates the spec directory, full src/features slice, API route shell, and test folder in a single command. Run this before /speckit-specify."
metadata:
  author: "VoteSphere Engineering Team"
  version: "1.0.0"
---

# VoteSphere Feature Bootstrap

Bootstrap a complete, convention-compliant VoteSphere feature in one command. This is always the **first step** before running `/skill:speckit-specify`.

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

### Step 2 — Create the spec directory

Create the following files under `SPEC_DIR/`:

**`SPEC_DIR/spec.md`** — Feature specification template pre-seeded for VoteSphere:

```markdown
# Feature Specification: <FEATURE_NAME_TITLE_CASE>

**Feature ID**: `<FEATURE_SLUG>`
**Status**: Draft
**Created**: <TODAY_DATE>

---

## Overview

<!-- One paragraph: what this feature does and why it matters to VoteSphere users. -->

## Actors

<!-- Who interacts with this feature? (e.g., Organizer, Voter, Public Visitor) -->

- **Organizer**: ...
- **Voter**: ...

## Functional Requirements

<!-- List testable, user-facing requirements. No implementation details. -->

1. ...
2. ...
3. ...

## User Scenarios & Acceptance Criteria

<!-- Numbered scenarios the feature must satisfy end-to-end. -->

### Scenario 1: Happy Path

**Given** ...
**When** ...
**Then** ...

## Edge Cases & Constraints

<!-- Boundary conditions, error states, and known limitations. -->

- ...

## Out of Scope

<!-- Explicitly list what this feature does NOT include. -->

- ...

## Success Criteria

<!-- Measurable, technology-agnostic outcomes. -->

- Users can ...
- System handles ...

## Dependencies & Assumptions

<!-- Other features or systems this relies on. -->

- Relies on: AWS Cognito session via `getSession()`
- Relies on: Prisma singleton from `src/lib/db.ts`
- Assumes: ...
```

**`SPEC_DIR/research.md`** — Pre-seeded with VoteSphere stack decisions:

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

### 1. [Decision Title]

- **Decision**: ...
- **Rationale**: ...
- **Alternatives Considered**: ...

### 2. [Decision Title]

- **Decision**: ...
- **Rationale**: ...
- **Alternatives Considered**: ...
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

Also create a barrel index at `src/features/<FEATURE_NAME>/index.ts`:

```typescript
// <FEATURE_NAME> feature — public exports
// Add named exports here as the feature is built out.
export {};
```

---

### Step 4 — Create the API route shell

Create `src/app/api/<FEATURE_NAME>/route.ts` with a typed shell:

```typescript
import type { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/get-session";
import { apiError, apiSuccess } from "@/lib/api/response";

/**
 * GET /api/<FEATURE_NAME>
 * TODO: Implement — describe what this returns
 */
export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  // TODO: implement
  return apiSuccess({ message: "<FEATURE_NAME> GET — not yet implemented" });
}

/**
 * POST /api/<FEATURE_NAME>
 * TODO: Implement — describe what this creates/updates
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  // TODO: parse body with Zod schema from src/features/<FEATURE_NAME>/types/
  const _body = await req.json();

  return apiSuccess({ message: "<FEATURE_NAME> POST — not yet implemented" });
}
```

> **Note**: The agent must replace `<FEATURE_NAME>` with the actual feature name in all file contents.

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

This ensures `speckit-plan`, `speckit-tasks`, and `speckit-implement` automatically pick up this feature.

---

### Step 7 — Create `SPEC_DIR/checklists/` directory

Create `SPEC_DIR/checklists/.gitkeep` so `speckit-specify` has a place to write its quality checklist.

---

## Completion Report

After completing all steps, output a structured summary:

```
✅ VoteSphere Feature Bootstrapped: <FEATURE_SLUG>

📁 Spec directory:
   specs/<FEATURE_SLUG>/
   ├── spec.md          ← Fill this in with /skill:speckit-specify
   ├── research.md      ← Pre-seeded with stack context
   └── checklists/

🧩 Feature slice:
   src/features/<FEATURE_NAME>/
   ├── components/
   ├── hooks/
   ├── types/
   ├── actions/
   ├── utils/
   └── index.ts

🌐 API route:
   src/app/api/<FEATURE_NAME>/route.ts

🧪 Test directory:
   tests/unit/<FEATURE_NAME>/

🔗 .specify/feature.json updated → downstream speckit commands are ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ Next step: /skill:speckit-specify <feature description>
```

---

## Done When

- [ ] `specs/<FEATURE_SLUG>/spec.md` created with VoteSphere template
- [ ] `specs/<FEATURE_SLUG>/research.md` created pre-seeded with stack decisions
- [ ] `specs/<FEATURE_SLUG>/checklists/.gitkeep` created
- [ ] `src/features/<FEATURE_NAME>/` created with all 5 subdirectories + `index.ts`
- [ ] `src/app/api/<FEATURE_NAME>/route.ts` created with typed `ApiResponse<T>` shell
- [ ] `tests/unit/<FEATURE_NAME>/.gitkeep` created
- [ ] `.specify/feature.json` updated
- [ ] Completion report printed with next-step guidance
