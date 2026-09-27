# Quickstart & Validation Guide: Organizer Voting Rules & Daily Free Vote Quota Configuration

**Feature**: `005-organizer-voting-rules` | **Spec**: [spec.md](../spec.md)

---

## 1. Automated Test Execution

Run the targeted Vitest test suites for voting rules validation, server action mutations, and audit logging:

```bash
# Run unit tests for voting rules Zod schemas
npm test tests/unit/events/voting-rules-validation.test.ts

# Run unit tests for voting rules server action & audit trail creation
npm test tests/unit/events/update-voting-rules-action.test.ts
```

---

## 2. Local Manual Validation Flow

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Authenticate as Event Organizer**:
   - Navigate to `http://localhost:3000/login`.
   - Click **"Authorized Organizer (Owner)"** (authenticates as `usr_organizer_mock_01`).

3. **Navigate to Event Voting Rules Settings**:
   - Visit `http://localhost:3000/events/miss-visayas-2026/settings?tab=voting-rules`.

4. **Verify Interactive Voting Rules Form**:
   - Verify that the **Voting Rules** tab displays the **Enable Free Daily Voting** switch and the **Daily Free Vote Limit** selector (1 to 5).
   - Change the daily free quota to `3`.
   - Enter an optional reason for change: `"Increased daily free votes for preliminary week"`.
   - Click **"Save Changes"** $\rightarrow$ verify success toast notification appears and changes persist upon page refresh.

5. **Verify Free Voting Toggle & Visual Gating**:
   - Toggle **Enable Free Daily Voting** to **OFF**.
   - Observe that the daily quota selector visually dims/disables.
   - Click **"Save Changes"** $\rightarrow$ verify setting saves successfully.
   - Visit the public event page at `http://localhost:3000/events/miss-visayas-2026` $\rightarrow$ verify that free voting is disabled and voters are directed to paid boost voting options.

6. **Verify Validation Guardrails**:
   - Attempt to enter or submit a quota value outside of 1–5 (e.g. 0 or 6).
   - Verify that client-side and server-side validation reject the change with an inline error message ("Daily free vote limit must be between 1 and 5") and the previous valid state is maintained.
