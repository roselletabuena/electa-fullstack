# Research: Core S3 Storage Service & Presigned URL Generator

**Feature Branch**: `025-s3-storage-service`  
**Date**: 2026-10-05  
**Spec**: [spec.md](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/spec.md)

---

## 1. Technical Context & Objectives

The Electa platform requires a robust, secure, and decoupled media storage layer to handle contestant profile photos, event banners, viral story cards, and QR codes. In accordance with cloud-native best practices and the Electa multi-project architecture:

1. **Direct-to-S3 Uploads via Presigned URLs**: Client applications upload directly to S3 via short-lived (300s) presigned `PUT` URLs. This prevents heavy media binaries from passing through the Next.js App Router server, reducing memory pressure, bandwidth, and latency.
2. **Strict Server-Side Validation**: Before any presigned URL is minted, the server rigorously validates MIME types (`image/jpeg`, `image/png`, `image/webp`), enforces size ceilings (5MB for avatars, 10MB for banners), sanitizes filenames, and generates collision-resistant object keys.
3. **Server-Side Buffer Ingestion**: Internal backend services (e.g. stage display composite canvas generators, QR code generators) require direct server-to-S3 buffer uploads.
4. **Idempotent Deletion & Replacement**: Lifecycle utilities allow cleaning up obsolete images without leaving orphaned assets or throwing unhandled errors when objects do not exist.

---

## 2. Research Questions & Decisions

### Decision 1: AWS SDK v3 Client Architecture & Singleton Management
- **Question**: Which AWS SDK packages should be used, and how should the client singleton be instantiated?
- **Decision**: Use modular AWS SDK v3 packages:
  - `@aws-sdk/client-s3`: S3 client, `PutObjectCommand`, `DeleteObjectCommand`, `HeadObjectCommand`.
  - `@aws-sdk/s3-request-presigner`: `getSignedUrl` utility for presigned PUT URLs.
- **Rationale**: AWS SDK v3 is tree-shakeable, modular, and natively supports TypeScript with first-class Node.js 18+ and Next.js 16 App Router compatibility.
- **Singleton Pattern**: Instantiate `S3Client` inside `src/lib/s3/client.ts` as a cached singleton (analogous to the Prisma singleton pattern in `src/lib/db.ts`) to avoid socket leaks during development Fast Refresh.
- **Environment Configuration**: Region and bucket names are resolved exclusively via `@/env` (`env.AWS_REGION`, `env.S3_MEDIA_BUCKET`). AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are either resolved via the standard AWS SDK credential provider chain (environment variables, AWS SSO, or EC2/ECS metadata) or explicitly passed if present in `@/env`.

### Decision 2: Presigned PUT URL vs POST Policy
- **Question**: Should we use presigned `PUT` URLs (`@aws-sdk/s3-request-presigner`) or presigned `POST` policies (`createPresignedPost`)?
- **Decision**: Use presigned `PUT` URLs with `@aws-sdk/s3-request-presigner`.
- **Rationale**:
  - `getSignedUrl(s3Client, new PutObjectCommand({ Bucket, Key, ContentType }), { expiresIn: 300 })` produces a simple, standard HTTP `PUT` endpoint.
  - Frontend clients can upload via standard `fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file })`.
  - S3 CORS configuration (deployed in `VS-41`) explicitly enables `PUT`, `GET`, `HEAD` methods with `AllowedHeaders: ["*"]`.
  - Simpler payload structure compared to multipart form data required by `POST` policies.

### Decision 3: MIME Whitelisting & Validation Strategy
- **Question**: How do we prevent dangerous file uploads (e.g. SVGs with embedded scripts, HTML, executables)?
- **Decision**: Strict, non-negotiable MIME whitelist enforced by a Zod schema before any presigned URL is issued:
  - Allowed: `image/jpeg`, `image/png`, `image/webp`.
  - Prohibited: `image/svg+xml` (SVG XSS risk), `application/pdf`, `text/html`, and all executable types.
  - The `PutObjectCommand` presigned signature includes `ContentType: contentType`. When the client executes the PUT request against S3, S3 rejects the request if the request's `Content-Type` header does not match the signed value.

### Decision 4: Object Key Partitioning & Collision Resistance
- **Question**: How should S3 object keys be partitioned and named?
- **Decision**: Keys are structured with folder prefixes, a cryptographically secure random UUID (`crypto.randomUUID()`), and a sanitized filename slug:
  - Key format: `<folder>/<uuid>-<sanitized-filename>`
  - Examples:
    - `events/banners/a1b2c3d4-e5f6-7890-abcd-ef1234567890-summer-grand-prix.webp`
    - `contestants/avatars/98765432-10fe-dcba-9876-543210fedcba-maria-santos.png`
    - `system/generated/11223344-5566-7788-99aa-bbccddeeff00-stage-qr.png`
- **Sanitization Algorithm**:
  - Remove all directory separators (`/`, `\`, `..`) to eliminate path traversal attacks.
  - Normalize unicode and replace whitespace, special characters, and non-alphanumeric chars with hyphens (`-`).
  - Collapse multiple consecutive hyphens into a single hyphen.
  - Preserve valid extensions (`.jpg`, `.jpeg`, `.png`, `.webp`).

### Decision 5: Canonical Public URL Construction
- **Question**: How should the public asset URL be constructed?
- **Decision**: Standard virtual-hosted-style S3 URL:
  - Format: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
  - Example: `https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/abc-123.jpg`
  - Encapsulated in a dedicated helper function `getS3PublicUrl(key: string): string` to allow seamless future migration to CloudFront CDN distributions without breaking callers.

### Decision 6: Idempotent Deletion & Asset Replacement
- **Question**: How should S3 deletions behave when an object key doesn't exist?
- **Decision**: Amazon S3's `DeleteObjectCommand` is inherently idempotent: deleting a non-existent key returns HTTP 204 No Content (success).
  - `deleteImageFromS3(key)` catches and normalizes any unexpected errors while treating 404/NoSuchKey as a successful deletion.
  - `replaceImage({ oldKey, newKey })`:
    - Validates that `newKey` is provided.
    - If `oldKey` is provided and differs from `newKey`, it executes `deleteImageFromS3(oldKey)`.
    - Returns `{ success: true, deletedKey: oldKey, activeKey: newKey }`.

### Decision 7: Vitest Unit Testing Strategy
- **Question**: How do we test S3 operations without incurring AWS costs, needing active credentials, or running LocalStack in CI?
- **Decision**: Unit test all S3 utilities using Vitest function mocks and `aws-sdk-client-mock` pattern:
  - Mock `@aws-sdk/s3-request-presigner`'s `getSignedUrl` to return a deterministic dummy presigned URL.
  - Mock `S3Client.prototype.send` to simulate successful `PutObjectCommand` and `DeleteObjectCommand` executions.
  - Test validation boundaries: invalid MIME types, oversized files, missing extensions, path traversal filenames.
  - Verify error handling: S3 network failures, malformed keys, invalid regions.

---

## 3. Package Dependencies

To support these decisions, `electa-fullstack` requires:
- `@aws-sdk/client-s3`: `^3.758.0`
- `@aws-sdk/s3-request-presigner`: `^3.758.0`

These are production dependencies (`dependencies`). No other native binary packages are required.
