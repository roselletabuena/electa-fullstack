# Feature Specification: Organizer Event Branding & Public Profile Management

**Feature Branch**: `004-organizer-branding-settings`  
**Created**: 2026-09-27  
**Status**: Draft  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-33 - Allow event organizers to manage public-facing event metadata (title, description, banner image preview, and 1-click public link copy)."

---

## Clarifications

### Session 2026-09-27

- Q: Should the event slug be editable in the General Branding settings, or strictly read-only? → A: Keep slug read-only with copy link button (prevents breaking existing voter links and bookmarks).
- Q: Should the branding settings form include a "Reason for change" audit trail note? → A: Make "Reason for change" an optional field in the form for administrative context.
- Q: How should the banner aspect ratio preview be presented in the UI? → A: Default to 16:9 with an interactive pill toggle to switch to 21:9 cinematic preview.

---

## Overview

Event organizers need full creative and operational control over their competition's public profile and brand presentation. This feature transforms the baseline General Settings card into an interactive branding management interface. Organizers can customize their competition title, public description, and high-resolution banner imagery with real-time responsive aspect-ratio previews (16:9 / 21:9) and easily copy shareable public event URLs with 1-click clipboard integration. Every branding update is safely validated and recorded in immutable audit logs to safeguard competition integrity.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Organizer Updates Event Branding Metadata & Banner Imagery (Priority: P1) 🎯 MVP

An authenticated event organizer navigates to the "General" settings tab of their event dashboard to update the event title, descriptive narrative, banner artwork, and an optional administrative change note. As the organizer modifies the banner URL, a real-time preview showcases how the artwork renders across 16:9 (standard desktop/tablet) and 21:9 (cinematic/ultrawide) viewports. The event slug is presented as an immutable identifier with a dedicated copy button. Submitting the form validates inputs, persists updates to the database, logs an immutable audit trail entry (including the optional reason), and provides immediate visual feedback.

**Why this priority**: Branding and event metadata are the primary public touchpoints for audience engagement, media coverage, and sponsor exposure.

**Independent Test**: Log in as an authorized organizer, navigate to `/events/[slug]/settings?tab=general`, edit title, description, and banner URL, verify the dynamic aspect ratio preview, click "Save Changes", and verify updates persist across reloads and appear in `EventAuditLog`.

**Acceptance Scenarios**:

1. **Given** an authorized organizer on the General settings tab (`?tab=general`), **When** they edit the event title (max 100 characters) and description (max 2000 characters), optionally enter a reason for change (max 500 characters), and click "Save Changes", **Then** the updates are persisted to the database, a success toast notification appears ("Event branding updated successfully"), and the dashboard header reflects the new title.
2. **Given** an organizer enters an image URL in the Banner URL field, **When** the URL changes, **Then** the interface dynamically loads a live preview with a default 16:9 aspect ratio and an interactive pill toggle to switch to 21:9 cinematic preview before saving.
3. **Given** an organizer submits valid branding changes, **When** the update succeeds, **Then** an `EventAuditLog` record is generated containing the organizer ID, action identifier `UPDATE_BRANDING`, previous values, new values, and the optional reason note.

---

### User Story 2 - 1-Click Shareable Public Event URL Copy (Priority: P2)

An organizer wants to distribute the competition link to contestants, sponsors, and social media channels. From the General settings panel (where the slug is displayed as read-only) or the dashboard header, they click a "Copy Public Link" action button to instantly copy the full public event URL to their clipboard, complete with visual confirmation.

**Why this priority**: Frictionless distribution is vital for organizers launching campaigns and marketing voting windows.

**Independent Test**: Navigate to the settings page, click "Copy Public Link", and verify that the clipboard contains the full canonical URL (e.g., `https://domain.com/events/[slug]`) and the button temporarily changes to a checkmark icon with "Copied!".

**Acceptance Scenarios**:

1. **Given** an organizer viewing the General settings tab or dashboard header, **When** they click the "Copy Public Link" button next to the read-only event slug, **Then** the system writes the canonical public URL (`{origin}/events/{slug}`) to the system clipboard.
2. **Given** a successful clipboard copy, **When** the action completes, **Then** the button iconography transitions to a checkmark with a transient tooltip or "Copied to clipboard" feedback for 2 seconds before resetting.
3. **Given** a browser environment where the Async Clipboard API is blocked or unavailable, **When** the user clicks copy, **Then** a graceful fallback mechanism ensures the text is copied or selected for manual copy.

---

## Edge Cases

- **Broken or Unreachable Banner URL**: When an organizer inputs a URL that returns 404, invalid image format, or CORS blocking, the live preview renders a clean fallback placeholder ("Unable to load image preview") with helpful guidance without throwing client errors or freezing the form.
- **Unsaved Changes Navigation**: When an organizer modifies fields and attempts to switch tabs or navigate away without saving, a visual indicator or prompt warns of unsaved changes.
- **Concurrent Updates**: If multiple browser tabs or sessions attempt to update branding simultaneously, optimistic concurrency checks or timestamp tracking ensure last-write consistency with audit trail preservation.
- **Network Failure During Save**: When a network timeout or 500 error occurs during submission, the form remains populated with the user's edits, an error toast displays ("Failed to save changes. Please try again."), and the save button resets to its interactive state.
- **Slug Immutability Enforcement**: Attempting to manipulate or submit a changed slug in the payload is rejected by the server schema, keeping the canonical slug unchanged.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide an interactive branding configuration form inside the General Settings tab (`/events/[slug]/settings?tab=general`).
- **FR-002**: System MUST validate that event titles contain between 3 and 100 characters.
- **FR-003**: System MUST validate that event descriptions do not exceed 2000 characters.
- **FR-004**: System MUST validate that banner URLs conform to valid HTTPS URLs with image extensions or approved image CDN domains.
- **FR-005**: System MUST treat the event slug as strictly read-only within the branding settings interface to protect permanent links.
- **FR-006**: System MUST provide an optional "Reason for change" input field (maximum 500 characters) for audit trail context.
- **FR-007**: System MUST render a live preview of the banner image updating in real time as the organizer types or pastes an image URL.
- **FR-008**: System MUST default the banner preview to 16:9 with an interactive pill toggle allowing organizers to switch to 21:9 cinematic preview.
- **FR-009**: System MUST provide a "Copy Public Link" action button next to the read-only slug that copies the absolute public URL to the user's clipboard with visual confirmation.
- **FR-010**: System MUST generate an immutable `EventAuditLog` entry upon every successful branding update recording `previousVal`, `newVal`, and `reason`.
- **FR-011**: System MUST enforce server-side ownership authorization on the update action, rejecting unauthorized attempts with HTTP 403.
- **FR-012**: System MUST display toast notifications for both successful saves and error conditions.

### Key Entities

- **Event Branding**: The public visual and textual identity of an event, consisting of Title, Description, Banner URL, and Public Slug (immutable).
- **Aspect Ratio Preview**: A responsive client UI widget rendering live image simulation in 16:9 (Standard, default) and 21:9 (Cinematic Banner) dimensions via an interactive pill toggle.
- **EventAuditLog**: Immutable audit log record storing historical changes, actor identity, timestamps, previous attributes, modified attributes, and optional reason note.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can update branding metadata and see live preview feedback in under 100ms from input change.
- **SC-002**: 100% of successful branding modifications generate a corresponding `EventAuditLog` entry with previous and new values.
- **SC-003**: 1-click link copying succeeds on all modern browsers (Chrome, Safari, Firefox, Edge) in under 500ms.
- **SC-004**: Form submission and server persistence completes in under 1 second under standard network conditions.
- **SC-005**: Zero unhandled runtime exceptions or page crashes when handling malformed or unreachable image URLs.

---

## Assumptions

- Image assets are hosted externally on secure HTTPS CDNs (e.g., Unsplash, Cloudinary, AWS S3) or provided as direct URLs.
- The public event route `/events/[slug]` serves as the canonical landing page for voters and contestants.
- Organizers have an active authenticated session with verified ownership over the target event.
