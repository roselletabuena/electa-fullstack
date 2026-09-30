# Quickstart & Verification Guide: Dynamic Category Integration in Contestant Form & Public Roster Filter Bar

**Feature**: `015-dynamic-category-integration`  
**Jira**: [VS-38](https://the-three-devsketeers.atlassian.net/browse/VS-38)  
**Date**: 2026-10-01

## Prerequisites

- Node.js 20+
- Dependencies installed (`npm install`)
- Valid environment variables in `.env.local`
- A test event seeded with custom divisions (e.g., "Kids", "Teens", "Adults") and at least one award category (e.g., "People's Choice")

---

## Validation Scenarios

### Scenario 1: Dynamic Divisions in Unit Tests (Automated)

Verify that `ContestantFormModal` renders custom division options and falls back to standard enums correctly, and that `CategoryFilterBar` renders dynamic division pills matching event configuration.

```bash
npm run test -- tests/unit/contestants/contestant-form-modal.test.tsx
npm run test -- tests/unit/contestants/category-filter-bar.test.tsx
npm run test -- tests/unit/contestants/category-filter.test.ts
```

All tests must pass with zero failures.

---

### Scenario 2: Organizer Contestant Form — Custom Division Dropdown (Browser)

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Log in as an event organizer and navigate to `/events/[slug]/contestants`.
3. Click **"Add Contestant"** to open `ContestantFormModal`.
4. **Verify custom divisions**: The "Division" dropdown should display only the event's configured divisions (e.g., "Kids", "Teens", "Adults") — not the static fallback options (Female, Male, LGBTQ+, Teen).
5. Select "Kids", fill in name and upload a photo, then click **"Register Contestant"**.
6. Confirm the new candidate appears in the table with the "Kids" division badge.
7. Click **Edit** on the saved candidate — verify the dropdown pre-selects "Kids".

---

### Scenario 3: Fallback to Standard Divisions (Browser)

1. Navigate to `/events/[slug]/contestants` for an event with **no custom divisions** configured.
2. Open the contestant registration modal.
3. **Verify fallback**: The "Division" dropdown shows "Female", "Male", "LGBTQ+", "Teen" — no crash, no empty dropdown.

---

### Scenario 4: Public Roster Dynamic Division Pills (Browser)

1. Navigate to the public event page `/events/[slug]` for an event with custom divisions "Kids", "Teens", "Adults".
2. **Verify filter bar**: `CategoryFilterBar` renders pills: "All Candidates", "Kids", "Teens", "Adults".
   - Static fallbacks ("Female", "Male", etc.) must **not** appear.
3. Click the **"Kids"** pill.
   - Only candidates assigned to the "Kids" division are shown.
   - The URL updates to `?division=Kids` without a full page reload.
   - Response time must be < 50ms (instant, no network roundtrip).
4. Click **"All Candidates"** to reset — all active contestants are displayed again.

---

### Scenario 5: URL-Driven Division Pre-Selection (Browser)

1. Directly navigate to `/events/[slug]?division=Teens`.
2. **Verify**: The "Teens" pill is visually active (`aria-pressed="true"`, sky-600 background) and the roster shows only Teens contestants immediately on load.

---

### Scenario 6: TypeScript Typecheck Gate

```bash
npm run typecheck
```

Must exit with zero errors. Pay special attention to:

- `ContestantFormModal.tsx` — `divisions` prop accepting `DivisionDto[] | DynamicDivisionItem[]`
- `OrganizerContestantTable.tsx` — `divisions` prop alignment with `page.tsx` output
