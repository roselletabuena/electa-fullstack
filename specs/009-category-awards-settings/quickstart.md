# Quickstart Validation Guide: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings`
**Status**: Completed

---

## 1. Prerequisites

1. Ensure the PostgreSQL database is running (`localhost:54322`).
2. Ensure Prisma client is generated (`npx prisma generate`).
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## 2. End-to-End Manual Verification Scenarios

### Scenario 1: Tab Navigation & Routing

1. Sign in as an event organizer.
2. Navigate to `/events/[your-event-slug]/settings`.
3. Click the **"Categories & Awards"** tab in the top navigation bar.
4. **Expected**:
   - The URL updates to `/events/[your-event-slug]/settings?tab=categories`.
   - The `CategoryAwardsSettingsForm` renders with division tags, award category cards, and preset options.

---

### Scenario 2: Apply 1-Click Taxonomy Preset

1. On an event with no divisions or categories, view the **1-Click Presets** section.
2. Click the **"Beauty Pageant"** preset card.
3. **Expected**:
   - The divisions list immediately populates with _Female Category_, _Male Category_, _LGBTQ+ Category_, and _Teen Category_.
   - The award categories list populates with _People's Choice_, _Best in Evening Gown_, _Best in Swimsuit_, etc.
   - Success toast confirmation is displayed.

---

### Scenario 3: Add Custom Division & Award Category

1. In the **Divisions** section, type `"Junior Division"` into the input and click **"Add Division"**.
   - **Expected**: Division is created and displayed as an interactive badge with `0 contestants`.
2. In the **Award Tracks** section, type `"Best Director"` with voting toggle enabled and click **"Add Award"**.
   - **Expected**: Award track card appears with a green "Voting Open" badge.

---

### Scenario 4: Toggle Voting Availability

1. Find an award category in the list.
2. Flip the **Voting Status** switch to `OFF`.
   - **Expected**: Badge turns grey ("Voting Closed") and a PATCH request updates the backend immediately.
3. Refresh the page (`F5`).
   - **Expected**: The award remains in "Voting Closed" state.

---

### Scenario 5: Referential Integrity Deletion Blocker

1. Attempt to delete a division or award category that has assigned contestants (`contestantCount > 0`).
2. **Expected**:
   - Blocker modal appears stating: _"Cannot delete division with registered contestants. Reassign contestants first."_
   - Hard delete action is disabled/blocked.
3. Attempt to delete an unassigned division (`contestantCount === 0`).
4. **Expected**:
   - Confirmation dialog appears asking for confirmation.
   - Confirming removes the item immediately and updates the UI.

---

## 3. Automated Quality Gates

Run the automated test suite and static analysis:

```bash
npm run test
npm run typecheck
npm run lint
npm run format:check
```
