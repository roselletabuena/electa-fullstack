---
name: spec-aware-bugfix
description: Fix bugs with autonomous triage between implementation defects and spec drift. Diagnoses whether to update spec.md first, fix code directly test-first, expand edge cases, or escalate contract conflicts.
---

# Spec-Aware Bugfix Skill

The **`spec-aware-bugfix`** skill provides an autonomous, disciplined protocol for diagnosing, triaging, and resolving bugs in spec-driven codebases. It eliminates the dilemma between blind code patching and accidental spec mutation by systematically determining whether a bug originates from an **implementation defect**, **specification drift**, **uncovered boundary edge case**, or an **architectural contract conflict**.

---

## 🎯 Core Guarantees & Philosophy

1. **Specs Are Intent, Not Code Annotations**: Never alter a specification just to make a buggy implementation "pass". Spec modifications are reserved for genuine requirement evolutions, ADR alignment, or documented edge-case additions.
2. **Never Leave Specs in the Dark**: If a bug uncovers an unspecified boundary condition or failure mode, that behavior must be permanently codified in `spec.md` so the system's specification remains complete.
3. **Test-First (TDD) Seam Verification**: Every bug fix requires a failing reproduction test at the public seam before any fix is applied, guaranteeing zero regressions.
4. **Architectural & Constitutional Invariants**: Respect the Electa Constitution (§I–§VI), Architecture Decision Records (`docs/adr/`), and Design System rules (Opal light mode default, sharp zero-radius geometry) on every fix.

---

## 🧭 The 4-Way Decision Matrix

Whenever a bug is reported or detected, evaluate it against the 4 triage classes before writing a single line of code or modifying any specification:

```text
                                [ Bug Report / Defect ]
                                           │
                        Triangulate: Code vs Spec vs ADRs vs Tests
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
       [ Spec Defines Behavior ]                         [ Spec is Silent / Omits ]
                  │                                                 │
        Does Spec match ADRs?                             Is it an Edge Case or Breaking?
         ├── YES ──► Class A: Direct Code Fix              ├── EDGE CASE ──► Class C: Edge Case Expansion
         └── NO  ──► Class B: Spec Drift / Stale Spec      └── BREAKING  ──► Class D: Contract Conflict
```

### Class Summary Table

| Class | Scenario | Spec Action | Code & Test Action |
| :--- | :--- | :--- | :--- |
| **Class A: Implementation Defect** | Spec is correct, clear, and aligns with ADRs. Code deviates due to logic error, typo, unhandled promise, state leak, or styling flaw. | **DO NOT TOUCH.**<br/>Keep spec immutable. | Write red Vitest test at seam -> fix code -> verify green. |
| **Class B: Spec Drift / Stale Spec** | Code or business logic evolved intentionally, or spec violates an active ADR (e.g. ADR-002 zero-radius, ADR-003 light mode), but spec was never updated. | **UPDATE SPEC FIRST.**<br/>Add revision note & rationale in `spec.md`. | Update test assertions to match revised spec -> align code. |
| **Class C: Underspecified Boundary** | Bug occurs in an edge case never contemplated in the spec (e.g. 0 contestants, negative tally, network timeout during S3 presigned upload). | **APPEND EDGE CASE.**<br/>Add scenario under `## Edge Cases` in `spec.md`. | Write test for edge case -> implement defensive handling in code. |
| **Class D: Contract / Invariant Conflict** | Proposed fix would break public API contracts (`/api/contracts`), require destructive DB migrations, or violate Constitution (§I–§VI). | **HALT.**<br/>Do not modify. | **HALT.**<br/>Draft proposal and prompt developer for decision. |

See [decision-tree.md](decision-tree.md) for the diagnostic questionnaire and [examples.md](examples.md) for worked Electa scenarios.

---

## 🛠️ Step-by-Step Execution Workflow

### Step 1: Triangulate & Reproduce

1. **Locate Feature Artifacts**:
   - Locate the feature folder under `specs/<feature-id>-<feature-slug>/` (contains `spec.md`, `plan.md`, `contracts/`, `data-model.md`).
   - If no specific feature spec exists, consult the global architecture in `docs/adr/`, `AGENTS.md`, and `.specify/memory/constitution.md`.
2. **Examine Relevant Code & Tests**:
   - Find the implementation in `src/features/<feature>/` or `src/app/api/`.
   - Find existing tests in `tests/unit/` or colocated test suites.
3. **Reproduce the Defect**:
   - Understand the exact inputs, execution path, and unexpected output/error.

### Step 2: Diagnostic Evaluation (Determine Class A, B, C, or D)

Ask the 4 diagnostic questions:
1. **Q1: Does `spec.md` explicitly describe the expected behavior for this scenario?**
   - If *Yes* → Proceed to Q2.
   - If *No* → Proceed to Q3.
2. **Q2: Does the spec's documented behavior align with active ADRs, design system rules, and current business intent?**
   - If *Yes* → **Class A (Implementation Defect)**.
   - If *No* → **Class B (Spec Drift / Stale Spec)**.
3. **Q3: Is the unhandled scenario a normal operational boundary (empty list, network timeout, null value) or a major architectural shift?**
   - If *Normal Boundary* → **Class C (Underspecified Boundary)**.
   - If *Major Shift / Contract Breaking* → Proceed to Q4.
4. **Q4: Would fixing this issue break public API contracts (`/api/contracts`), require destructive database migration, or violate Constitutional rules (§I–§VI)?**
   - If *Yes* → **Class D (Contract / Invariant Conflict)**.
   - If *No* → **Class C (Underspecified Boundary)**.

---

### Step 3: Execution Pathways

#### 🔵 Pathway A: Direct Code Fix (Class A)
> **Rule**: DO NOT touch `spec.md` or `plan.md`. The spec is already the source of truth.

1. **Write Failing Test (Red)**:
   - Add a unit test in `tests/unit/` isolating the bug at the public seam.
   - Run `npx vitest run <test-file>` to verify the test fails with the expected error.
2. **Implement Minimal Fix (Green)**:
   - Apply the surgical fix in `src/`.
   - Obey Constitution §I (no `any`, no `!`), §II (Next.js 16 async APIs awaited: `await cookies()`, `await headers()`, `await params`), and design system rules (Opal light mode, sharp zero-radius).
3. **Verify Pass**:
   - Re-run test to ensure it turns green.

#### 🟡 Pathway B: Spec Update First (Class B)
> **Rule**: The specification is stale or erroneous. Update `spec.md` before altering code or tests.

1. **Update Specification**:
   - Open `specs/<feature>/spec.md`.
   - Update the relevant User Story or Acceptance Criteria.
   - Add an explicit revision record:
     ```markdown
     ### Spec Revision Note (Bugfix Alignment)
     - **Date**: YYYY-MM-DD
     - **Change**: Updated [Requirement/AC] from [Old Behavior] to [New Behavior].
     - **Rationale**: Aligned with ADR-003 (Opal Light Mode default) / corrected stale requirement.
     ```
2. **Update Contracts**:
   - If the API shape or parameters changed, update schemas in `specs/<feature>/contracts/` and `src/lib/validations/`.
3. **Update Tests & Code**:
   - Update existing tests to assert the newly specified behavior.
   - Implement the code changes to fulfill the updated spec.

#### 🟢 Pathway C: Edge Case Spec Expansion (Class C)
> **Rule**: Document the newly discovered boundary so future development does not re-introduce the gap.

1. **Update Specification**:
   - Open `specs/<feature>/spec.md`.
   - Under `## Edge Cases` (or `## Acceptance Criteria`), append the new scenario:
     ```markdown
     - **Edge Case [EC-XX]**: [Scenario Description, e.g. "When an event has 0 votes tallied"].
       - **Expected Handling**: [Expected Outcome, e.g. "Returns 0% with empty podium state instead of division by zero"].
     ```
2. **Write Boundary Test (Red)**:
   - Add a test in `tests/unit/` testing this edge condition.
3. **Implement Defensive Code (Green)**:
   - Implement fallback, null check, or boundary guard.

#### 🔴 Pathway D: Escalation & Contract Guard (Class D)
> **Rule**: Never unilaterally make breaking contract changes or bypass architectural invariants.

1. **Halt Code Edits**.
2. **Formulate Trade-off Analysis**:
   - Detail the defect.
   - Explain why fixing it as suggested causes a breaking change (e.g. breaks mobile client contract, requires DB column drop, violates Constitution §I).
   - Propose 2–3 viable alternatives (e.g., non-breaking backward-compatible adapter vs versioned route).
3. **Present to Developer**:
   - Ask for confirmation or guidance before proceeding.

---

### Step 4: Quality Gate Verification

Before finalizing the bugfix, execute the repository verification gates:

1. **Incremental Fast Gate**:
   ```bash
   npm run agent:verify:fast
   ```
   Runs environment checks, Prisma schema validation, TypeScript strict check (`tsc --noEmit`), ESLint, and touched Vitest tests.
2. **Targeted Vitest Check**:
   ```bash
   npx vitest related <touched-files> --run
   ```

---

### Step 5: Audit-Ready Bugfix Report

Format your response or commit notes using this structured summary:

```markdown
### 🐞 Bugfix Summary

- **Triage Classification**: Class [A / B / C / D] ([Implementation Defect / Spec Drift / Edge Case / Conflict])
- **Root Cause**: [Brief explanation of why the bug occurred]
- **Spec Changes**:
  - [None / Updated spec.md with revision note / Added Edge Case EC-XX]
- **Code Changes**:
  - [List of touched source files]
- **Regression Test**:
  - [Path to new/updated test and verified seam]
- **Verification Gate**:
  - `npm run agent:verify:fast` passed (TypeScript, ESLint, Vitest).
```
