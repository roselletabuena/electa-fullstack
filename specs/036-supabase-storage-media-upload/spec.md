# Feature Specification: Supabase Storage Media Upload Route & Presigned Client

**Feature ID**: `036-supabase-storage-media-upload`
**Jira Key**: `VS-104`
**Status**: Draft
**Created**: 2026-10-13

---

## Overview

Electa's event creation experience requires dependable media hosting for competition banners and event imagery. Currently, creation forms rely on manual image URL input or AWS S3 utilities that require complex credentials. This feature implements a secure, resilient Supabase Storage integration for uploading banner assets to the `events` bucket (`banners/` prefix) via authenticated API routes and direct client utilities, paired with an automatic fallback gradient generator (`/placeholders/event-banner-default.webp`) so that missing artwork never halts event draft publishing.

---

## Actors

- **Event Organizer**: Authenticated user with `ORGANIZER` or `ADMIN` role who uploads competition banners and artwork during event creation or management.
- **System / API Client**: Front-end upload hooks and dropzone components that communicate with the Supabase Storage service and upload route.
- **Voter / Public Viewer**: Unauthenticated or authenticated users viewing published competition banners loaded from Supabase public CDN URLs or fallback gradients.

---

## Functional Requirements

1. **Supabase Client & Service Configuration**:
   - Provide a singleton browser/client Supabase factory (`src/lib/supabase/client.ts`) and server Supabase client (`src/lib/supabase/server.ts`).
   - Provide a dedicated Supabase storage service module (`src/lib/supabase/storage-service.ts`) encapsulating bucket interactions, file uploads, URL resolution, and signed upload token creation.

2. **Authenticated API Upload Route**:
   - Provide route handler `POST /api/media/supabase-upload` (and/or presigned client token generator) requiring session verification via `getSession()` from `@/lib/auth/get-session`.
   - Validate authorization: only authenticated users with `ORGANIZER` or `ADMIN` roles can upload event assets.
   - Standardize response payload using `ApiResponse<T>` envelope (`apiSuccess`, `apiError`).

3. **Strict Validation & Guardrails**:
   - Restrict allowed MIME types strictly to: `image/jpeg`, `image/png`, `image/webp`.
   - Restrict maximum file size to 10MB (10,485,760 bytes).
   - Reject unauthenticated requests with HTTP 401.
   - Reject invalid MIME types, empty files, or files exceeding 10MB with HTTP 400 and typed error messages (`INVALID_MIME_TYPE`, `FILE_TOO_LARGE`).
   - Clean up / guarantee no orphaned storage objects on failed requests.

4. **Public CDN URL Resolution & Path Partitioning**:
   - Store banner files under `events` bucket with key pattern: `banners/{timestamp}-{randomUuid}.{ext}` or `banners/{sanitizedFilename}`.
   - Return permanent public CDN URL for the uploaded object.

5. **Missing Artwork Fallback Mechanism**:
   - Provide a deterministic fallback helper (`getEventBannerUrl(url?: string | null)`) returning `/placeholders/event-banner-default.webp` when no custom banner is provided.
   - Provide static fallback webp placeholder in `public/placeholders/event-banner-default.webp`.

6. **Client Hook & UI Integration**:
   - Update `useImageUpload` hook and `ImageDropzone` component to support Supabase storage upload backend alongside or replacing S3 with zero downtime.
   - Provide real-time upload progress events (0% to 100%) and abortable upload controls.

---

## User Scenarios & Acceptance Criteria

### Scenario 1: Uploading to Supabase Storage Bucket (Happy Path)
- **Given** an authenticated organizer with role `ORGANIZER` selects a valid image file (JPEG, PNG, or WebP ≤ 10MB),
- **When** the upload action is initiated,
- **Then** the file is uploaded to the Supabase Storage `events` bucket under the `banners/` prefix,
- **and Then** the upload returns the resolved public URL and progress indicators fire accurately from 0% to 100%.

### Scenario 2: File Validation and Size Rejection (Validation & Error Handling)
- **Given** an unauthenticated request or a file exceeding 10MB or having an invalid MIME type (e.g. `.exe` or `.pdf`),
- **When** upload is attempted,
- **Then** the system rejects the upload with an explicit typed error message,
- **and Then** no orphaned object is created in the Supabase bucket.

### Scenario 3: Missing Artwork Fallback (Edge Case)
- **Given** an organizer submits an event without uploading a custom banner,
- **When** the payload is prepared,
- **Then** the service resolves a default brand geometric gradient URL (`/placeholders/event-banner-default.webp`),
- **and Then** the event creation is permitted without throwing validation errors.

---

## Edge Cases & Constraints

- **Network Interruption / Abort**: When an in-flight upload is aborted by the organizer, the XMLHttpRequest or fetch controller must abort cleanly and reset UI state.
- **Corrupt or Zero-byte File**: File sizes equal to 0 bytes must be rejected with code `EMPTY_FILE`.
- **Special Characters in File Names**: File names must be sanitized and normalized to prevent path traversal or S3/Supabase key encoding anomalies.
- **Unauthenticated Session**: When session expires, route returns HTTP 401 with typed `UNAUTHORIZED` error without creating storage objects.

---

## Out of Scope

- Video or audio media uploads (banner images only for this milestone).
- Full batch multi-image gallery uploads (single banner upload per control).
- Automatic server-side image resizing/cropping pipeline (handled in future media optimization ticket).

---

## Success Criteria

- 100% test coverage on validation and upload logic via Vitest.
- Seamless dual-theme support (Opal Light default, high contrast) in `ImageDropzone` without rounded corners (`rounded-none`).
- Route responses strictly comply with `ApiResponse<T>` envelope.
- `npm run typecheck`, `npm run lint`, and `npm run test:unit` pass cleanly.
