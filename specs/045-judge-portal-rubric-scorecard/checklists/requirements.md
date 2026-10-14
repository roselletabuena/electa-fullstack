# Specification Quality Checklist: Dedicated Judge Portal & Weighted Rubric Scorecard UI

**Feature ID**: `045-judge-portal-rubric-scorecard`  
**Ticket**: [VS-115](https://the-three-devsketeers.atlassian.net/browse/VS-115)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  

---

## 1. Requirement Completeness & Traceability

- [x] **REQ-1**: Verified hackathon judges can view all assigned project submissions in a responsive grid.
- [x] **REQ-2**: The portal features a real-time progress bar displaying evaluated count, total count, and percentage completion (`7/10 Evaluated (70%)`).
- [x] **REQ-3**: Filter controls allow filtering by `"All"`, `"Pending Review"`, and `"Completed"`.
- [x] **REQ-4**: Clicking a project card or "Evaluate" button launches the dedicated rubric scorecard modal.
- [x] **REQ-5**: Scorecard modal displays criteria with tactile 1–10 segmented rating controls.
- [x] **REQ-6**: Keyboard shortcuts (`1`–`9`, `0` for 10) allow rapid single-key scoring for focused criteria.
- [x] **REQ-7**: Real-time composite score updates instantly in the footer with mathematical weight percentage breakdown.
- [x] **REQ-8**: Validation guard prevents final submission if any criterion is unassigned, scrolling to and highlighting the missing criterion.
- [x] **REQ-9**: Private notes textarea allows judges to enter constructive feedback before submission.
- [x] **REQ-10**: Support for draft saving (`isDraft: true`) with local state / localStorage fallback for network resilience.
- [x] **REQ-11**: Final evaluations invoke `submitScorecardAction({ isDraft: false })` and update portal cards optimistically.
- [x] **REQ-12**: Authorization guard ensures unauthenticated users or non-judges are prevented from accessing judging controls.

---

## 2. Branding & Design System Conformance (Electa Opal Theme)

- [x] **BRD-1 (Zero-Radius)**: Strict `rounded-none` geometry across all buttons, segmented chips, cards, modals, and progress bars. No rounded borders.
- [x] **BRD-2 (Default Light Mode)**: Default theme is Opal Slate-50 (`#F8FAFC`), crisp white cards (`#FFFFFF`) with hairline slate-300 borders. No hardcoded dark backgrounds.
- [x] **BRD-3 (Typography)**: Headings in Outfit (`font-heading`), body in Sora (`font-sans`), metrics and scores in JetBrains Mono (`font-mono`).
- [x] **BRD-4 (Tailwind CSS v4)**: Canonical v4 classes used exclusively (`bg-linear-to-*`, native fraction aspect ratios).

---

## 3. Accessibility & WCAG 2.1 AA Compliance

- [x] **A11Y-1 (Contrast Ratio)**: Minimum 4.5:1 text contrast for body text and 3:1 for large headings/UI borders in both light and dark modes.
- [x] **A11Y-2 (Segmented Rating Controls)**: Segmented 1–10 chips use proper ARIA attributes (`role="radiogroup"` / `role="radio"`, `aria-checked`, `aria-label`).
- [x] **A11Y-3 (Keyboard Focus)**: Visible focus ring (`focus-visible:ring-2 focus-visible:ring-sky-500`) on all interactive controls.
- [x] **A11Y-4 (Error Announcements)**: Missing criterion warnings use `aria-invalid="true"` and an `aria-live="polite"` error announcement.
- [x] **A11Y-5 (Modal Dialog)**: Modal dialog traps focus, handles `Escape` key close, and restores focus on close.
