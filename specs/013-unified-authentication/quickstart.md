# Quickstart & Verification Guide: Electa Unified Authentication

## 1. Local Development Setup

Ensure your local `.env.local` contains standard mock auth configuration:

```bash
AUTH_PROVIDER=local
MOCK_COGNITO=true
```

---

## 2. Validation Scenarios

### Scenario A: 1-Click Quick Demo Login & Event Creation

1. Navigate to `http://localhost:3000/login`.
2. Click **"Quick Demo"** (logs in as Alex Gonzaga).
3. Verify immediate redirection to `/dashboard`.
4. Click **"Create Event"** (navigates to `/dashboard/events/new`).
5. Submit a new pageant event form.
6. Verify the event appears in `/dashboard` with `organizerId` matching the demo session.

### Scenario B: Voting Session Preservation

1. Visit a live public pageant event (e.g. `/events/miss-universe-ph-2026`).
2. Click **"Vote Free"** on a contestant.
3. If unauthenticated, sign in through the `OmnichannelAuthModal`.
4. Confirm the vote is recorded and the modal closes with success feedback.
5. In the top navigation, click **"Dashboard"** or **"Create Event"**.
6. Verify access is granted immediately without requiring a secondary login.

### Scenario C: Automated Verification Suite

Run the test and lint gates:

```bash
npm run typecheck
npm run lint
npm run test:unit
```
