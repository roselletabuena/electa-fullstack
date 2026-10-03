# Feature Specification: Organizer Command Center, Revenue Tracker & Payout Ledger (VS-24)

**Feature Branch**: `feature/VS-24-organizer-revenue-payout-ledger`  
**Tracking Issue**: [VS-24](https://the-three-devsketeers.atlassian.net/browse/VS-24)  
**Parent Epic**: [VS-18] (VoteSphere Monetization Platform)  
**Created**: 2026-10-03  
**Status**: Ready for Planning  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-24"

---

## 1. Executive Summary

Pageant and event organizers require a unified, transparent financial command center to monitor live revenue generation, understand fee structures, manage contestants, and disburse event earnings.

The **Organizer Command Center, Revenue Tracker & Payout Ledger** equips event organizers with a real-time financial telemetry dashboard displaying Gross Sales, Gateway Processing Fees, Electa's **Configurable Platform Take-Rate** (defaulting to 12.0%, with support for custom event/tier rates), and Net Organizer Revenue. Furthermore, it delivers verifiable, privacy-safe audit trails with one-click export (CSV / PDF), rapid contestant roster management (add, edit, hide, and re-order), and a self-service payout request system supporting direct Philippine banking and e-wallet disbursements (GCash / Maya).

---

## Clarifications

### Session 2026-10-03

- Q: How should requested payouts be fulfilled and transitioned from `PENDING` to `COMPLETED` in the payout ledger? → A: Manual Admin Fulfillment: Electa administrators review requests in an admin interface, execute disbursements via bank transfer or GCash/Maya, input the official bank/e-wallet transaction reference, and mark the ledger entry as `COMPLETED`.
- Q: How should payment gateway processing fees be deducted from transactions and accounted for in the financial dashboard? → A: Exact Provider Fee Deducted from Organizer: The actual payment provider fee per payment channel (1.5% for QR Ph, 2.0% for GCash, 2.0% for Maya, 3.5% + ₱15 for Card) is deducted from the gross transaction amount, reducing the organizer's net balance.
- Q: How should voter identity and personal information be presented in the organizer-facing transaction audit log and export files (CSV/PDF)? → A: Privacy-Preserving & Salted Hashing: Voter identifiers are masked (e.g. `vot_***8b2c`), IP addresses are stored as salted SHA-256 hashes, and no plaintext phone numbers or email addresses are exported, ensuring strict compliance with the Philippine Data Privacy Act (RA 10173).

---

## 2. User Scenarios & Testing _(mandatory)_

### User Story 1 - Real-Time Financial Telemetry & Fee Transparency (Priority: P1)

**As a** pageant organizer  
**I want** a real-time revenue telemetry dashboard breaking down gross sales, payment gateway fees, the configured platform take-rate (default 12%), and my net revenue balance  
**So that** I have instant, dispute-free financial visibility and know exactly how much net revenue my event has earned.

**Why this priority**: Without accurate financial tracking and transparent fee deduction, organizers cannot gauge campaign performance or trust the platform with paid vote boosts.

**Independent Test**: Can be tested independently by recording mock or real paid boost transactions across standard (12%) and customized take-rate configurations, verifying that the dashboard metrics instantly aggregate gross sales, calculate the dynamic take-rate, isolate gateway fees, and present the correct net balance.

#### Acceptance Scenarios:

1. **Given** an event with the default 12.0% take-rate and completed paid vote transactions totaling ₱100,000.00,  
   **When** the organizer views the financial command center,  
   **Then** the Gross Sales card displays "₱100,000.00",  
   **And** the Electa Take-Rate card displays "-₱12,000.00 (12.0%)",  
   **And** the Gateway Processing Fees card displays the deducted transaction processing costs,  
   **And** the Net Organizer Revenue card reflects the exact remaining balance available for payout.

2. **Given** an event configured with a custom partner take-rate of 10.0% and ₱100,000.00 in gross sales,  
   **When** the organizer views the dashboard,  
   **Then** the Electa Take-Rate card displays "-₱10,000.00 (10.0%)",  
   **And** the net revenue dynamically reflects the lower commission deduction.

3. **Given** a new paid boost transaction completes during an active event,  
   **When** the payment is confirmed,  
   **Then** the real-time financial summary updates without requiring a full page reload,  
   **And** the daily revenue trend chart reflects the updated hourly and daily volume.

4. **Given** an organizer filtering financial metrics by date range (e.g., "Today", "Last 7 Days", "Custom Range"),  
   **When** the filter is applied,  
   **Then** all financial metric cards and breakdowns dynamically adjust to reflect the filtered window.

5. **Given** an event organizer viewing their financial command center,  
   **When** inspecting the Electa Take-Rate section,  
   **Then** the commission rate is presented as read-only information,  
   **And** the organizer has no controls or permissions to alter the platform commission percentage.

---

### User Story 2 - Exportable Transaction & Fraud Audit Logs (Priority: P2)

**As an** event compliance auditor or pageant organizer  
**I want** to inspect and export detailed, timestamped transaction audit logs containing vote counts, payment references, and voter IP hashes  
**So that** I can verify payment authenticity, detect suspicious voting clusters, and deliver transparent reporting to stakeholders.

**Why this priority**: Beauty pageants and public awards frequently face scrutiny over vote rigging and payment disputes; exportable cryptographic audit logs provide undeniable proof of vote legitimacy.

**Independent Test**: Can be tested independently by querying transaction records with various filters (candidate, status, date) and downloading CSV and PDF summaries.

#### Acceptance Scenarios:

1. **Given** an organizer reviewing the audit log table,  
   **When** viewing vote records,  
   **Then** each entry displays the transaction reference number, exact UTC/local timestamp, candidate name, vote count, gross amount, payment channel, status, masked voter identifier (e.g., `vot_***8b2c`), and salted voter IP hash.

2. **Given** a list of 500+ transactions,  
   **When** the organizer clicks "Export as CSV",  
   **Then** a structured `.csv` file is generated containing all filtered records and column headers within 3 seconds.

3. **Given** the organizer clicks "Export Financial Summary (PDF)",  
   **When** the document is compiled,  
   **Then** a branded, printer-ready audit report is generated displaying executive financial totals, candidate-by-candidate revenue share, and audit verification metadata.

---

### User Story 3 - Self-Service Payout Ledger & Disbursement Requests (Priority: P3)

**As an** event organizer with accumulated net earnings  
**I want** to submit payout requests to my Philippine bank account or GCash/Maya e-wallet and track disbursement status in a ledger  
**So that** I can withdraw my event revenue securely with full historical accounting.

**Why this priority**: Organizers need reliable access to their proceeds to pay venue fees, production suppliers, and pageant winners.

**Independent Test**: Can be tested independently by requesting a payout against available net balance, validating payout account inputs, and inspecting ledger status progression (`PENDING` -> `PROCESSING` -> `COMPLETED`).

#### Acceptance Scenarios:

1. **Given** an organizer with ₱50,000.00 in available net balance,  
   **When** they request a payout of ₱30,000.00 specifying bank details (Bank Name, Account Name, Account Number),  
   **Then** the system creates a new payout record in `PENDING` status,  
   **And** reduces the available payout balance to ₱20,000.00,  
   **And** appends the entry to the historical payout ledger.

2. **Given** an organizer attempting to request a payout exceeding their available net balance,  
   **When** they submit the request,  
   **Then** the system rejects the submission with a clear error: "Requested amount exceeds available balance",  
   **And** prevents creation of the payout entry.

3. **Given** an existing payout request in `PENDING` or `PROCESSING` status,  
   **When** a platform administrator reviews the request, executes the fund transfer via bank or GCash/Maya, and submits the official transaction reference number in the admin portal,  
   **Then** the payout status immediately transitions to `COMPLETED`,  
   **And** the organizer's ledger updates with the completion timestamp, external disbursement reference ID, and official confirmation status.

---

### User Story 4 - Live Contestant Roster Controls & Reordering (Priority: P4)

**As an** organizer managing a live competition  
**I want** a centralized panel to quickly add, edit, toggle visibility, and re-order candidate numbers  
**So that** I can accommodate candidate withdrawals, additions, or sequence adjustments during production without technical assistance.

**Why this priority**: Production rosters frequently change during pre-pageant activities; organizers must adjust candidate order and visibility instantly without breaking voting links.

**Independent Test**: Can be tested independently by changing a candidate's number or toggling their status to "Hidden" and verifying the public ballot and leaderboard immediately reflect the change.

#### Acceptance Scenarios:

1. **Given** a contestant withdraws from the competition,  
   **When** the organizer toggles their status to "Hidden" in the management panel,  
   **Then** the contestant is immediately excluded from the public voting roster,  
   **And** existing historical votes and revenue remain preserved in the audit logs.

2. **Given** the organizer needs to adjust contestant numbers,  
   **When** they update candidate sequence numbers in the panel,  
   **Then** the roster saves the updated sequence,  
   **And** public listings and ballot order update accordingly.

---

### Edge Cases

- **Negative Net Balances**: If refunds or chargebacks occur, the ledger must prevent negative payouts and clearly flag contested transactions.
- **Concurrent Payout Submissions**: If an organizer clicks "Request Payout" multiple times simultaneously, idempotency controls must ensure only one payout record is created.
- **Zero-Sales Events**: For events with only free votes, the financial dashboard cleanly displays ₱0.00 gross sales, ₱0.00 fees, and ₱0.00 net payout without divide-by-zero or calculation crashes.
- **High-Velocity Audit Export**: Exporting 50,000+ transaction rows must stream or paginate safely without timing out or exhausting client memory.
- **Contestant Reordering Collisions**: If an organizer reassigns a candidate number to an already assigned number within the same division, the system must either swap the numbers or prompt for resolution to prevent duplicate numbers.
- **Unauthorized Take-Rate Modification**: Any client request or mutation sent by non-admin roles (such as event organizers) attempting to update `takeRatePercentage` must be strictly rejected with HTTP 403 Forbidden.

---

## 3. Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST compute and display real-time financial metrics for an event:
  - **Gross Revenue**: Sum of all confirmed paid boost transactions in PHP.
  - **Platform Commission**: Dynamically computed as `Gross Revenue × (event.takeRatePercentage / 100)` (defaulting to 12.0%, configurable per event from 0.0% to 50.0%).
  - **Gateway Processing Fees**: Sum of exact third-party transaction fees deducted per payment transaction based on channel rates (e.g. 1.5% for QR Ph, 2.0% for GCash, 2.0% for Maya, 3.5% + ₱15 for Card).
  - **Net Organizer Revenue**: Gross Revenue minus Platform Commission minus Gateway Processing Fees.
  - **Available Payout Balance**: Net Organizer Revenue minus all requested and completed payouts.
- **FR-002**: System MUST provide an interactive revenue breakdown view showing earnings by:
  - Individual contestant / candidate.
  - Payment channel (QR Ph, GCash, Maya, Credit/Debit Card).
  - Time intervals (Hourly for today, Daily for last 30 days, Total Lifetime).
- **FR-003**: System MUST record an immutable transaction audit log for every vote event (both free daily votes and paid boosts) containing:
  - Unique transaction reference.
  - Event and Contestant identifiers.
  - Timestamp in ISO-8601 with local timezone presentation.
  - Vote units awarded.
  - Gross payment amount (₱0.00 for free votes).
  - Payment rail / provider name.
  - Transaction status (`PENDING`, `PAID`, `FAILED`, `REFUNDED`).
  - Hashed voter IP address (SHA-256) for fraud detection and privacy preservation.
- **FR-004**: System MUST allow organizers to search, filter, and paginate audit logs by candidate, payment status, payment channel, and date range.
- **FR-005**: System MUST allow organizers to export audit logs to CSV and formatted printable PDF summary.
- **FR-006**: System MUST provide a Payout Request interface allowing organizers to:
  - View current Available Payout Balance.
  - Specify withdrawal amount (minimum threshold: ₱1,000.00).
  - Select disbursement destination (Philippine Bank Transfer or GCash / Maya).
  - Submit request with automated balance locking to prevent double-spending.
- **FR-007**: System MUST maintain an audit-grade Payout Ledger detailing:
  - Payout ID and tracking reference.
  - Requested amount and destination account details (masked for privacy).
  - Submission date and last status update date.
  - Payout lifecycle status (`PENDING`, `PROCESSING`, `COMPLETED`, `REJECTED`).
  - Administrative fulfillment metadata: external bank/GCash transaction reference number, fulfilling administrator identifier, and rejection notes (if applicable).
- **FR-008**: System MUST provide a Contestant Roster Management Panel within the command center allowing organizers to:
  - Add new contestants with number, name, division, and category assignments.
  - Edit contestant profiles and advocacy information.
  - Toggle candidate status (`ACTIVE`, `HIDDEN`, `DISQUALIFIED`).
  - Re-order contestant display sequences and candidate numbers.
- **FR-009**: System MUST restrict platform take-rate configuration exclusively to platform administrators (Electa Admin). Event organizers have read-only visibility into their assigned rate (default: 12.0%, valid range: 0.0% to 50.0%) and resulting fee breakdowns, and CANNOT self-alter the commission percentage.

---

### Key Entities

- **EventFinancialSummary**: Aggregated balance sheet for an event encompassing gross sales, gateway fees, configured platform take-rate (default 12%), net proceeds, disbursed amounts, and available balance.
- **VoteAuditRecord**: Verifiable, tamper-evident log linking each vote transaction with its payment reference, candidate, timestamp, vote weight, and voter IP hash.
- **PayoutRequest**: Record of an organizer's withdrawal request, encapsulating requested amount, disbursement channel details, lifecycle status, approval tracking, external disbursement reference, and fulfillment notes.
- **ContestantRosterItem**: Candidate entity with ordering sequence, display status, assigned division/categories, and accumulated vote metrics.

---

## 4. Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Financial dashboard aggregates and updates gross revenue and net balances within **1 second** of a payment confirmation.
- **SC-002**: Organizers can generate and download a CSV transaction audit export for up to 10,000 records in **under 3 seconds**.
- **SC-003**: 100% of financial calculations adhere to the exact formula: `Net Revenue = Gross Sales - Gateway Fees - (Gross Sales × (takeRatePercentage / 100))`, with default `takeRatePercentage = 12.0%`.
- **SC-004**: Payout request submission locks balance instantaneously with zero double-withdrawal race conditions.
- **SC-005**: 100% of audit log IP addresses are cryptographically hashed to guarantee compliance with voter privacy regulations.
- **SC-006**: Contestant roster updates (hiding a candidate or changing order) reflect on public ballots and live leaderboards in **under 500 milliseconds**.

---

## 5. Assumptions

- **A-001**: Gateway fees vary by payment method (e.g., QR Ph at ~1.5%–2.0%, e-wallets at ~2.0%–2.5%, credit cards at ~3.5% + ₱15); the system records actual gateway fees per transaction or applies the exact gateway fee formula.
- **A-002**: The platform take-rate defaults to 12.0% on new events and is strictly controlled and modified by platform administrators (Electa Admin). Event organizers have read-only visibility and cannot self-adjust their take-rate.
- **A-003**: Payout disbursement requests are manually fulfilled by platform administrators via bank transfer or GCash/Maya; upon release of funds, the administrator inputs the external bank/e-wallet transaction reference to transition the request to `COMPLETED`.
- **A-004**: Minimum payout request threshold is set to ₱1,000.00 to prevent micro-disbursement overhead.
- **A-005**: Voter IP addresses are never exposed in plaintext; they are transformed via a secure one-way salted cryptographic hash (`ip_hash`) for privacy compliance.
- **A-006**: Contestant profile creation and editing reuses existing contestant database schemas and media models established in prior tickets (VS-21).
