# Quickstart & Verification Guide: Organizer Dashboard Route & Guardrails

**Feature**: `003-organizer-dashboard-guardrails`  
**Date**: 2026-09-27

---

## Prerequisites

- Local PostgreSQL database running with Prisma migrations applied.
- Development server running via `npm run dev`.

---

## Validation Scenarios

### Scenario 1: Unauthenticated Redirect Validation

1. Open a private/incognito browser window with no session cookies.
2. Navigate directly to `http://localhost:3000/dashboard/events/miss-universe-2026/settings`.
3. **Expected Result**: Immediate redirection to `http://localhost:3000/login?redirect=%2Fdashboard%2Fevents%2Fmiss-universe-2026%2Fsettings`.

---

### Scenario 2: Unauthorized (Non-Owner) 403 Access Denial

1. Authenticate with a test account (e.g. `userId: "user_regular_999"`).
2. Attempt to navigate to `http://localhost:3000/dashboard/events/miss-universe-2026/settings` where `organizerId` is `org_12345`.
3. **Expected Result**: Page displays an HTTP 403 Forbidden Access Denied card with "You do not have administrative permissions to configure this event" and links to return safely.

---

### Scenario 3: Authorized Owner Dashboard & Tab Navigation

1. Authenticate with the event owner account (`userId: "org_12345"`).
2. Navigate to `http://localhost:3000/dashboard/events/miss-universe-2026/settings`.
3. **Expected Result**:
   - Page loads successfully with the organizer header and navigation tabs.
   - Default tab `General` is active displaying the event summary card.
   - Click `Schedule` tab -> URL updates to `?tab=schedule` and schedule summary card renders.
   - Click `Voting Rules` tab -> URL updates to `?tab=voting-rules` and voting rules summary card renders.
   - Direct navigation to `?tab=schedule` opens the schedule tab immediately.

---

## Automated Test Execution

Run the Vitest test suite for ownership guardrails and settings validation:

```bash
npm run test tests/unit/events/ownership-guard.test.ts
npm run test tests/unit/events/event-settings-validation.test.ts
```
