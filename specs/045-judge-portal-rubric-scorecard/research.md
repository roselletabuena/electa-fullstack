# Research & Technical Decisions: Dedicated Judge Portal & Weighted Rubric Scorecard UI

**Feature ID**: `045-judge-portal-rubric-scorecard`  
**Ticket**: [VS-115](https://the-three-devsketeers.atlassian.net/browse/VS-115)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  

---

## 1. Technical Decisions & Context

### 1.1 Tactile 1–10 Segmented Rating Controls vs Sliders
- **Decision**: Implement a segmented 10-button button group for each criterion with clear contrast states, supplemented by keyboard event listeners (`keydown` for digits 1–9 and 0 for 10).
- **Rationale**: Sliders can be inaccurate or fiddly on mobile screens or during fast 3-minute pitch sessions. Segmented buttons provide immediate one-tap/one-click feedback, clear active selection states, and direct keyboard shortcuts for high-speed evaluation.
- **Accessibility**: Employs `role="radiogroup"` with `role="radio"`, `aria-checked`, and `aria-label="Criterion: <title>, Score: <N> out of 10"`.

### 1.2 Real-time Weighted Score Calculation in Frontend
- **Decision**: Calculate the weighted score live in the client component using the exact mathematical formulation from `calculateWeightedScore` in `src/features/hackathons/services/rubric-service.ts`:
  `Composite = Sum((score_i / maxScore_i) * 10 * (weight_i / totalWeight))`
- **Rationale**: Immediate client-side calculation gives judges zero-latency feedback as they adjust criteria scores, with no network roundtrips required for previewing the composite score.

### 1.3 Dual-Layer Draft Persistence (Local State + Database)
- **Decision**: Maintain in-memory React state with optional `localStorage` keying (`electa_draft_eval_${eventId}_${submissionId}`) AND support for server-side draft persistence via `submitScorecardAction({ isDraft: true })`.
- **Rationale**: Hackathon demo venues often have spotty Wi-Fi or accidental browser tab closures. Local state buffering ensures zero lost notes or scores, and server persistence allows judges to switch devices or finalize later.

### 1.4 Component Decomposition
- **`JudgingProgressBar`**: Accessible progress indicator with evaluated count, total count, percentage completion, and segmented filter buttons (`All`, `Pending Review`, `Completed`).
- **`RubricScorecardModal`**: Accessible dialog containing project info, criteria scoring cards with 1–10 tactile buttons, private notes textarea, live footer with composite score and weight breakdown, and "Save Draft" / "Submit Final Evaluation" action buttons.
- **`JudgePortal`**: Main client container coordinating project card grid, search/filter state, active scorecard modal, and optimistic status updates upon evaluation submission.
- **`JudgeAuthGuard`**: Server-side and client-side protection ensuring only users with judge or organizer privileges can view the judging dashboard and submit scores.
