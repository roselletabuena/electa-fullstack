# Quickstart & Developer Validation Guide: Event Creation Form UI

**Feature**: `011-event-creation-form`  
**Date**: 2026-09-27

---

## 1. Automated Unit & Component Tests

Run the dedicated Vitest component tests:

```bash
npm run test -- tests/unit/events/create-event-form.test.tsx tests/unit/events/slug-availability-badge.test.tsx
```

---

## 2. Browser Verification Scenarios

1. **Unauthenticated Redirect**:
   - Navigate directly to `http://localhost:3000/events/new` in an incognito session.
   - Verify redirection to `/login?redirect=%2Fevents%2Fnew`.

2. **Auto-Slug & Live Availability**:
   - Log in as an organizer.
   - Navigate to `/events/new`.
   - In the Title field, type `"Philippine Pageant 2026"`.
   - Verify that the Slug field updates to `philippine-pageant-2026` with a green `"Slug available"` badge.
   - Type `"dashboard"` or an existing slug into the Slug field.
   - Verify that the badge turns amber/red and the "Create Event" button disables.

3. **Banner Live Aspect Preview**:
   - Paste a valid HTTPS image URL into the Banner URL input.
   - Verify that the live preview displays the image with 16:9 / 21:9 toggle.

4. **Temporal Schedule Guardrail**:
   - Set the start date and end date to the same hour.
   - Verify the inline 1-hour minimum duration error appears and blocks submission.

5. **Successful Creation & Redirect**:
   - Fill out all valid fields and click "Create Event".
   - Verify the loading spinner, success toast, and redirect to `/events/[slug]/settings`.

---

## 3. Quality Gate Checks

```bash
npm run typecheck
npm run lint
npm run format:check
```
