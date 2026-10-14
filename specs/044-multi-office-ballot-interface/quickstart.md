# Quickstart & Verification Guide: Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  

---

## 1. Local Development & Verification

### Running Unit Tests
```bash
npm run test:unit tests/unit/voting/multi-office-ballot.test.tsx
```

### Checking Types and Lint
```bash
npm run typecheck
npm run lint
```

## 2. Manual Verification Scenarios

### Scenario 1: Multi-Office Selection and Review
1. Navigate to `/events/univ-council-2026/ballot`.
2. Inspect the positions rendered (e.g., President: 1 seat, Vice President: 1 seat, Senator: 5 seats).
3. Select 1 President and 5 Senators.
4. Note that the live counter indicators update (e.g., "1 of 1 selected", "5 of 5 selected").
5. Click **Review Ballot**.
6. Verify the `BallotReviewModal` appears with zero-radius styling, displaying all selected candidates grouped by their office.
7. Click **Edit Selections** and verify the modal dismisses without resetting selections.

### Scenario 2: Exceeding Seat Limits
1. For an office with `maxSelections: 3`, select 3 candidates.
2. Attempt to select a 4th candidate.
3. Verify that the checkbox does NOT toggle, and an accessible message announces: "Maximum 3 candidates reached for this office."

### Scenario 3: Casting Ballot & Confirmation Receipt
1. Open the review modal and click **Confirm & Cast Ballot**.
2. Verify loading indicator displays on submit button.
3. Upon success, verify the view updates to `BallotReceiptCard`.
4. Click **Copy Receipt ID** and verify the receipt token is copied with a "Copied!" feedback state.
