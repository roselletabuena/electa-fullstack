# Feature Specification: Smart Operational Timeline & Quick Duration Presets with Draft Recovery

**Feature ID**: `036-smart-operational-timeline`  
**Jira Key**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105)  
**Parent Epic**: [VS-102: Event Creation Experience & Organizer Onboarding Overhaul](https://the-three-devsketeers.atlassian.net/browse/VS-102)  
**Related Tickets**: [VS-103](https://the-three-devsketeers.atlassian.net/browse/VS-103) (CreateEventForm Visual Reskin)  
**Status**: In Progress  
**Created**: 2026-10-13  

---

## 🎯 Executive Summary

Competition organizers frequently configure voting windows under tight deadlines. Currently, organizers must manually configure two separate datetime-local inputs, frequently running into temporal validation errors (minimum 1-hour window) and losing lengthy entered descriptions if the page is accidentally refreshed.

This feature adds:
1. **Quick Duration Presets**: Preset duration chips (`+7 Days`, `+14 Days`, `+30 Days`) that instantly calculate and populate the voting end date based on `startsAt` while adhering to Electa zero-radius branding (`rounded-none`).
2. **Temporal Validation Warnings**: Clear inline alerts warning organizers when the voting window is under 1 hour, disabling submission until resolved.
3. **Draft Form State Recovery**: Automatic persistence of the organizer's active form inputs into `sessionStorage` (`electa:create_event_draft`), with automatic recovery upon return or refresh, a conspicuous "Draft Restored" alert with a "Clear Draft" button, and automatic cleanup upon successful submission.

---

## 👥 Actors & User Roles

- **Competition Organizer**: Configures voting timeline in seconds without repetitive date arithmetic; safely writes event copy without fear of data loss from accidental browser refreshes.
- **System Validator**: Enforces minimum 1-hour operational window and strict date formatting.
- **Accessibility & Keyboard User**: Seamlessly toggles presets via accessible keyboard controls and screen reader announcements.

---

## 📋 Functional Requirements

1. **FR-1 Quick Duration Presets**:
   - Provide clickable zero-radius chips for `+7 Days`, `+14 Days`, and `+30 Days`.
   - When a chip is clicked, compute `endsAt` by adding the selected duration to `startsAt` (using the organizer's current `startsAt` value, or default `startsAt` if empty).
   - Format `endsAt` as `YYYY-MM-DDTHH:mm` for the native `datetime-local` input.
   - Highlight the active preset chip with Electa design system styling (`bg-sky-600 text-white font-bold dark:bg-sky-500 dark:text-slate-950 rounded-none`).
   - If `endsAt` or `startsAt` is manually edited such that the interval does not match a preset, deactivate all preset chips.

2. **FR-2 Temporal Boundary Validation**:
   - The voting window between `startsAt` and `endsAt` must be strictly at least 1 hour (3600000 ms).
   - If the window is less than 1 hour or `endsAt <= startsAt`, display an inline alert: `"Event end time must be at least 1 hour after the start time."`
   - Disable the submit button while the temporal constraint is violated.

3. **FR-3 Client Session Storage Draft Recovery**:
   - Save form values (`title`, `slug`, `description`, `bannerUrl`, `startsAt`, `endsAt`) to browser `sessionStorage` key `electa:create_event_draft` upon input change.
   - On component mount, check `sessionStorage` for existing draft data:
     - If valid draft data exists and contains user input, pre-fill form fields.
     - Display a dismissible banner alerting the user: `"Draft Restored: We recovered your previous event details."`
     - Provide a `"Clear Draft"` action button on the alert that clears `sessionStorage` and resets form fields to initial defaults.
   - Upon successful event creation (`result.success === true`), remove the draft from `sessionStorage`.

4. **FR-4 Branding & Zero-Radius Geometry**:
   - All duration chips, alerts, and inputs must use `rounded-none`.
   - Preset chips unselected state: `bg-white text-slate-700 border border-slate-300 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 rounded-none`.
   - Preset chips active state: `bg-sky-600 text-white font-bold dark:bg-sky-500 dark:text-slate-950 rounded-none`.

---

## 🧪 Acceptance Criteria (Gherkin Scenarios)

### Scenario 1: Quick Duration Calculation (Happy Path)
- **Given** an organizer specifies a valid voting start date,
- **When** they click a quick duration chip (`"+7 Days"`, `"+14 Days"`, or `"+30 Days"`),
- **Then** the voting end date is automatically calculated and formatted for the `datetime-local` input,
- **And** the clicked preset chip displays active zero-radius selected styling (`bg-sky-600 text-white font-bold dark:bg-sky-500 dark:text-slate-950 rounded-none`).

### Scenario 2: Temporal Boundary Warning (Validation & Error Handling)
- **Given** an organizer manually enters an end date less than 1 hour after the start date,
- **When** the input triggers change or blur,
- **Then** an inline alert warns that the competition voting window must be at least 1 hour,
- **And** the submit action is disabled until the condition is satisfied.

### Scenario 3: Accidental Browser Refresh Recovery (Edge Case)
- **Given** an organizer has entered a title, description, and schedule,
- **When** the browser window is accidentally refreshed or navigated away from,
- **Then** returning to `/events/new` automatically recovers the input fields from `sessionStorage`,
- **And** an alert provides a `"Clear Draft"` option if they wish to start over.

### Scenario 4: Successful Submission Cleanup
- **Given** an organizer has an active draft in `sessionStorage`,
- **When** they successfully submit the form to create the event,
- **Then** the `sessionStorage` draft item is removed.

---

## ✅ Quality Gates
- Strict TypeScript 5 without `any` or `!`.
- Vitest unit tests covering date arithmetic, duration chip clicks, temporal validation, and `sessionStorage` recovery/clear.
- 100% pass on `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
- Compliance with Electa Constitution (§I–§VI) and accessibility contrast standards (WCAG 2.1 AA).
