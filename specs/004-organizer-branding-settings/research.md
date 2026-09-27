# Research & Technical Decisions: Organizer Event Branding & Public Profile Management

**Feature**: `004-organizer-branding-settings` | **Spec**: [spec.md](../spec.md)

---

## 1. Mutation Strategy: Next.js 16 Server Actions vs Route Handlers

### Decision

Use a typed **Next.js 16 Server Action** (`updateEventBranding`) located at `src/features/events/actions/update-event-branding.ts`.

### Rationale

- Direct integration with React Hook Form `handleSubmit` and React 19 `useTransition` / `useActionState`.
- Automatic server-side path revalidation (`revalidatePath("/events/[slug]/settings")`).
- Adheres to Constitution §II (_"Direct UI form submissions MUST use Server Actions"_).
- Type-safe return envelope `ActionResponse<Event>` containing error messages or updated entity without boilerplate fetch wrappers.

### Alternatives Considered

- _REST Route Handler (`/api/events/[slug]/branding`)_: Rejected because form submission from dashboard components is first-party UI interaction and Server Actions reduce boilerplate and provide native cache revalidation.

---

## 2. Live Banner Aspect Ratio Preview Architecture

### Decision

Implement `BannerAspectPreview.tsx` as an isolated client component driven by real-time watch values from React Hook Form, supporting **16:9** (standard desktop/hero, `aspect-video`) and **21:9** (cinematic ultra-wide, `aspect-[21/9]`) toggles.

### Rationale

- Immediate visual feedback (< 100ms) without triggering form re-renders or server roundtrips.
- Error boundary / `onError` image fallback handles broken URLs gracefully, rendering an accessible SVG placeholder and helpful hint instead of a broken image icon.
- Next.js `<Image>` or stylized `<img>` container with `object-cover` simulates production landing page cropping.

---

## 3. Audit Logging & Transaction Integrity

### Decision

Wrap the database update and audit log insertion in a Prisma interactive transaction (`db.$transaction`):

1. Fetch current `Event` record to extract `previousVal`.
2. Update `Event` with new `title`, `description`, and `bannerUrl`.
3. Create `EventAuditLog` with:
   - `eventId`: event.id
   - `action`: `"UPDATE_BRANDING"`
   - `changedBy`: session.userId
   - `previousVal`: `{ title, description, bannerUrl }`
   - `newVal`: `{ title, description, bannerUrl }`
   - `reason`: user-submitted reason or `null`

### Rationale

- Guaranteed atomicity: if audit logging fails, the event update is rolled back, preserving audit integrity.
- Provides a clean audit history for election compliance.

---

## 4. Clipboard Copy & Cross-Browser Fallback

### Decision

Implement `CopySlugButton.tsx` with `navigator.clipboard.writeText`:

- Checks `window.location.origin` to construct `{origin}/events/{slug}`.
- Displays a checkmark icon with transient "Copied!" badge for 2000ms.
- Fallback to `document.execCommand('copy')` via a hidden input field if `navigator.clipboard` is restricted by browser security policies.
