# Quickstart & Verification Guide: Organizer Command Center, Revenue Tracker & Payout Ledger (VS-24)

**Feature**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/023-organizer-revenue-payout-ledger/spec.md)  
**Date**: 2026-10-03  
**Status**: Ready for Verification

---

## 1. Prerequisites & Environment Setup

1. **Local Dev Server Running**:
   ```bash
   cd vote-sphere
   npm run dev
   ```
2. **Apply Database Migration**:
   ```bash
   npx prisma migrate dev --name add_payout_ledger_and_take_rate
   ```
3. **Seed Test Event with Paid Transactions**:
   Ensure the target event has confirmed `PaymentTransaction` records in `PAID` status across multiple channels (`QR_PH`, `GCASH`, `CARD`).

---

## 2. Validation Scenarios

### Scenario 1: Financial Telemetry & Real-Time Fee Transparency

1. Navigate to `http://localhost:3000/events/[slug]/revenue` as the event organizer.
2. Verify the 4 primary KPI cards:
   - **Gross Sales**: Displays total confirmed PHP from paid boosts (e.g., ₱100,000.00).
   - **Electa Take-Rate**: Displays `-₱12,000.00 (12.0%)` with a `Read-Only` badge.
   - **Gateway Processing Fees**: Displays deducted channel fees (e.g., ~₱2,000.00).
   - **Net Organizer Revenue**: Displays remaining proceeds (`Gross - Gateway Fees - Commission`).
   - **Available Payout Balance**: Displays unreserved net proceeds ready for withdrawal.

---

### Scenario 2: Admin-Only Take-Rate Configuration & Security Guardrails

1. As an event organizer, inspect the Take-Rate badge: verify no edit input or mutation button is exposed.
2. Attempt an unauthorized HTTP PATCH to `/api/events/[slug]/settings/take-rate` using an organizer session:
   - Expected: `HTTP 403 Forbidden` (`"Only platform administrators can modify the platform commission rate"`).
3. As a Platform Administrator, update `takeRatePercentage` to `10.0%`:
   - Verify the dashboard immediately reflects `-₱10,000.00 (10.0%)` and Net Revenue recalculates accurately.

---

### Scenario 3: Payout Request & Balance Locking (Double-Spending Prevention)

1. Open the "Request Payout" modal on the revenue dashboard.
2. Attempt to request an amount greater than the Available Payout Balance:
   - Expected: Form validation error: `"Requested amount exceeds available balance"`.
3. Submit a valid withdrawal for ₱25,000.00 via GCash:
   - Select `GCash`, enter Account Name ("Maria Santos"), Mobile Number ("09171234567").
   - Submit the form.
4. Verify results:
   - A new row appears in the Payout Ledger with status `PENDING` and reference `PO-YYYYMMDD-XXXX`.
   - The **Available Payout Balance** immediately decreases by ₱25,000.00.
   - Attempting to withdraw the same ₱25,000.00 again is rejected due to balance depletion.

---

### Scenario 4: Admin Payout Fulfillment & Audit Reference

1. As an Administrator, open the pending payout entry.
2. Enter the GCash / Bank reference number (e.g., `GCASH-REF-99882233`) and click "Confirm Disbursement".
3. Verify results:
   - Payout status transitions from `PENDING` to `COMPLETED`.
   - Processed timestamp and external reference appear in the organizer's ledger view.

---

### Scenario 5: Transaction Audit Log & Privacy-Safe CSV Export

1. On the Revenue page, switch to the **Audit Logs** tab.
2. Verify the table displays:
   - Transaction reference, timestamp, candidate, vote weight, gross amount, and payment method.
   - Voter identifier is masked: `vot_***...`
   - Voter IP address is hashed: 64-character SHA-256 hexadecimal string.
3. Click **"Export as CSV"**:
   - Open the downloaded `.csv` file.
   - Verify all filtered rows are present with proper RFC 4180 headers.
   - Confirm zero unmasked emails, phone numbers, or plaintext IPs are present.

---

### Scenario 6: Contestant Roster Controls & Sequence Reordering

1. Switch to the **Contestant Roster** tab in the command center.
2. Click the visibility toggle on a candidate to change status to `HIDDEN`:
   - Open public ballot `/events/[slug]`: verify the hidden candidate is no longer displayed.
3. Re-order candidate numbers or sequence:
   - Verify the new sequence is saved and reflected on live public screens.

---

## 3. Automated Test Suite Execution

Run unit and integration test suites:

```bash
npm run test:unit tests/unit/events/financial-metrics.test.ts
npm run test:unit tests/unit/events/payout-ledger.test.ts
npm run test:unit tests/unit/events/audit-log-export.test.ts
npm run test:unit tests/unit/contestants/roster-management.test.ts
```

Expected: 100% passing tests with zero TypeScript or lint errors.
