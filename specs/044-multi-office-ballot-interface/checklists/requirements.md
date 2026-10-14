# Requirements Quality Checklist: Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  

---

## 1. Zero-Radius Branding & Geometry

- [x] All buttons use `rounded-none`.
- [x] All cards and containers use `rounded-none`.
- [x] Modal dialogs use `rounded-none` borders.
- [x] Checkboxes and custom toggle pills use `rounded-none`.
- [x] Typography uses Outfit for headers and Sora/JetBrains Mono for body and counters.

## 2. Accessible Color Contrast (WCAG 2.1 AA)

- [x] Light Mode default background `#F8FAFC`.
- [x] Headings use `text-slate-900 dark:text-white` (>= 17:1 contrast).
- [x] Body text uses `text-slate-700 dark:text-slate-300` (>= 10:1 contrast).
- [x] Interactive badges have explicit borders and high contrast in both themes.
- [x] Warning/Limit alerts use accessible amber/rose indicators with >= 4.5:1 contrast against surface.

## 3. Keyboard & Screen Reader Accessibility

- [x] Modal manages focus and closes on `Escape` key press.
- [x] Candidates are selectable using standard `Space` and `Enter` keys.
- [x] Exceeding seat quota announces message via ARIA live region (`role="alert"`).
- [x] Candidate count badge uses `aria-live="polite"` for dynamic updates.

## 4. Multi-Office Form Validation & State

- [x] Tracks selections per `positionId`.
- [x] Enforces `minSelectionsPerVoter` and `maxSelectionsPerVoter` per position.
- [x] Review modal lists selections categorized clearly under each office name.
- [x] "Edit Selections" preserves state and returns focus to ballot.
- [x] "Confirm & Cast Ballot" calls server action and handles loading and error states.

## 5. Confirmation Receipt & Post-Vote Handling

- [x] Anonymous receipt token rendered with one-click copy button.
- [x] Voters who have already submitted receive immediate receipt or notice on page load.
- [x] Unauthenticated or ineligible voters receive clear contextual guidance.
