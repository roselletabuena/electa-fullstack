# Feature Specification: S3 Bucket Implementation

**Feature ID**: `014-s3-bucket-implementation`
**Status**: Draft
**Created**: 2026-10-02

---

## Overview

This feature provides secure, high-performance object storage integration using AWS S3 (or S3-compatible storage) for the Electa/VoteSphere platform. It enables organizers and contestants to upload banners, profile photos, contestant gallery assets, and verification documents via secure pre-signed URLs, with strict file type validation, size limits, and access controls.

## Actors

- **Organizer**: Uploads event banner images, logo assets, sponsor logos, and category badges.
- **Contestant**: Uploads profile pictures, gallery photos, and audition/submission media.
- **Voter / Public Viewer**: Reads and loads cached public media assets through CDN / S3 URLs.

## Functional Requirements

1. **Pre-signed Upload URLs**: Provide authenticated server actions or API endpoints to generate secure, time-limited PUT/POST pre-signed URLs for direct client-to-S3 uploads.
2. **File Validation**: Validate MIME types (JPEG, PNG, WebP, AVIF) and payload sizes (e.g. max 5MB for avatars, 10MB for banners) before generating pre-signed URLs.
3. **Structured Object Key Naming**: Partition uploaded assets by event, entity type, and owner (e.g., `events/{eventId}/banners/{uuid}.webp`, `contestants/{contestantId}/avatars/{uuid}.webp`).
4. **Public Asset Resolution**: Return public CDN / S3 URLs for public assets, and signed read URLs for protected documents if needed.
5. **Delete & Cleanup**: Allow organizers and authorized entities to delete obsolete assets from the bucket.

## User Scenarios & Acceptance Criteria

### Scenario 1: Presigned URL Generation for Event Banner
**Given** an authenticated event organizer managing an event
**When** they request an upload URL for an image (`image/webp`, 3.5MB)
**Then** the system returns a pre-signed S3 upload URL valid for 5 minutes with matching Content-Type constraints and the generated target S3 asset key.

### Scenario 2: Direct Upload and Event Banner Update
**Given** an organizer with a pre-signed URL
**When** the organizer uploads the file directly to S3 and confirms the upload
**Then** the event record's `bannerUrl` is saved with the public asset URL and correctly rendered in the dashboard and live event views.

### Scenario 3: Reject Disallowed File Types or Oversized Payloads
**Given** a user attempting to upload an `.exe` file or a 50MB file
**When** the request for a pre-signed URL is evaluated
**Then** the server action / API rejects the request with a descriptive 400 Bad Request error before touching S3.

## Edge Cases & Constraints

- Expired pre-signed URLs must be safely handled on the client with retry / refresh capability.
- Corrupted uploads or aborted uploads should not leave orphaned links in the PostgreSQL database.
- Filename collisions must be prevented by using UUIDs in object keys.
- Proper CORS headers must be configured on the S3 bucket to allow browser uploads from the web app origin.

## Out of Scope

- Video transcoding and streaming pipelines (stored or embedded via external URLs / YouTube / Vimeo).
- Client-side image cropping and manipulation libraries (handled in separate UI feature slices).

## Success Criteria

- Organizers can upload banners and avatars without sending large binary streams through the Next.js API server.
- All uploads are authenticated and rate-limited.
- Next.js image components can render uploaded images without unconfigured host errors.

## Dependencies & Assumptions

- Relies on: AWS S3 SDK (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`).
- Relies on: AWS Cognito session via `getSession()` for authentication.
- Relies on: Environment variables validated in `src/env.ts` (`AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
