# Quickstart & Verification Guide: Payment Rails & QR Ph Engine (VS-21)

## 1. Running Unit Tests

Execute the payment test suite:

```bash
npx vitest run tests/unit/payments/
```

## 2. Local Browser Verification Steps

1. Navigate to an event public page, e.g. `http://localhost:3000/events/binibining-pilipinas-2026`.
2. Locate a contestant card and click the **"⚡ Boost Votes"** button.
3. In the modal:
   - Select the ₱250 Supporter tier (26 votes) or adjust the slider to 60 votes.
   - Click **"Proceed to QR Ph Checkout"**.
4. Observe the dynamic QR Ph code, 15:00 countdown timer, and banking instructions.
5. In development mode, click **"⚡ Simulate Successful Payment"**.
6. Verify:
   - Success animation plays.
   - Candidate vote count increments in real time.
   - Downloadable **Voter Receipt Card** renders with transaction reference and vote details.
