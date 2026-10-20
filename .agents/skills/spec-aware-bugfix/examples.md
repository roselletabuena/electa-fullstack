# Real-World Electa Bugfix Walkthrough Examples

This reference documents real-world bug scenarios from the Electa codebase, illustrating how to apply the 4 triage classes in practice.

---

## 📘 Scenario 1: Next.js 16 Async API Crash (Class A — Code Defect)

### 1. The Bug Report
- **Issue**: Calling `GET /api/events/evt_123/results` crashes in production with:
  ```text
  Error: Route "/api/events/[id]/results" used `params.id`. `params` should be awaited before using its properties.
  ```
- **Context**: Next.js 16 App Router migration.

### 2. Triangulation
- **Spec** (`specs/001-event-operational-window/spec.md`):
  > *"When the event results endpoint is requested with a valid event ID, return HTTP 200 with the contestant vote tallies."*
  Spec is unambiguous, correct, and aligns with architecture.
- **Code** (`src/app/api/events/[id]/results/route.ts`):
  ```ts
  // Broken code:
  export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const eventId = params.id; // ❌ Synchronous access violates Next.js 16 & Constitution §II
    ...
  }
  ```
- **Constitution**: Principle §II explicitly mandates: *"Asynchronous Next.js request APIs (`cookies()`, `headers()`, `params`, `searchParams`) MUST ALWAYS be awaited."*

### 3. Triage & Decision
- **Classification**: **Class A (Direct Code Fix)**.
- **Spec Action**: **NONE.** Do not touch `spec.md`.
- **Implementation Steps**:
  1. Write failing unit test reproducing the un-awaited param behavior.
  2. Fix route handler:
     ```ts
     export async function GET(
       request: NextRequest,
       context: { params: Promise<{ id: string }> }
     ) {
       const { id: eventId } = await context.params; // ✅ Properly awaited
       ...
     }
     ```
  3. Verify green via `npm run agent:verify:fast`.

---

## 📙 Scenario 2: Legacy Dark Mode Spec Contradicting ADR-003 (Class B — Spec Drift)

### 1. The Bug Report
- **Issue**: The Contestant Submission Form displays dark slate backgrounds and `rounded-xl` borders, failing visual QA and contrast auditing.
- **Observation**: The developer inspects the code and finds it matches `specs/002-contestant-profiles/spec.md`, which says: *"Display contestant card in dark slate theme with rounded-lg edges."*

### 2. Triangulation
- **Spec**: Explicitly asks for dark mode and rounded edges.
- **Architectural Invariants**:
  - [ADR-002](file:///docs/adr/ADR-002-strict-zero-radius-brutalist-geometry.md): Enforces strict 0px zero-radius geometry (`rounded-none`).
  - [ADR-003](file:///docs/adr/ADR-003-opal-light-mode-default-theme.md): Enforces Opal Slate-50 `#F8FAFC` light mode default with dark mode scoped under `dark:`.
- **Diagnosis**: The feature spec was drafted before ADR-002 and ADR-003 were adopted. The spec has drifted from the repository constitution.

### 3. Triage & Decision
- **Classification**: **Class B (Spec Drift / Stale Spec)**.
- **Action**: **Update Spec First**, then align code.
- **Implementation Steps**:
  1. Open `specs/002-contestant-profiles/spec.md`.
  2. Update Acceptance Criteria to mandate Opal light mode default and sharp 0px radius.
  3. Add revision note:
     ```markdown
     ### Spec Revision Note (ADR Alignment)
     - **Date**: 2026-10-20
     - **Change**: Updated card geometry to 0px sharp corners and theme to Opal Light Mode default.
     - **Rationale**: Aligns feature spec with repository ADR-002 and ADR-003.
     ```
  4. Update component classes (`card-style`, `rounded-none`, `bg-white dark:bg-slate-900`).
  5. Run `node .agents/skills/accessibility-colors/scripts/check-contrast.mjs` and Vitest suites.

---

## 📗 Scenario 3: Leaderboard Division by Zero on Fresh Event (Class C — Underspecified Boundary)

### 1. The Bug Report
- **Issue**: When an organizer opens the Realtime Leaderboard immediately after publishing an event (before any votes are cast), the contestant vote percentage renders as `NaN%` and progress bars collapse.

### 2. Triangulation
- **Spec** (`specs/019-realtime-leaderboard-mystery-freeze/spec.md`):
  Spec covers vote tallying, mystery freeze transitions, and real-time polling, but completely omits what to display when `totalVotes === 0`.
- **Code**:
  ```ts
  const percentage = (contestant.votes / totalVotes) * 100; // Returns NaN when totalVotes is 0
  ```

### 3. Triage & Decision
- **Classification**: **Class C (Underspecified Boundary Edge Case)**.
- **Action**: **Document Edge Case in Spec + Implement Defensive Handling**.
- **Implementation Steps**:
  1. Open `specs/019-realtime-leaderboard-mystery-freeze/spec.md`.
  2. Under `## Edge Cases`, append:
     ```markdown
     - **Edge Case [EC-03]**: Initial State with Zero Total Votes.
       - **Condition**: Event is live but total cast votes equal 0.
       - **Expected Behavior**: Each contestant displays `0.0%` with an empty progress bar and state label "Awaiting Initial Votes". No `NaN%` or runtime error may occur.
     ```
  3. Write unit test in `tests/unit/voting/calculate-tally.test.ts` asserting `calculateTallyPercentage(0, 0) === 0`.
  4. Implement safe calculation:
     ```ts
     export function calculateTallyPercentage(votes: number, totalVotes: number): number {
       if (totalVotes <= 0) return 0;
       return Math.round((votes / totalVotes) * 1000) / 10;
     }
     ```
  5. Verify tests pass.

---

## 📕 Scenario 4: Breaking API Schema Request (Class D — Contract Conflict)

### 1. The Bug Report
- **Issue**: A third-party integration report requests that `/api/votes` return timestamps as raw Unix milliseconds instead of ISO-8601 strings, claiming ISO strings break their custom parser.

### 2. Triangulation
- **API Contract** (`docs/api-contracts.json` and `src/app/api/contracts/route.ts`):
  Defines `createdAt` as `z.string().datetime()`. Changing this breaks all web app client hooks (`use-vote-history.ts`, date formatters, and mobile clients).
- **Constitution**: Principle §I strictly prohibits arbitrary breaking schema changes without contract versioning.

### 3. Triage & Decision
- **Classification**: **Class D (Contract Conflict / Breaking Change)**.
- **Action**: **HALT.** Do not edit code or spec.
- **Implementation Steps**:
  1. Do not unilaterally modify `src/app/api/votes/route.ts` or `spec.md`.
  2. Formulate alternatives:
     - *Option 1 (Non-breaking additive)*: Add a new optional field `createdAtUnixMs: number` while preserving `createdAt: string`.
     - *Option 2 (Header negotiation)*: Allow client to pass `Accept: application/vnd.electa.v2+json` or query param `?format=unix`.
  3. Present the options to the team/developer and proceed only after alignment.
