# Feature Specification: Dedicated Event Creation Page & Real-Time Slug Validation UI

**Feature Branch**: `011-event-creation-form`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-49 could we out of scope s3 bucket upload for now? - [FE] Event Creation Form, Real-Time Slug Validation & Banner Configuration"

## Scope & Exclusions

- **In-Scope**:
  - Dedicated `/events/new` route with authentication protection and redirect to `/login?redirect=%2Fevents%2Fnew`.
  - Responsive event creation form powered by React Hook Form and Zod schema validation (`createEventSchema`).
  - Auto-generated slug from Event Title with 300ms debounced live query against `/api/events/check-slug`.
  - Visual slug availability feedback badges (Available, Unavailable/Taken, Reserved, Checking).
  - Manual slug editing toggle and customization.
  - Banner image URL input with instant aspect-ratio live preview and fallback handling.
  - Date & time scheduling inputs with client-side temporal guardrails (`endsAt >= startsAt + 1 hour`).
  - Submission state handling with loading indicators, error banners, success toasts, and redirect to the newly created event's management portal (`/events/[slug]/settings`).
- **Explicitly Out of Scope**:
  - Direct AWS S3 multipart / presigned URL binary file upload infrastructure (deferred to a dedicated media storage epic; banner configuration in this phase utilizes validated image URL input).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dedicated Event Creation Page & Protected Routing (Priority: P1)

An authenticated event organizer navigates to `/events/new` (or clicks "+ Create New Event" from the organizer dashboard). The page renders a sleek, accessible creation form allowing the organizer to enter basic competition details, set event schedules, and configure the banner. Unauthenticated visitors are intercepted and redirected to login.

**Why this priority**: Core user interface allowing organizers to initiate and provision new voting events on the platform.

**Independent Test**: Can be tested by loading `/events/new` as an authenticated user to verify form layout, and as an unauthenticated visitor to verify redirection to `/login?redirect=%2Fevents%2Fnew`.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to `/events/new`, **Then** they are redirected to `/login?redirect=%2Fevents%2Fnew`.
2. **Given** an authenticated organizer, **When** they navigate to `/events/new`, **Then** the page renders the creation header, form fields (Title, Slug, Description, Banner URL, Start Date/Time, End Date/Time), and navigation action buttons ("Cancel", "Create Event").
3. **Given** an organizer on `/events/new`, **When** they click "Cancel", **Then** the browser navigates back to `/dashboard`.

---

### User Story 2 - Debounced Slug Generation & Real-Time Availability Badge (Priority: P2)

As the organizer enters an Event Title, the form automatically generates a URL-safe slug in real-time. The UI debounces input (300ms) and checks slug availability against `/api/events/check-slug`, displaying an inline visual status badge and disabling submission if the slug is collision-prone or reserved.

**Why this priority**: Prevents URL routing conflicts and provides immediate, friction-free feedback to organizers before submission.

**Independent Test**: Can be tested by typing various titles and custom slugs (including taken and reserved slugs like `new` or `dashboard`) and observing the visual badge states and submit button disabled state.

**Acceptance Scenarios**:

1. **Given** the Title input field, **When** the organizer types "Summer Gala 2026", **Then** the Slug field auto-populates with `summer-gala-2026`.
2. **Given** an auto-generated or manually typed slug, **When** debounced check completes and the slug is unused, **Then** an inline green badge ("✓ Slug available") is displayed.
3. **Given** a slug that already exists or matches a reserved keyword (e.g. `new`, `admin`, `muph-2026`), **When** checked, **Then** an inline red badge ("✗ Slug unavailable / taken") is displayed and the submit button is disabled.
4. **Given** the Slug field, **When** the organizer edits the slug manually, **Then** auto-generation from the title is decoupled so user customizations are preserved.

---

### User Story 3 - Banner Configuration with Live Aspect Preview (Priority: P3)

The organizer provides a banner image URL for their competition. The form displays an instant, responsive live aspect-ratio preview (16:9 / 3:1 banner banner ratio) so the organizer can verify the visual framing before creating the event.

**Why this priority**: Ensures event branding meets visual standards before launch without requiring direct cloud file upload pipelines in this phase.

**Independent Test**: Can be tested by entering valid and invalid image URLs and observing the live image preview box and error handling.

**Acceptance Scenarios**:

1. **Given** a valid image URL in the Banner URL field, **When** entered, **Then** the live preview card renders the image with rounded borders and correct aspect ratio.
2. **Given** an empty or invalid URL, **When** entered, **Then** a placeholder illustration and helper copy are displayed in the preview container.

---

### User Story 4 - Schedule Temporal Guardrails & Submission Lifecycle (Priority: P4)

The organizer selects event start and end timestamps. The UI provides date/time pickers and validates in real-time that the competition duration is at least 1 hour. Upon clicking "Create Event", the form submits via Server Action, renders loading states, shows success feedback, and routes the organizer to `/events/[slug]/settings`.

**Why this priority**: Guarantees valid timeline data and smooth post-creation navigation to subsequent configuration steps (roster, rules, categories).

**Independent Test**: Can be tested by submitting valid and invalid schedule configurations and verifying submission lifecycle, error toasts, and final route redirect.

**Acceptance Scenarios**:

1. **Given** a schedule selection where `endsAt` is less than 1 hour after `startsAt` (or before `startsAt`), **When** selected, **Then** an inline warning is shown ("Event end time must be at least 1 hour after start time") and submission is prevented.
2. **Given** valid form inputs, **When** the organizer clicks "Create Event", **Then** the button shows a loading spinner and disabled state.
3. **Given** successful creation, **When** completed, **Then** a success toast is triggered and the browser redirects to `/events/[slug]/settings`.
4. **Given** a server-side failure (e.g. unexpected network error or race collision), **When** encountered, **Then** a descriptive error banner is displayed without losing previously entered form data.

---

### Edge Cases

- **Fast Typing / Rapid Slug Changes**: Active queries are cancelled/debounced so out-of-order API responses do not overwrite newer slug verification results.
- **Form Reset on Back Navigation**: Navigating away and back properly re-initializes form state or preserves draft in session where appropriate.
- **Broken Image Links**: The banner preview component handles `onError` events gracefully by displaying a fallback warning icon instead of a broken image artifact.
- **Small Screen Responsiveness**: Date pickers, preview panels, and badge rows stack vertically on mobile viewports (< 640px) without horizontal scrolling.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a dedicated page route at `/events/new` requiring an authenticated organizer session, redirecting unauthenticated visitors to `/login?redirect=%2Fevents%2Fnew`.
- **FR-002**: System MUST render an event creation form with fields: `title` (text, min 3, max 120), `slug` (text, lowercase alphanumeric + hyphens), `description` (textarea, min 10), `bannerUrl` (text URL), `startsAt` (datetime-local/picker), and `endsAt` (datetime-local/picker).
- **FR-003**: System MUST auto-generate a sanitized slug from the `title` in real-time until the organizer manually edits the slug input.
- **FR-004**: System MUST debounce slug availability checks (300ms) against `/api/events/check-slug?slug=[value]` and render visual status badges (Checking, Available, Taken/Reserved).
- **FR-005**: System MUST disable form submission while a slug check is in flight, when a slug is invalid/taken, or when client validation fails.
- **FR-006**: System MUST render a live banner preview component displaying the image provided in `bannerUrl` with fallback placeholder when empty or broken.
- **FR-007**: System MUST validate that `endsAt` is at least 1 hour after `startsAt` and display inline error feedback if violated.
- **FR-008**: System MUST submit form data to the `createEventAction` Server Action, displaying loading indicators during submission.
- **FR-009**: System MUST show a success toast and redirect to `/events/[slug]/settings` upon successful creation.
- **FR-010**: System MUST provide a "Cancel" button navigating back to `/dashboard`.

### Key Entities

- **CreateEventFormValues**: Form model matching `CreateEventInput` (`title`, `slug`, `description`, `bannerUrl`, `startsAt`, `endsAt`).
- **SlugAvailabilityState**: UI state tracking `{ status: 'idle' | 'checking' | 'available' | 'unavailable' | 'reserved', message?: string }`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Slug availability feedback renders within 150ms after the 300ms debounce window.
- **SC-002**: 100% of unauthenticated attempts to access `/events/new` are redirected with proper return URL.
- **SC-003**: 100% of invalid forms (temporal violation, duplicate slug, short description) are prevented from submitting with clear inline feedback.
- **SC-004**: Successful creation redirects to `/events/[slug]/settings` within 1.5 seconds on standard broadband.

## Assumptions

- Direct S3 bucket binary upload is explicitly out of scope for this ticket and replaced by validated banner URL input with live preview.
- Authentication uses existing Cognito session cookies and `getSession()`.
- Server-side creation and slug verification rely on the existing `/api/events/check-slug` endpoint and `createEventAction` Server Action delivered in VS-48.
