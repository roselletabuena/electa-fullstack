# Phase 0 Research & Technical Decisions: Event Creation Form UI

**Feature**: `011-event-creation-form`  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Form State Management & Validation Strategy

### Decision

Use `react-hook-form` paired with `@hookform/resolvers/zod` utilizing the existing `createEventSchema` from `@/lib/validations/event`.

### Rationale

- Complies with Electa Constitution Principle I (Strict Type Safety & Boundary Validation).
- Single source of validation truth: The same Zod schema that guards the backend API (`POST /api/events` and `createEventAction`) validates the UI form fields before network submission.
- Real-time `mode: "onChange"` / `mode: "onBlur"` gives responsive feedback without full re-renders of the entire form shell.

---

## 2. Real-Time Slug Generation & Debounced Verification

### Decision

Implement auto-slug generation in `CreateEventForm`:

1. As the user enters the `title`, if the user has not manually customized the `slug` (`isCustomSlug === false`), automatically compute `sanitizeSlug(title)`.
2. As the slug value changes, debounce 300ms using a timer/hook before querying `GET /api/events/check-slug?slug=[value]`.
3. Display an inline status badge next to the slug field:
   - **Idle**: No input or valid initial state.
   - **Checking** (`loading`): Inline spinner with "Checking availability...".
   - **Available** (`success`): Green badge ("✓ Slug available").
   - **Unavailable / Taken** (`error`): Red badge ("✗ Slug already taken").
   - **Reserved** (`warning`): Amber badge ("⚠️ Reserved system keyword").
   - **Invalid** (`error`): Red badge ("✗ Invalid format").
4. Disable the submit button whenever `slugStatus !== "available"` or while checking is in flight.

### Rationale

- Eliminates submission surprises and URL collisions before the user clicks "Create Event".
- 300ms debounce prevents flooding the API with intermediate keystroke queries.

---

## 3. Banner Image Handling (Out of Scope S3 Upload)

### Decision

Direct AWS S3 multipart / presigned URL binary upload is explicitly **Out of Scope** for this phase per product direction. Instead:

1. Provide a clean, validated `bannerUrl` HTTPS input field.
2. Render the existing, accessible `BannerAspectPreview` component below the input with 16:9 / 21:9 aspect ratio toggling, loading spinner, and image error fallback.
3. Add helper copy indicating recommended dimensions (e.g. 1920x1080 or 1200x630, max 5MB).

### Rationale

- Keeps scope focused on event creation workflow and eliminates dependency on AWS S3 / IAM presigned URL infrastructure in this ticket.
- Future asset upload enhancements can drop seamlessly into the banner slot.

---

## 4. Route Protection & Navigation Lifecycle

### Decision

Place the page at `src/app/(dashboard)/events/new/page.tsx`:

1. Server Component verifies authenticated session using `getSession()`. If missing or invalid, immediately executes `redirect('/login?redirect=%2Fevents%2Fnew')`.
2. On successful submission of `createEventAction(formData)`:
   - Trigger success toast: `"Event created successfully!"`.
   - Client redirect using `router.push('/events/' + result.data.slug + '/settings')`.
3. "Cancel" button routes back to `/dashboard`.
