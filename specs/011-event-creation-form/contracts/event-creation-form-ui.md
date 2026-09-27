# UI Contract: Event Creation Form & Slug Verification Badges

**Route**: `/events/new`  
**Components**: `CreateEventForm`, `SlugAvailabilityBadge`, `BannerAspectPreview`

---

## 1. Slug Availability Badge Status Matrix

| Status        | Visual Appearance         | Icon           | Label / Message            |   Submit Allowed    |
| :------------ | :------------------------ | :------------- | :------------------------- | :-----------------: |
| `idle`        | Hidden or Neutral Slate   | None           | None                       |    No (if empty)    |
| `checking`    | Blue / Violet Ring & Spin | Loader2 (Spin) | "Checking availability..." |         No          |
| `available`   | Emerald Green Pill        | CheckCircle2   | "Slug available"           | Yes (if form valid) |
| `unavailable` | Rose Red Pill             | XCircle        | "Slug already in use"      |    No (Disabled)    |
| `reserved`    | Amber Yellow Pill         | AlertTriangle  | "Reserved keyword"         |    No (Disabled)    |
| `invalid`     | Rose Red Pill             | AlertCircle    | "Invalid slug format"      |    No (Disabled)    |

---

## 2. Temporal Schedule Error Display

- When `new Date(endsAt) - new Date(startsAt) < 3600000`:
  - The `endsAt` input border changes to `border-rose-500`.
  - An inline message is rendered: `"Event end time must be at least 1 hour after the start time"`.
  - The submit button is disabled.

---

## 3. Submission Flow & User Feedback

1. **User clicks "Create Event"**:
   - Submit button text changes to `"Creating Event..."` with a spinner.
   - All input controls are disabled (`isSubmitting === true`).
2. **Server Action completes successfully**:
   - Toast notification: `"Event created successfully!"`.
   - Client navigates to `/events/[slug]/settings`.
3. **Server Action returns failure**:
   - Alert banner renders at the top of the form with error details.
   - Submit button re-enables for correction.
