# Quickstart & Verification Guide: Organizer Dashboard Theme Selector

**Feature ID**: `050-organizer-dashboard-theme-selector`  
**Ticket**: [VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)  
**Date**: 2026-10-24

---

## 1. Overview & Setup

This guide details how to verify the **Organizer Dashboard Theme Selector UI** both manually and via automated test suites.

---

## 2. Walkthrough Scenarios

### Scenario A: Theme Selection Walkthrough

1. Navigate to `/dashboard/events/[slug]/settings?tab=general` (or `/events/[slug]/settings?tab=general`).
2. Scroll to the "Visual Theme & Appearance" section.
3. Observe two theme cards: "Electa Opal (Default)" and "Pageant Editorial Haute-Couture".
4. The card matching the event's current theme shows an active checkmark/badge.
5. Click the "Pageant Editorial Haute-Couture" card.
6. **Verify**:
   - The card border highlights with active styling.
   - The "Unsaved changes" badge appears in the header.

### Scenario B: Discard Changes

1. After clicking a different theme, click the "Discard Changes" button in the form footer.
2. **Verify**:
   - The selected theme reverts to the event's saved theme.
   - The "Unsaved changes" badge disappears.

### Scenario C: Persisting Theme Changes

1. Select "Pageant Editorial Haute-Couture".
2. Click "Save Changes".
3. **Verify**:
   - A success banner appears: "Event branding updated successfully".
   - Navigating to the public event page `/events/[slug]` renders the pageant editorial theme.

---

## 3. Automated Test Suite Execution

Run the targeted test suites:

```bash
# 1. Typecheck
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit Tests
npm run test:unit tests/unit/events/dashboard/theme-selector-card.test.tsx
npm run test:unit tests/unit/events/dashboard/theme-appearance-preview.test.tsx
npm run test:unit tests/unit/events/dashboard/general-branding-form.test.tsx
npm run test:unit tests/unit/events/actions/update-event-branding.test.ts
```
