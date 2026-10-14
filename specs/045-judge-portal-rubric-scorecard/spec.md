# Feature Specification: Dedicated Judge Portal & Weighted Rubric Scorecard UI

**Feature ID**: `045-judge-portal-rubric-scorecard`  
**Ticket**: [VS-115](https://the-three-devsketeers.atlassian.net/browse/VS-115)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Ready for Implementation  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

During high-tempo hackathon pitch sessions and demo days (e.g., rapid 3-minute presentations), judges need a fast, distraction-free scoring console. Instead of cumbersome multi-page forms or paper rubrics, judges require a dedicated, real-time portal where they can:
1. Review all assigned hackathon project submissions for an event.
2. Track judging progress via visual progress bars and quick filter pills ("All", "Pending Review", "Completed").
3. Launch a focused rubric scorecard modal for any project.
4. Rate criteria on a tactile 1–10 segmented scale with both click/touch selection and swift single-key keyboard shortcuts (`1`–`9`, `0` for 10).
5. View real-time recalculated weighted totals with weight percentage breakdowns as scores change.
6. Record qualitative private notes/feedback for each project.
7. Save in-progress drafts safely (with resilient local state backup to prevent data loss during accidental disconnects) and submit finalized scores that feed the event leaderboard.

This feature implements the **Dedicated Judge Portal & Weighted Rubric Scorecard UI** adhering strictly to Electa's zero-radius brutalist-refined aesthetic, light mode default (`#F8FAFC`), and WCAG 2.1 AA accessibility standards.

---

## 2. Actors & User Stories

### Primary Actor
- **Verified Hackathon Judge**: Authenticated user with judge or organizer privileges assigned to evaluate submissions for a specific hackathon event.

### User Story
> **As a** verified Hackathon Judge,  
> **I want to** evaluate assigned projects using an intuitive scorecard with 1–10 criterion rating controls and private feedback fields,  
> **so that** I can assess demo day presentations efficiently and submit my scores before deliberation.

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Scorecard Input & Live Weighted Total
- **Given** a verified judge has opened the rubric scorecard modal for an assigned project
- **And** the event has configured rubric criteria (e.g., Technical Complexity 30%, Impact 30%, Innovation 20%, Presentation 20%)
- **When** the judge selects a score (1–10) for any criterion
- **Then** the composite weighted score recalculates instantly in the scorecard footer
- **And** displays each criterion's weight percentage and proportional contribution (e.g., `8/10 × 30% = 2.40`).

### Scenario 2: Validation & Error Handling - Missing Criterion Warning
- **Given** a scorecard where at least 1 required rubric criterion has not been scored
- **When** the judge clicks `"Submit Final Evaluation"`
- **Then** the form prevents submission
- **And** highlights the missing criterion in an accessible error state (`"Please assign a score between 1 and 10."`)
- **And** automatically scrolls the missing criterion into view and focuses its rating control.

### Scenario 3: Progress Tracking & Filter Controls
- **Given** a judge assigned 10 projects for an event who has finalized evaluations for 7 projects
- **When** the judge portal renders
- **Then** the judging progress bar displays `"7/10 Evaluated (70%)"` with an accessible progress indicator
- **And** provides filter pills for `"All (10)"`, `"Pending Review (3)"`, and `"Completed (7)"`
- **When** the judge selects `"Pending Review"`
- **Then** only the 3 unfinalized project cards are shown in the grid.

### Scenario 4: Keyboard Navigation & Tactile Stepper Controls
- **Given** a judge is focused on a criterion's 1–10 segmented rating control in the scorecard modal
- **When** the judge presses numeric keys `1` through `9`
- **Then** the score updates immediately to that numeric value
- **When** the judge presses `0`
- **Then** the score updates to `10`
- **And** screen readers announce the selected score and criterion name via ARIA radiogroup/slider semantics.

### Scenario 5: Draft Persistence & Local State Recovery
- **Given** a judge enters partial scores or private notes for a project
- **When** the judge clicks `"Save Draft"` or encounters an unexpected browser refresh
- **Then** the draft scores and notes are persisted locally (and synchronized via `submitScorecardAction` with `isDraft: true`)
- **And** re-opening the project scorecard restores the draft without data loss.

### Scenario 6: Authorization & Access Control
- **Given** an unauthenticated attendee or a user without judge privileges navigating to `/events/[slug]/judging`
- **When** the page renders
- **Then** the portal displays an accessible authorization guard banner or redirects with `"Unauthorized: Judge privileges required."`

---

## 4. Architectural & Design System Constraints

1. **Light Mode Default**: Base background Opal Slate-50 (`#F8FAFC`), white cards (`#FFFFFF`) with hairline slate-300 borders, high-contrast Slate-900 typography. Dark mode scoped under `dark:`.
2. **Strict Zero-Radius**: All buttons, modal dialogs, segmented buttons, input fields, and progress bars MUST have `rounded-none`.
3. **Typography**: Headings in Outfit (`font-heading`), body in Sora (`font-sans`), metrics/scores in JetBrains Mono (`font-mono`).
4. **Tailwind CSS v4**: `bg-linear-to-*`, native fraction aspect ratios, no legacy syntax.
5. **Component Colocation**: All components in `src/features/hackathons/components/` and page in `src/app/(dashboard)/events/[slug]/judging/page.tsx`.

---

## 5. Clarifications & Edge Case Resolutions

- **C1: Submission Scope**: In this phase, all submitted/active hackathon projects for the event are accessible in the judge portal. If individual assignments exist, filter to assigned items while providing an option to view all.
- **C2: Idempotent Re-evaluation**: If a judge opens an already finalized evaluation, the scorecard pre-populates with their existing scores and notes, with a clear badge indicating "Status: Evaluated", permitting revision if judging has not officially closed.
- **C3: Optional Notes**: The private feedback/notes field is strictly optional; final evaluations with empty notes are valid.
- **C4: Keyboard Controls**: When keyboard navigation is active, pressing `1` through `9` assigns scores 1–9, and `0` assigns 10. Arrow left/right can also adjust within 1–10.
- **C5: Disconnect Resilience**: In addition to server-side draft persistence via `submitScorecardAction({ isDraft: true })`, component state buffers inputs in `localStorage` under `electa_draft_eval_${eventId}_${submissionId}` so judges never lose typed comments or ratings if Wi-Fi drops.

