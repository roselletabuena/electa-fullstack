---
name: bugfix
description: Triages and fixes a bug using the spec-aware-bugfix skill, deciding whether to update spec.md first, fix code directly with TDD, or expand edge cases.
---

# Workflow: bugfix

Run the **`spec-aware-bugfix`** workflow to diagnose, triage, and resolve a bug while preserving specification integrity.

---

## Workflow Steps

### Step 1: Ingest Defect Report
1. Parse the user input (`$ARGUMENTS`): error logs, reproduction steps, or Jira key (e.g., `VS-120`).
2. Identify the affected domain and feature folder under `specs/` (e.g., `specs/001-event-operational-window/`).

### Step 2: Triangulate & Classify (Run `spec-aware-bugfix` Skill)
1. Evaluate the defect against the **4-Way Decision Matrix**:
   - **Class A**: Pure Code Defect (Spec is correct; fix code directly test-first).
   - **Class B**: Spec Drift / Stale Spec (Spec is outdated or violates ADR; update `spec.md` first).
   - **Class C**: Underspecified Boundary (Spec omitted edge case; document in `spec.md` + fix code).
   - **Class D**: Contract / Invariant Conflict (Breaking change or Constitution violation; halt & clarify).

### Step 3: Execute Chosen Pathway
- If **Class A**: Write failing Vitest test at seam -> apply minimal fix -> verify green.
- If **Class B**: Update `spec.md` with revision note -> update contracts/tests -> align code.
- If **Class C**: Append scenario to `spec.md` under `## Edge Cases` -> write boundary test -> implement guard.
- If **Class D**: Stop, detail trade-offs, and prompt the developer for instruction.

### Step 4: Verification & Quality Gate
Run the fast verification gate:
```bash
npm run agent:verify:fast
```

### Step 5: Deliver Structured Bugfix Report
Render the audit-ready summary:
- Triage Classification (Class A/B/C/D)
- Root Cause
- Spec Changes (if any)
- Code Changes
- Regression Test Added
- Verification Status
