# Diagnostic Decision Tree & Heuristics Guide

This document provides in-depth heuristics and diagnostic patterns for determining whether a bug should be fixed in code directly, requires a specification update, or represents an uncovered edge case.

---

## 🧭 Complete Diagnostic Flowchart

```text
                                [ BUG REPORT / DEFECT ]
                                           │
                                           ▼
                   ┌───────────────────────────────────────────────┐
                   │ Q1: Is the scenario covered in spec.md?       │
                   └───────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ YES                                 │ NO
                        ▼                                     ▼
      ┌───────────────────────────────────┐ ┌───────────────────────────────────┐
      │ Q2: Does spec.md align with       │ │ Q3: Is it an unhandled operational│
      │     current ADRs, Design System,  │ │     boundary or an architecture   │
      │     and business intent?          │ │     shift / contract break?       │
      └─────────────────┬─────────────────┘ └─────────────────┬─────────────────┘
                        │                                     │
             ┌──────────┴──────────┐               ┌──────────┴──────────┐
             │ YES                 │ NO            │ BOUNDARY            │ BREAKING
             ▼                     ▼               ▼                     ▼
      ╔═════════════╗       ╔═════════════╗ ╔═════════════╗       ╔═════════════╗
      ║   CLASS A   ║       ║   CLASS B   ║ ║   CLASS C   ║       ║   CLASS D   ║
      ║ Direct Code ║       ║ Spec Drift  ║ ║ Edge Case   ║       ║ Contract    ║
      ║ Fix (TDD)   ║       ║ Update First║ ║ Expansion   ║       ║ Conflict    ║
      ╚═════════════╝       ╚═════════════╝ ╚═════════════╝       ╚═════════════╝
             │                     │               │                     │
             ▼                     ▼               ▼                     ▼
      • Do NOT edit spec    • Update spec.md• Add scenario to     • Halt edits
      • Write failing test    with rationale  spec.md Edge Cases  • Formulate trade-offs
      • Fix code minimally  • Update tests  • Write test for case • Present to developer
      • Verify green        • Update code   • Implement guard     • Await confirmation
```

---

## 🔍 Heuristic Checklist

Use these concrete indicators to distinguish between categories:

### 1. Indicators of Class A (Pure Code Defect)
- ✅ `spec.md` has an explicit acceptance criterion covering this scenario (e.g. *"When voter submits vote after event ends, return HTTP 403"*).
- ✅ The code returns HTTP 500 or allows the vote because a date comparison used `>` instead of `<`.
- ✅ The spec requirements comply with all Electa ADRs and Constitution principles.
- ✅ The issue was caused by:
  - Syntax error, inverted boolean, off-by-one index.
  - Failure to `await` asynchronous Next.js 16 APIs (`params`, `searchParams`, `cookies()`, `headers()`).
  - Missing null/undefined optional chaining.
  - Missing Tailwind CSS class or broken styling layout.

### 2. Indicators of Class B (Spec Drift / Stale Spec)
- ✅ Code was updated to satisfy a repository-wide architecture standard (e.g. ADR-003 Opal Light Mode or ADR-002 Brutalist Zero-Radius), but an older feature's `spec.md` still specifies dark mode cards or rounded corners (`rounded-lg`).
- ✅ The original specification was based on a flawed assumption that was subsequently revised in an ADR or project rule.
- ✅ The bug report is actually a formal requirement change (e.g. *"We changed the voting duration from 24h to 48h"*).
- ⚠️ **Guardrail**: Modifying a spec requires an explicit entry in `## Revision History` or a `Spec Clarification Note` detailing the justification.

### 3. Indicators of Class C (Underspecified Boundary Edge Case)
- ✅ The bug report describes a scenario that is completely absent from `spec.md`, `contracts/`, and `data-model.md`.
- ✅ Examples of boundary edge cases:
  - Event with zero contestants or zero registered voters.
  - Multiple voters casting simultaneous votes in the same millisecond (race condition).
  - AWS S3 presigned URL expiring during a large file upload chunk.
  - User with no display name or avatar.
- ✅ The fix does not alter existing API contracts; it simply adds robust, defensive error handling or fallback states.
- ⚠️ **Guardrail**: Always document the newly discovered edge case in `spec.md` under `## Edge Cases` so future maintainers understand the invariant.

### 4. Indicators of Class D (Breaking Contract / Invariant Conflict)
- 🚨 Fixing the bug would change the JSON response shape of a published route in `src/app/api/contracts/`.
- 🚨 Fixing the bug requires dropping a database table or non-nullable column in Prisma.
- 🚨 Fixing the bug violates an Electa Constitution principle (e.g., using `any`, omitting Zod validation, bypassing `@/env`).
- 🚨 The bug report asks for behavior that directly contradicts another core feature's specification.

---

## 🚫 Bug-Fixing Anti-Patterns

### Anti-Pattern 1: "The Spec Sanitizer"
- **What happens**: The agent notices the code does not match the spec. Rather than fixing the code, the agent edits `spec.md` to match the broken code's behavior, codifying a bug as an intended feature.
- **Why it is fatal**: Erodes product integrity and conceals defects from stakeholders.
- **Remedy**: Never edit `spec.md` unless the spec contradicts an approved ADR, Constitution principle, or explicit user requirement change.

### Anti-Pattern 2: "The Spec Amnesiac"
- **What happens**: The agent fixes an unhandled edge case in the code, but never updates `spec.md`.
- **Why it is fatal**: Spec drift occurs. Subsequent SpecKit convergence runs or refactorings will overlook the edge case and potentially re-introduce the bug.
- **Remedy**: Always append discovered edge cases to `spec.md` under `## Edge Cases`.

### Anti-Pattern 3: "The Mega-Patch"
- **What happens**: While fixing a small bug, the agent refactors unrelated services, changes formatting across 15 files, or rewrites components.
- **Why it is fatal**: Increases regression risk and obscures the bugfix in code reviews.
- **Remedy**: Apply surgical, minimal fixes. Follow the `atomic-commit` skill conventions.

### Anti-Pattern 4: "Naked Dark-Mode Band-Aids"
- **What happens**: Fixing a UI contrast bug by applying hardcoded `text-white` or `bg-slate-900` without light mode defaults or `dark:` scoping.
- **Why it is fatal**: Violates ADR-003 and WCAG 2.1 AA accessibility guidelines.
- **Remedy**: Always maintain dual-theme parity with Opal light mode `#F8FAFC` as the default.
