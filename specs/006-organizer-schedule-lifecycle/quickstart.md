# Quickstart Validation Guide: Schedule & Lifecycle Settings

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Prerequisites

- Node.js 20+ installed
- PostgreSQL running with active Prisma migrations applied
- Development dependencies installed (`npm install`)

---

## 2. Automated Test Execution

Run the Vitest test suites dedicated to schedule validation and Server Actions:

```bash
# Run validation and server action unit tests
npx vitest run tests/unit/events/schedule-lifecycle-validation.test.ts
npx vitest run tests/unit/events/update-schedule-lifecycle-action.test.ts

# Run all event unit tests
npx vitest run tests/unit/events/
```

### Expected Output

All test suites should pass with 0 errors and complete branch coverage for:

- Valid `startsAt` / `endsAt` configurations.
- Rejecting `endsAt <= startsAt`.
- Rejecting short draft passphrases (< 4 characters).
- Preserving existing passphrase when unedited.
- Hashing draft passphrase with bcrypt.
- Enforcing ownership authorization.
- Writing complete `EventAuditLog` entries with before/after state snapshots.

---

## 3. End-to-End Manual Verification Scenarios

### Scenario A: Configure Voting Window Dates

1. Sign in as an event organizer.
2. Navigate to `/events/[slug]/settings?tab=schedule`.
3. Set `Voting Starts At` to tomorrow at `09:00` and `Voting Ends At` to 7 days later at `23:59`.
4. Click **Save Changes**.
5. **Verify**: Toast appears ("Schedule and lifecycle settings updated successfully"), and the operational state updates accordingly.

### Scenario B: Date Validation Error Guardrail

1. In the schedule form, set `Voting Ends At` earlier than `Voting Starts At`.
2. Attempt to save changes.
3. **Verify**: Submission is blocked, and an inline error appears under `Voting Ends At`: _"Voting end date must be after start date"_.

### Scenario C: Transition from Draft to Published

1. On an event currently in `DRAFT` status with valid operational dates, select `PUBLISHED` status.
2. Observe the confirmation modal explaining that the event will become publicly accessible.
3. Click **Confirm Publication**.
4. **Verify**: Event status badge updates to `PUBLISHED`, and opening `/events/[slug]` in an incognito window allows viewing without a draft preview passphrase.

### Scenario D: Manage Draft Review Passphrase

1. Set an event to `DRAFT` status.
2. Enter a new preview passphrase (e.g., `vip-preview-2026`) and click **Save Changes**.
3. In an incognito window, navigate to `/events/[slug]`.
4. **Verify**: The draft preview passphrase prompt appears. Entering `vip-preview-2026` unlocks access.
5. In organizer settings, click **Remove Passphrase** and save.
6. **Verify**: Incognito access now requires organizer sign-in.
