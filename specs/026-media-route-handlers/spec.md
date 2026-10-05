# Feature Specification: Authenticated API Route Handlers for Media Operations

**Feature Branch**: `feature/VS-43-media-route-handlers`  
**Tracking Issue**: [VS-43](https://the-three-devsketeers.atlassian.net/browse/VS-43)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  
**Created**: 2026-10-05  
**Status**: Ready for Planning  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-43: [BE] 1.3 Authenticated API Route Handlers for Media Operations"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Authenticated Presigned URL Generation Endpoint (Priority: P1) 🎯 MVP

As an authenticated organizer or administrative user preparing to upload event media or contestant avatars,
I need an authenticated HTTP endpoint (`POST /api/media/presigned-url`) that validates my session and upload parameters,
So that I can securely obtain a short-lived presigned upload URL and S3 key to perform direct-to-S3 uploads from the browser.

**Why this priority**: Core integration gate. Without an authenticated API endpoint, frontend dropzone components (VS-45, VS-46) cannot request S3 upload URLs securely.

**Independent Test**: Can be verified by sending an authenticated `POST` request with valid payload (`"banner.jpg"`, `"image/jpeg"`, folder `"events/banners"`), verifying that HTTP 200 is returned with a standard `ApiResponse<PresignedUploadResponse>` containing `uploadUrl`, `key`, and `publicUrl`, and verifying that unauthenticated or invalid requests return HTTP 401 and HTTP 400 respectively.

**Acceptance Scenarios**:

1. **Given** an authenticated organizer session (`getSession()` returns a valid user session) and a valid JSON payload specifying `fileName`, `contentType`, and `folder`, **When** `POST /api/media/presigned-url` is invoked, **Then** the endpoint returns HTTP 200 with `ApiResponse<PresignedUploadResponse>` containing `uploadUrl` (valid for 300 seconds), unique `key`, `publicUrl`, and `expiresIn: 300`.
2. **Given** a request without an active session (missing or invalid authorization header and cookies), **When** `POST /api/media/presigned-url` is invoked, **Then** the endpoint immediately rejects the request with HTTP 401 Unauthorized and standard error envelope `{ success: false, error: "Unauthorized" }`.
3. **Given** an authenticated request containing an unsupported MIME type (e.g. `"application/pdf"`) or invalid folder tokens, **When** evaluated, **Then** the endpoint rejects the payload with HTTP 400 Bad Request and descriptive validation error details.

---

### User Story 2 - Authenticated Media Object Deletion Endpoint (Priority: P2)

As an authenticated organizer or administrator managing event media assets,
I need an authenticated HTTP endpoint (`DELETE /api/media/delete`) to delete obsolete or replaced images from storage,
So that storage costs are minimized and orphaned assets are purged safely.

**Why this priority**: Required for media cleanup and asset replacement workflows to prevent accumulating dead files.

**Independent Test**: Can be verified by dispatching an authenticated `DELETE` request with an S3 object key (`"events/banners/sample.jpg"`), verifying HTTP 200 with `ApiResponse<DeleteImageResponse>` `{ success: true, key: "..." }`, and verifying that unauthenticated requests return HTTP 401.

**Acceptance Scenarios**:

1. **Given** an authenticated organizer session and a valid object `key`, **When** `DELETE /api/media/delete` is invoked, **Then** the system removes the asset from S3 and returns HTTP 200 with `ApiResponse<DeleteImageResponse>` `{ success: true, key }`.
2. **Given** an unauthenticated request to delete an object, **When** `DELETE /api/media/delete` is invoked, **Then** the endpoint immediately returns HTTP 401 Unauthorized without attempting S3 commands.
3. **Given** an authenticated request with missing or malformed `key` (e.g. empty string or path traversal), **When** evaluated, **Then** the endpoint returns HTTP 400 Bad Request.
4. **Given** a valid deletion request for a non-existent key in S3, **When** processed, **Then** the endpoint returns HTTP 200 idempotently.

---

### User Story 3 - Role-Based Authorization & Path Prefix Enforcement (Priority: P3)

As a platform security administrator,
I need the media endpoints to enforce role-based access controls and restrict target folder prefixes,
So that unauthorized roles cannot generate upload credentials for system directories or delete media belonging to other entities.

**Why this priority**: Defense-in-depth protection ensuring that media operations respect tenant boundaries and user privileges.

**Independent Test**: Can be verified by attempting to request presigned URLs for restricted folders or deleting objects with a non-organizer/voter session and asserting HTTP 403 Forbidden.

**Acceptance Scenarios**:

1. **Given** an authenticated session with a voter role (`role !== "ORGANIZER"` and `role !== "ADMIN"`) attempting administrative media deletion, **When** `DELETE /api/media/delete` is called, **Then** the endpoint returns HTTP 403 Forbidden.
2. **Given** an upload request declaring an unauthorized or system-protected folder prefix, **When** evaluated, **Then** the endpoint returns HTTP 403 Forbidden.

---

### Edge Cases

- **Malformed JSON Body**: When the client sends invalid JSON syntax or empty body, the route handler intercepts the parsing error and returns HTTP 400 Bad Request instead of crashing with HTTP 500.
- **Asynchronous Request APIs**: All Next.js 16 asynchronous request primitives (`cookies()`, `headers()`) are properly awaited in compliance with Next.js 16 and Constitution §II.
- **Upstream AWS S3 Failures**: If the AWS SDK or S3 service encounters a temporary network timeout or internal error, the handler catches the exception, logs sanitized operational telemetry, and returns HTTP 500 with a user-friendly error envelope (no raw AWS credentials or stack traces leaked).
- **Idempotent Deletion**: Deleting an object that was already deleted or never existed completes successfully without error (HTTP 200).

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST expose a `POST /api/media/presigned-url` route handler requiring an authenticated session resolved via `getSession()`. Unauthenticated requests MUST be rejected with HTTP 401.
- **FR-002**: `POST /api/media/presigned-url` MUST validate incoming JSON bodies against `presignedUploadRequestSchema` from `@/lib/s3`. Schema violations MUST return HTTP 400.
- **FR-003**: On successful validation, `POST /api/media/presigned-url` MUST invoke `generatePresignedUploadUrl()` and return HTTP 200 containing `ApiResponse<PresignedUploadResponse>`.
- **FR-004**: System MUST expose a `DELETE /api/media/delete` route handler requiring an authenticated session with `ORGANIZER` or `ADMIN` role. Unauthenticated requests MUST return HTTP 401; unauthorized roles MUST return HTTP 403.
- **FR-005**: `DELETE /api/media/delete` MUST validate incoming JSON bodies against `deleteImageRequestSchema` from `@/lib/s3`. Invalid payloads MUST return HTTP 400.
- **FR-006**: On successful validation and authorization, `DELETE /api/media/delete` MUST invoke `deleteImageFromS3()` and return HTTP 200 containing `ApiResponse<DeleteImageResponse>`.
- **FR-007**: All route handlers MUST wrap responses in standard typed `ApiResponse<T>` envelopes (`apiSuccess` or `apiError`) defined in `@/lib/api/response`.
- **FR-008**: Handlers MUST NOT expose internal AWS credentials, configuration keys, or unhandled stack traces in response error payloads.
- **FR-009**: Next.js 16 asynchronous request APIs (`cookies()`, `headers()`) MUST be awaited prior to accessing request context.

### Key Entities

- **UserSession**: Authenticated user identity containing `userId`, `email`, and `role` (`ORGANIZER`, `ADMIN`, etc.).
- **ApiResponse<T>**: Standard API envelope containing `success: boolean`, `data?: T`, `error?: string`, and `timestamp: string`.
- **PresignedUploadRequest / PresignedUploadResponse**: Input parameters (`fileName`, `contentType`, `folder`, `maxSizeBytes`) and generated output (`uploadUrl`, `key`, `publicUrl`, `expiresIn`, `contentType`).
- **DeleteImageRequest / DeleteImageResponse**: Target S3 object `key` to delete and completion confirmation `{ success: true, key }`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated requests to `/api/media/presigned-url` and `/api/media/delete` are rejected with HTTP 401 within 25ms.
- **SC-002**: 100% of requests with invalid MIME types, excessive declared file sizes, or path traversal tokens are rejected with HTTP 400 before invoking S3 commands.
- **SC-003**: 100% of route handler responses comply with the standard `ApiResponse<T>` envelope format.
- **SC-004**: Route handlers achieve 100% branch and statement test coverage across all test cases (unauthenticated, forbidden role, invalid body, successful generation/deletion, and AWS service error).

---

## Assumptions

- Core S3 storage service (`generatePresignedUploadUrl`, `deleteImageFromS3`, Zod schemas) is available via `@/lib/s3` (implemented in `VS-42`).
- Authentication and session resolution are handled via `getSession()` from `src/lib/auth/get-session.ts` (established in `VS-13` / `VS-52`).
- S3 bucket and CORS configurations deployed in `VS-41` support browser-direct PUT uploads and HEAD/DELETE methods.
