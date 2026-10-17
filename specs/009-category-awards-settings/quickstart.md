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
   - The `CategoryAwardsSettingsForm` renders with division cards, award category cards, and add controls (clean layout without presets).

---

### Scenario 2: Inline Edit Division & Award Category

1. Click the **"Edit"** action button (pencil icon) on an existing division card.
2. **Expected**:
   - The card transforms into an in-place edit form with current values pre-filled in the Name, Description, and Order fields.
   - Other Edit and Add action buttons become disabled (Concurrent Edit Guard).
3. Change the name to `"Women's Division"`, update display order, and click **"Save Changes"**.
4. **Expected**:
   - The card updates optimistically with the new name.
   - A success toast notification appears: `"Division updated successfully"`.
   - Any contestants assigned to this division retain their linkage.
5. Click **"Edit"** on an award category card, change its title to `"People's Choice Award"`, and click **"Save Changes"**.
6. **Expected**:
   - The award category card updates immediately and persists via `PATCH /api/events/[slug]/award-categories/[categoryId]`.

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
