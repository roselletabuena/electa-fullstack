# Quickstart & Verification Guide: Disable Non-Pageant Archetypes

**Feature ID**: `047-disable-non-pageant-archetypes`  
**Jira Key**: `VS-117`  
**Date**: 2026-10-17  

---

## 1. Quick Verification via Automated Tests

Run targeted Vitest tests covering the Archetype Selector and boundary guardrails:

```bash
npx vitest run tests/unit/events/archetype-selector.test.tsx tests/unit/events/archetype-validation.test.ts tests/unit/events/create-event-service.test.ts
```

All tests should pass cleanly without regressions.

---

## 2. Interactive Manual Walkthrough

1. Start the development server (if not already running):
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000/events/new`.
3. Complete Step 1 with valid title, slug, description, banner, and dates.
4. Click **"Continue to Format & Categories"** to reach Step 2.
5. **Verify Archetype Grid**:
   - The **"Beauty Pageant"** card is highlighted with the Sky Blue border and displays the **"Selected"** checkmark badge.
   - The cards for **"Student Council Election"**, **"Hackathon / Competition"**, and **"Custom Contest"**:
     - Display a prominent amber **"COMING SOON"** pill badge in the upper right corner.
     - Display subdued styling (`opacity-60`) and `cursor-not-allowed`.
     - Clicking or pressing `Enter`/`Space` does nothing.
6. Advance to Step 3 and submit to create the pageant event successfully.

---

## 3. Direct API / Server Action Verification

Attempt submitting an event creation payload with `archetype: "STUDENT_COUNCIL"`:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Council Election 2026",
    "slug": "ssc-2026",
    "description": "Annual university council elections.",
    "bannerUrl": "https://example.com/banner.jpg",
    "startsAt": "2026-11-01T00:00:00.000Z",
    "endsAt": "2026-11-02T00:00:00.000Z",
    "archetype": "STUDENT_COUNCIL"
  }'
```

**Expected Response**:
- Status: `400 BAD_REQUEST`
- Error payload containing: `"This event archetype is coming soon and currently disabled."`
