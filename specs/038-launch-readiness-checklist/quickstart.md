# Quickstart & Verification Guide: Launch Readiness Checklist

**Feature ID**: `038-launch-readiness-checklist`  
**Jira Key**: [VS-106](https://the-three-devsketeers.atlassian.net/browse/VS-106)

---

## 🚀 Overview

This guide walks through verifying the Launch Readiness Checklist widget both through automated Vitest tests and interactive browser testing.

---

## 🧪 1. Automated Verification Commands

Run the test suite and typechecks inside the worktree:

```bash
# Run unit tests
npm run test:unit tests/unit/events/launch-readiness-checklist.test.tsx

# Run full project typecheck
npm run typecheck

# Run linter
npm run lint
```

---

## 🖥️ 2. Manual Reproduction / Verification Flow

### Test Scenario A: Newly Created Draft Event

1. Log in as an organizer and navigate to `/events/new`.
2. Fill out the form and submit.
3. Observe seamless redirect to `/events/[slug]/settings`.
4. Verify:
   - No modal popups or blocking overlays appear.
   - At the top of the settings page, a zero-radius brutalist card appears titled **"Launch Readiness Checklist"**.
   - Progress shows **1 of 4 Completed (25%)**.
   - Milestone 1 (`✓ Event Profile Created`) shows completed.
   - Milestone 2 (`Set Up Divisions`), Milestone 3 (`Add Contestants`), and Milestone 4 (`Configure Voting Rules`) display actionable links.
   - Clicking `"Minimize"` collapses the checklist into a slim ~46px strip displaying the next incomplete milestone inline; clicking `"Expand"` restores the cards.

### Test Scenario B: Direct Navigation to Milestones

1. Click `"Set Up Divisions"` -> navigates to `/events/[slug]/settings?tab=categories`.
2. Click `"Add Contestants"` -> navigates to `/events/[slug]/contestants`.
3. Click `"Configure Voting Rules"` -> navigates to `/events/[slug]/settings?tab=voting-rules`.

### Test Scenario C: Event Published & Dismissal

1. Change event publication status to `PUBLISHED` (via Schedule tab).
2. Reload `/events/[slug]/settings`.
3. Verify the checklist transforms into a compact **"Ready & Live"** indicator with a `"Dismiss"` button.
4. Click `"Dismiss"` and refresh the page.
5. Verify the checklist is permanently dismissed and does not render.
