# Feature Specification: Reusable Image Upload & Dropzone Component

**Feature Branch**: `feature/VS-45-reusable-image-dropzone`  
**Tracking Issue**: [VS-45](https://the-three-devsketeers.atlassian.net/browse/VS-45)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  
**Created**: 2026-10-07  
**Status**: Ready for Clarification / Planning  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-45: [FE] 1.1 Reusable Image Upload & Dropzone Component"

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Drag-and-Drop Image Upload with Direct S3 Transfer (Priority: P1) 🎯 MVP

As an event organizer or platform administrator configuring pageant details or candidate profiles,  
I want to drag and drop image files onto a dedicated upload surface or select them via system file browser,  
So that the image is validated, uploaded directly to cloud object storage via a short-lived presigned URL, and linked to my form with instant visual progress.

**Why this priority**: Core integration primitive. Organizers cannot upload event banners or contestant photos without an interactive, accessible client-side upload mechanism. Direct-to-storage upload prevents saturating the web application server with heavy binary media payloads.

**Independent Test**: Can be tested by dropping a valid JPEG/PNG/WebP image onto the component in an isolated test fixture or form, verifying that a presigned upload URL is obtained from `/api/media/presigned-url`, a direct HTTP PUT upload occurs with incremental progress from 0% to 100%, and the component emits the final storage key and public URL upon completion.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing an active image upload dropzone, **When** a valid image file (e.g. `banner.jpg`, 3.2MB, `image/jpeg`) is dropped onto the dropzone or chosen via the file dialog, **Then** the dropzone indicates active drag state, validates file parameters, requests a presigned URL, initiates a direct HTTP PUT upload, displays a real-time upload progress bar, and transitions to a completed state displaying the image preview and storage key.
2. **Given** an active image upload in progress, **When** the upload reaches 100% and the storage service responds with HTTP 200, **Then** the component triggers the `onUploadComplete` callback with the permanent asset key, public URL, file name, and file size.
3. **Given** an active image upload in progress, **When** the user clicks "Cancel", **Then** the active network transfer is aborted immediately, the progress state is cleared, and the dropzone resets to its idle state.

---

### User Story 2 - Instant Client-Side Boundary Validation & Error Feedback (Priority: P2)

As a user preparing to upload images for an event or contestant,  
I want immediate validation feedback if my selected file exceeds size limits or uses an unsupported file type,  
So that I understand why the upload was rejected without waiting for unnecessary network timeouts or backend rejections.

**Why this priority**: Prevents wasted bandwidth, eliminates cloud roundtrips for invalid files, and provides clear, accessible feedback to non-technical pageant organizers.

**Independent Test**: Can be tested by selecting an oversized file (>5MB for avatars, >10MB for banners) or an unsupported format (e.g. `document.pdf`, `graphic.svg`, `animation.gif`), verifying that the dropzone immediately rejects the file with an inline, accessible error message and performs zero network calls.

**Acceptance Scenarios**:

1. **Given** an image dropzone configured with a 5MB maximum limit, **When** the user selects a 7MB image file, **Then** the component rejects the file immediately, renders an error message stating "File exceeds maximum size of 5MB", and prevents any upload request.
2. **Given** an image dropzone configured for standard raster image formats (`image/jpeg`, `image/png`, `image/webp`), **When** the user selects a file with MIME type `application/pdf` or `image/gif`, **Then** the component rejects the file with "Unsupported file format. Please upload JPEG, PNG, or WebP", and leaves existing uploaded assets intact.
3. **Given** a validation error is displayed, **When** the user selects a subsequent valid file, **Then** the error state is cleared automatically and the new upload commences smoothly.

---

### User Story 3 - Resilient Error Recovery & Transient Failure Retries (Priority: P3)

As an event organizer uploading high-resolution media on variable internet connections,  
I want clear error feedback and a retry mechanism if a network interruption causes an upload to fail,  
So that I can resume or re-attempt the upload without refreshing the entire form and losing entered data.

**Why this priority**: Pageant events are frequently operated on-site at venues or auditoriums with fluctuating Wi-Fi and mobile connectivity. Transient upload failures must not destroy unsaved form state.

**Independent Test**: Can be tested by simulating a network failure (e.g. offline status or HTTP 500 from the presigned URL endpoint), verifying that the component enters an error state with a "Retry" button, and clicking "Retry" successfully recommences the upload.

**Acceptance Scenarios**:

1. **Given** an upload in progress, **When** the presigned upload request or direct storage PUT transfer encounters a network disconnection or HTTP error, **Then** the component displays a descriptive error banner and provides a visible "Retry" button.
2. **Given** a failed upload in retry state, **When** the user clicks "Retry", **Then** the component requests a fresh presigned URL and re-executes the upload from the beginning without clearing other form fields.

---

### User Story 4 - Keyboard Navigation & Screen Reader Accessibility (Priority: P4)

As a keyboard-only or assistive technology user,  
I want to navigate to the dropzone using Tab, trigger the file picker with Space or Enter, and receive audible status announcements,  
So that the image upload experience complies with WCAG 2.1 AA accessibility standards.

**Why this priority**: Compliance with VoteSphere Constitution (§VI) and design system accessibility mandates. All core interactive controls must be operable without a mouse.

**Independent Test**: Can be tested using keyboard navigation only (Tab, Shift+Tab, Enter, Space) and an accessibility tree inspector, verifying focus rings, ARIA roles, live regions for upload progress announcements, and WCAG 2.1 AA contrast ratios in both light and dark themes.

**Acceptance Scenarios**:

1. **Given** a keyboard user navigating the page, **When** the dropzone receives focus via Tab, **Then** a prominent 2px focus ring is rendered, and pressing Enter or Space activates the native file selection dialog.
2. **Given** a screen reader user, **When** an upload initiates and progresses, **Then** an `aria-live="polite"` region announces upload start, periodic percentage progress, and completion or failure status.
3. **Given** the component is rendered in either Light Mode (Opal Slate-50) or Dark Mode (Deep Navy `#0d1424`), **When** inspected for contrast, **Then** all text, border outlines, and interactive buttons satisfy WCAG 2.1 AA minimum ratios (>= 4.5:1 for text, >= 3:1 for graphical UI elements).

---

### Edge Cases

- **Drag leave without drop**: When a dragged file hovers over the dropzone and moves out without releasing, the active drop highlight must clear immediately without triggering selection.
- **Multiple files dropped**: When multiple files are dropped onto a single-image dropzone, the component must accept the first valid file (or display an explicit warning if single-file mode is active) rather than silently failing.
- **Zero-byte empty file**: If a user selects a corrupted or 0-byte file, the component must reject it with "File is empty or corrupted" before presigning.
- **Session expiration during upload**: If the user's session expires while attempting to generate a presigned URL, the component must surface an authentication error prompting sign-in rather than a generic network failure.
- **Presigned URL expiration before upload finish**: The presigned URL is short-lived (300 seconds). For very large files on slow connections, if the transfer takes longer than 300 seconds, the upload failure must be handled gracefully with an expiration-specific retry message.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The component MUST provide a drag-and-drop dropzone supporting desktop dragging and system file dialog triggering via click and keyboard activation (`Enter`, `Space`).
- **FR-002**: The component MUST enforce client-side validation against allowed MIME types (`image/jpeg`, `image/png`, `image/webp`) and file size limits (default 5MB for avatars, 10MB for banners) before initiating any network requests.
- **FR-003**: The component MUST integrate with the authenticated endpoint `POST /api/media/presigned-url` to obtain an S3 presigned PUT URL and asset key.
- **FR-004**: The component MUST upload the file directly to AWS S3 using HTTP `PUT` with the exact `Content-Type` header matching the presigned signature.
- **FR-005**: The component MUST provide real-time numeric and visual upload progress (0% to 100%) during the binary transfer.
- **FR-006**: The component MUST support cancelling an active transfer at any point before completion, resetting the component to its idle state.
- **FR-007**: The component MUST support retrying a failed upload without requiring the user to re-select the file or re-enter parent form data.
- **FR-008**: Upon upload completion, the component MUST render an image preview thumbnail and emit an `onUploadComplete` event containing the storage `key`, `publicUrl`, `fileName`, and `fileSize`.
- **FR-009**: The component MUST adhere to the VoteSphere brutalist-refined design system with zero-radius geometry (`rounded-none`, hairline borders, no rounded corners).
- **FR-010**: The component MUST comply with WCAG 2.1 AA dual-theme parity across Light Mode (Opal slate default) and Dark Mode, providing accessible ARIA labels, focus states, and live announcements.

---

### Key Entities

- **UploadTarget**: Configuration specifying destination folder (e.g. `events/banners`, `contestants/avatars`), max file size in bytes, and allowed MIME types.
- **UploadProgressState**: Client-side state tracking upload phase (`idle`, `validating`, `presigning`, `uploading`, `success`, `error`), percentage (0–100), uploaded bytes, and total bytes.
- **UploadedMediaAsset**: Emitted outcome object containing `key` (S3 object path), `publicUrl` (CloudFront/S3 access URL), `fileName`, `fileSize`, and `contentType`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can drag, drop, and complete a 3MB image upload in under 3 seconds on standard broadband connections without server bandwidth bottlenecks.
- **SC-002**: 100% of invalid MIME types and oversized files are intercepted on the client side in under 100ms with zero unnecessary network calls.
- **SC-003**: Upload progress indicators update smoothly with continuous percentage feedback.
- **SC-004**: All interactive elements achieve 100% keyboard accessibility and comply with WCAG 2.1 AA color contrast standards in both light and dark modes.
- **SC-005**: Zero regressions across existing test suites (`npm run test:unit`) and 100% strict TypeScript type checking (`npm run typecheck`).

---

## Assumptions

- Presigned upload URL generation backend endpoint (`POST /api/media/presigned-url`) is already operational and covered by unit tests (completed in `VS-43` / `VS-44`).
- S3 bucket CORS policy in AWS allows `PUT` from the application origin (provisioned in `electa-infra/modules/storage/`).
- Future cropping workflows (`VS-46`) and deletion confirmations (`VS-47`) will consume this dropzone component or wrap it in composite modal components.
