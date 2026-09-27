# Quickstart & Verification Guide: Organizer Events Overview Dashboard

**Branch**: `007-organizer-events-dashboard` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

## Automated Unit Testing

Run the test suite verifying query validation, metric calculations, and multi-tenant isolation:

```bash
npm run test:unit -- tests/unit/events/dashboard-overview.test.ts
```

Run full typecheck and linting:

```bash
npm run typecheck
npm run lint
```

---

## Manual Verification Steps

1. **Unauthenticated Redirect**:
   - Open an incognito browser tab and navigate to `http://localhost:3000/dashboard`.
   - Verify immediate redirect to `http://localhost:3000/login?redirect=%2Fdashboard`.
   - Navigate to `http://localhost:3000/events` and verify redirect to `/dashboard` (and subsequently `/login`).

2. **Metrics & Card Display**:
   - Log in as an organizer with registered events.
   - Navigate to `http://localhost:3000/dashboard`.
   - Verify the greeting header shows your name and accurate summary numbers for Total Events, Live Events, Total Candidates, and Total Votes Cast.

3. **Status Filter & Keyword Search**:
   - Click the "Live", "Drafts", or "Past" filter pills.
   - Verify visible cards filter immediately and the URL changes to `?status=PUBLISHED` etc.
   - Type in the search box to verify reactive filtering without page reload.

4. **Card Action Buttons**:
   - Click **Candidates** on an event card -> Confirm navigation to `/events/[slug]/contestants`.
   - Click **Settings** on an event card -> Confirm navigation to `/events/[slug]/settings`.
   - Click **Share Link** -> Confirm public URL is copied to clipboard with toast notification.
