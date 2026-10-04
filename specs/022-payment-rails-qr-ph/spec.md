# Feature Specification: Philippine Payment Rails & Dynamic QR Ph Engine (VS-21)

**Feature Branch**: `feature/VS-21-payment-rails-qr-ph`  
**Tracking Issue**: [VS-21]  
**Parent Epic**: [VS-18] (VoteSphere Monetization Platform)  
**Status**: In Progress

---

## 1. Executive Summary

VoteSphere enables fans and pageant supporters to purchase vote packages ("Boosts") instantly using Philippine payment rails—primarily dynamic **QR Ph** codes scannable by GCash, Maya, ShopeePay, BDO, BPI, UnionBank, GoTyme, and all BSP-compliant banking apps—along with international credit/debit card support via PayMongo and a frictionless local developer simulator.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Selecting a Vote Boost Package (Mike Cohn Format)

**As a** passionate pageant supporter  
**I want to** choose from tiered vote packages (or configure a custom vote amount via an interactive slider) with clear bonus vote incentives  
**So that** I can maximize the vote impact for my favored candidate.

#### Gherkin Scenarios

```gherkin
Scenario: Selecting a preset vote package
  Given the supporter opens the Vote Boost modal for candidate "#7 Maria Santos"
  When they select the "₱250 Tier" (25 votes + 1 bonus = 26 votes)
  Then the summary displays "Total: ₱250.00" and "Votes: 26 (including 1 bonus)"
  And the "Proceed to QR Ph Checkout" button becomes active

Scenario: Calculating custom vote bundle
  Given the supporter moves the custom slider to "60 votes"
  When the price is calculated
  Then the total is computed at ₱10/vote (₱600.00) plus applicable tiered bonus votes (+5 bonus)
  And the dynamic discount/bonus badge updates in real time
```

---

### User Story 2: Generating and Scanning Dynamic QR Ph

**As a** mobile or desktop voter  
**I want to** see a dynamic, uniquely generated QR Ph code with a countdown timer and 1-tap mobile wallet app handoff  
**So that** I can complete the payment in seconds through my preferred Philippine banking/e-wallet app.

#### Gherkin Scenarios

```gherkin
Scenario: Dynamic QR Ph generation
  Given an order is initiated for ₱100.00 (10 votes)
  When the checkout intent is created
  Then an EMVCo compliant Dynamic QR Ph code is rendered
  And a 15-minute countdown expiry timer begins
  And real-time payment status polling activates

Scenario: Mobile 1-tap wallet handoff
  Given a mobile user views the QR Ph checkout modal
  When they tap "Pay with GCash" or "Pay with Maya"
  Then the system opens the mobile payment gateway deep link for 1-tap authorization
```

---

### User Story 3: Payment Verification, Automated Vote Crediting & Digital Receipt

**As a** voter who completed payment  
**I want** my candidate's vote count to increase immediately and receive a verifiable digital receipt  
**So that** I have instant proof of my contribution without delays.

#### Gherkin Scenarios

```gherkin
Scenario: Webhook confirmation and atomic vote allocation
  Given PayMongo broadcasts a "payment.paid" webhook event with valid HMAC signature
  When the system receives the event
  Then it atomically updates the transaction status to "PAID"
  And inserts the corresponding BOOST votes into the Vote table
  And increments the candidate's total vote count in the database
  And prevents double-crediting via idempotency key checks

Scenario: Digital receipt presentation
  Given the payment is confirmed
  When the voter views the completion screen
  Then an official VoteSphere Digital Receipt is displayed
  And provides a downloadable PNG receipt proof containing the transaction reference, candidate name, vote weight, and timestamp
```

---

## 3. Pricing Tiers & Bonus Matrix

| Package Tier         | Price (PHP) | Base Votes | Bonus Votes | Total Votes | Bonus % |
| :------------------- | :---------: | :--------: | :---------: | :---------: | :-----: |
| **Starter**          |   ₱50.00    |     5      |      0      |    **5**    |   0%    |
| **Popular**          |   ₱100.00   |     10     |      0      |   **10**    |   0%    |
| **Supporter**        |   ₱250.00   |     25     |      1      |   **26**    |   +4%   |
| **Super Fan**        |   ₱500.00   |     50     |      5      |   **55**    |  +10%   |
| **Patron**           |  ₱1,000.00  |    100     |     15      |   **115**   |  +15%   |
| **Champion**         |  ₱2,500.00  |    250     |     50      |   **300**   |  +20%   |
| **Crown Sponsor**    |  ₱5,000.00  |    500     |     125     |   **625**   |  +25%   |
| **Grand Benefactor** | ₱10,000.00  |   1,000    |     300     |  **1,300**  |  +30%   |

---

## 4. Success Criteria

1. **Transaction Velocity**: Dynamic QR Ph code generated in under 1,000ms.
2. **Real-time Vote Credit**: Vote balance updated in database within 500ms of payment authorization.
3. **Idempotency Guarantee**: 100% duplicate webhook protection via transaction locking.
4. **Design Compliance**: Zero-radius geometry (`rounded-none`), Outfit headings, Sora body, JetBrains Mono tabular numbers, WCAG 2.1 AA dual-theme parity.
