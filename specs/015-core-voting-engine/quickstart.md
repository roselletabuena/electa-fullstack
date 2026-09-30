# Quickstart & Verification Guide: Core Voting Engine, Omnichannel Auth & Anti-Fraud

**Feature**: `015-core-voting-engine`  
**Date**: 2026-10-01

---

## 1. Running Automated Tests

Run the full voting test suite including Turnstile validation and rate limiting:

```bash
npm test tests/unit/voting/
```

Run auth and session validation tests:

```bash
npm test tests/unit/auth/
```

---

## 2. Manual Verification Scenarios

### Scenario A: Frictionless Omnichannel Voter Authentication

1. Navigate to a published event page (`/events/:slug`).
2. Without logging in, click "Cast Free Vote".
3. Verify the `OmnichannelAuthModal` appears showing:
   - Google Sign-In
   - Apple Sign-In
   - Facebook Sign-In
   - Email Magic Link
   - Phone OTP (SMS/WhatsApp)
4. Authenticate and verify the dialog dismisses and the voter balance displays immediately.

### Scenario B: Cloudflare Turnstile Bot Defense

1. Open DevTools Network tab.
2. Trigger a free vote submission without a Turnstile response token.
3. Verify the submission is blocked with `BOT_DETECTION_FAILED`.
4. Submit with an active Turnstile widget and verify the vote succeeds.

### Scenario C: IP Velocity & Multi-Account Device Limit

1. Trigger 11 rapid vote submissions from the same IP within 60 seconds.
2. Confirm that requests exceeding 10 receive HTTP 429 / `RATE_LIMIT_EXCEEDED`.
3. Switch accounts on the same device and verify that attempting to exceed 3 accounts on one device triggers anti-fraud flagging.

### Scenario D: High Concurrency Atomic Transaction

1. In a test harness, send 10 concurrent requests for a voter with 1 remaining free vote.
2. Confirm that exactly 1 request returns HTTP 200 / success and 9 return `DAILY_QUOTA_EXHAUSTED`.
3. Verify that the contestant's `voteCount` increases by exactly 1.
