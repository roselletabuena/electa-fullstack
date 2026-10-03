# Technical Research: Organizer Command Center, Revenue Tracker & Payout Ledger (VS-24)

**Feature**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/023-organizer-revenue-payout-ledger/spec.md)  
**Date**: 2026-10-03  
**Status**: Completed

---

## 1. Architectural Research & Key Decisions

### Decision 1: Financial Telemetry & Aggregation Architecture

- **Context**: The organizer dashboard must present real-time Gross Sales, Gateway Fees, Electa Take-Rate (default 12%, configurable by Admin), and Net Organizer Revenue without race conditions or rounding discrepancies.
- **Decision**: Implement server-side aggregation utilities (`src/features/events/services/financial-metrics.ts`) leveraging Prisma transactions and Decimal arithmetic (`Prisma.Decimal`).
- **Calculation Engine**:
  - $\text{Gross Revenue} = \sum \text{PaymentTransaction.amountInPhp}$ where `status = PAID`.
  - $\text{Gateway Fee} = \sum f(\text{amountInPhp}, \text{paymentChannel})$:
    - `QR_PH`: $1.5\%$
    - `GCASH`: $2.0\%$
    - `MAYA`: $2.0\%$
    - `CARD`: $3.5\% + \text{₱15.00}$
    - `ONLINE_BANKING`: $2.0\%$
  - $\text{Platform Commission} = \text{Gross Revenue} \times \left(\frac{\text{event.takeRatePercentage}}{100}\right)$
  - $\text{Net Organizer Revenue} = \text{Gross Revenue} - \text{Gateway Fees} - \text{Platform Commission}$
  - $\text{Locked Balance} = \sum \text{PayoutRequest.amountInPhp}$ where `status \in [PENDING, PROCESSING, COMPLETED]`.
  - $\text{Available Payout Balance} = \text{Net Organizer Revenue} - \text{Locked Balance}$.
- **Rationale**: Decimal math prevents floating-point inaccuracies common in currency calculations. Computing gateway fees deterministically by channel ensures 100% transparency with PayMongo settlement records.
- **Alternatives Evaluated**:
  - _Client-side calculation_: Rejected due to security risks and massive client payload sizes when events accumulate tens of thousands of transactions.
  - _Periodic cron caching_: Rejected because organizers expect instant sub-second metric updates following coronation night surges.

---

### Decision 2: Exportable Audit Logs & Voter Privacy Guardrails

- **Context**: Organizers and auditors require CSV and PDF exports containing transaction details, vote allocations, and fraud logs without violating the Philippine Data Privacy Act (RA 10173).
- **Decision**:
  - Generate streaming RFC 4180 CSV files directly in Route Handlers (`/api/events/[slug]/audit-logs/export/route.ts`).
  - Render printable audit summaries using Next.js clean print media stylesheets (`@media print`) and PDF summaries.
  - Sanitize voter identification data:
    - Mask voter identifiers (e.g., `vot_***9a3b`).
    - Cryptographically hash voter IP addresses using salted SHA-256 (`createHmac("sha256", SALT).update(ip).digest("hex")`).
    - Exclude raw voter emails, phone numbers, and payment method credentials from export columns.
- **Rationale**: Eliminates doxxing liabilities while preserving complete forensic auditability for pageant organizers to verify voting surges.
- **Alternatives Evaluated**:
  - _Raw PII export_: Rejected due to statutory privacy compliance violations and risks of candidate fan harassment.

---

### Decision 3: Payout Request Lifecycle & Double-Withdrawal Protection

- **Context**: Organizers with earned net balances submit payout requests for bank transfer or GCash. The system must prevent concurrent overdraws.
- **Decision**:
  - Use Prisma interactive transactions (`db.$transaction`) with isolation to verify that `requestedAmount <= availablePayoutBalance` before creating the `PayoutRequest` record in `PENDING` status.
  - Lock the requested amount immediately from `availablePayoutBalance`.
  - Support Manual Admin Fulfillment: Electa administrators review pending requests in an internal admin view, disburse funds via bank transfer or GCash, and submit the external transaction reference to mark the record `COMPLETED`.
  - Status lifecycle:
    $$\text{PENDING} \longrightarrow \text{PROCESSING} \longrightarrow \begin{cases} \text{COMPLETED} & (\text{with disbursement ref}) \\ \text{REJECTED} & (\text{funds unlocked back to available balance}) \end{cases}$$
- **Rationale**: Guarantees zero double-withdrawal vulnerability even under rapid concurrent button clicks or distributed requests.
- **Alternatives Evaluated**:
  - _Automated third-party payout API_: Deferred to Phase 3 after establishing operational fraud review controls.

---

### Decision 4: Live Contestant Roster Controls & Reordering

- **Context**: Organizers need rapid controls to toggle visibility (`ACTIVE`, `HIDDEN`, `DISQUALIFIED`) and re-order candidate sequence numbers without navigating away from the command center.
- **Decision**:
  - Server Action `updateContestantStatusAction({ contestantId, status })` updating `Contestant.status`.
  - Server Action `reorderContestantsAction({ eventId, orderedIds })` performing an atomic update of `contestantNumber` or `displayOrder` within a Prisma transaction.
  - Immediately trigger `revalidatePath` across the event ballot, stage presentation view, and leaderboard channels.
- **Rationale**: Allows instant adjustments during live stage rehearsals with immediate reflection on voter screens.
