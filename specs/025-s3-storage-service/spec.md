# Feature Specification: Core S3 Storage Service & Presigned URL Generator

**Feature Branch**: `025-s3-storage-service`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-42: [BE] 1.2 Core S3 Storage Service & Presigned URL Generator"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Secure Presigned Upload URL Generation with Strict Validation (Priority: P1) 🎯 MVP

As an Electa frontend application or contestant registration form,
I need to request a secure, short-lived presigned upload URL with strict MIME and size constraints,
So that users can upload profile photos and event banners directly to S3 without proxying heavy binary data through Next.js servers, while preventing malicious or oversized file uploads.

**Why this priority**: Direct-to-S3 uploads protect server memory and bandwidth. Presigned URL generation is the prerequisite for all frontend media upload interfaces (VS-43, VS-45, VS-46).

**Independent Test**: Can be verified by requesting a presigned URL with valid image parameters (`"banner.jpg"`, `"image/jpeg"`, folder `"events/banners"`), verifying that a valid presigned PUT URL and collision-resistant key are returned, and verifying that disallowed MIME types (e.g. `"application/pdf"`) or oversized payloads are rejected immediately with validation errors.

**Acceptance Scenarios**:

1. **Given** a valid image file name (`"profile.png"`), an approved MIME type (`"image/png"`), and target folder (`"contestants/avatars"`), **When** `generatePresignedUploadUrl()` is executed, **Then** the system returns a presigned PUT URL valid for 300 seconds (5 minutes), a unique collision-resistant key formatted as `contestants/avatars/<uuid>-profile.png`, and the public asset URL (`https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/contestants/avatars/<uuid>-profile.png`).
2. **Given** an unsupported or dangerous MIME type (`"application/pdf"`, `"image/svg+xml"`, or `"text/html"`), **When** `generatePresignedUploadUrl()` is requested, **Then** the request is rejected with a validation error before any S3 API command is created.
3. **Given** an upload request declaring a file size exceeding the allowed maximum (e.g. 15MB when limit is 5MB), **When** evaluated, **Then** the request fails validation immediately.

---

### User Story 2 - Idempotent Object Deletion and Asset Replacement (Priority: P2)

As an event organizer or contestant updating media,
I need obsolete images to be deleted from S3 and cleanly replaced when updating banners or contestant profile photos,
So that storage costs remain optimized, orphaned files are cleaned up, and no dead links remain in the database.

**Why this priority**: Without deletion and replacement utilities, every image edit or profile photo update leaves orphaned files accumulating indefinitely in S3.

**Independent Test**: Can be verified by dispatching `deleteImageFromS3(key)` and `replaceImage({ oldKey, newKey })` and confirming that the deletion command succeeds and removes the targeted key from S3 without crashing on non-existent keys.

**Acceptance Scenarios**:

1. **Given** an existing S3 object key (`"events/banners/sample.jpg"`), **When** `deleteImageFromS3(key)` is invoked, **Then** the file is deleted from S3 and the operation completes successfully.
2. **Given** a non-existent or previously deleted S3 key, **When** `deleteImageFromS3(key)` is invoked, **Then** the operation completes idempotently without throwing an unhandled exception.
3. **Given** an `oldKey` and a newly uploaded `newKey`, **When** `replaceImage()` is called, **Then** the old key is purged from S3 and the new asset reference is preserved.

---

### User Story 3 - Direct Server-Side Buffer Uploads for Generated Assets (Priority: P3)

As an automated internal service (such as the viral story card generator or QR code engine),
I need to upload in-memory image buffers directly to S3 from the server,
So that server-generated media assets can be stored and served through platform public URLs.

**Why this priority**: Enables background jobs and server-rendered canvas engines to deposit composite images directly into S3 without requiring a browser round-trip.

**Independent Test**: Can be verified by passing an image buffer and metadata to `uploadImageBuffer()` and confirming that the asset is written to S3 and returns the public asset URL.

**Acceptance Scenarios**:

1. **Given** an in-memory image buffer (`image/png`) and destination key, **When** `uploadImageBuffer()` is executed, **Then** the object is stored in the S3 bucket with matching `ContentType` and returns the asset public URL.

---

### Edge Cases

- **Special Characters and Spaces in Filenames**: How are spaces, symbols, and non-ASCII characters handled? The service sanitizes filenames into URL-safe, alphanumeric strings with hyphens prior to key assembly.
- **Path Traversal Attacks**: What happens if a filename contains `../` or `/`? Filename sanitization strips all directory separators and path traversal tokens, constraining storage strictly within the declared folder prefix.
- **Expired Presigned URLs**: What happens when a user takes longer than 5 minutes to upload? The presigned URL expires, S3 rejects the PUT request with 403 Forbidden, and the client must request a refreshed URL.
- **Zero-Byte or Empty File Names**: Requests with empty strings or missing extensions are rejected during input validation.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a centralized S3 client singleton configured with AWS region (`AWS_REGION`), target bucket (`S3_MEDIA_BUCKET`), and credentials resolved through `@/env`.
- **FR-002**: System MUST provide a `generatePresignedUploadUrl()` function returning a presigned PUT URL with a 300-second (5 minute) expiration window.
- **FR-003**: System MUST enforce a strict MIME whitelist restricted to `image/jpeg`, `image/png`, and `image/webp`. All other MIME types MUST be rejected with explicit validation errors.
- **FR-004**: System MUST enforce configurable maximum file size limits (default 5MB for avatars, 10MB for event banners).
- **FR-005**: System MUST sanitize input file names to remove whitespace, special characters, and path separators, and prepend a cryptographically random UUID to guarantee collision-free keys (`<folder>/<uuid>-<sanitized-filename>`).
- **FR-006**: System MUST return the generated S3 key, the presigned upload URL, and the canonical public asset URL for every successful generation request.
- **FR-007**: System MUST provide an idempotent `deleteImageFromS3(key)` function to delete objects from the target media bucket.
- **FR-008**: System MUST provide a `replaceImage({ oldKey, newKey })` function that deletes the obsolete asset from S3 when a replacement is uploaded.
- **FR-009**: System MUST provide an `uploadImageBuffer({ buffer, key, contentType })` function for server-side direct uploads of system-generated media.

### Key Entities

- **Presigned Upload Descriptor**: Result of a presigned URL request, containing `uploadUrl` (time-limited PUT URL), `key` (target S3 object key), `publicUrl` (canonical asset URL), and `expiresIn` (seconds).
- **Upload Request Policy**: Input constraints defining `fileName`, `contentType`, target `folder` prefix, and optional `maxSizeBytes`.
- **Media Object Key**: Structured string path identifying the asset within S3 (e.g. `events/{eventId}/banners/{uuid}.webp`, `contestants/{contestantId}/avatars/{uuid}.webp`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of presigned URL requests specifying disallowed MIME types (e.g. PDF, SVG, EXE, HTML) fail validation immediately before making AWS calls.
- **SC-002**: 100% of generated object keys are unique (UUID-prefixed) and contain only sanitized URL-safe characters.
- **SC-003**: Presigned URL generation response time is under 50ms under standard operational conditions.
- **SC-004**: Presigned PUT URLs expire and become invalid after exactly 300 seconds.
- **SC-005**: Deletion operations are 100% idempotent, completing without error even if the target object does not exist.

## Assumptions

- AWS credentials (`AWS_REGION`, `S3_MEDIA_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are configured in the environment and validated via `@/env`.
- S3 Bucket CORS rules configured in `VS-41` permit direct `PUT` uploads from the web application origin.
- Uploaded media assets are publicly accessible through S3 regional domain URLs or an integrated CDN.
