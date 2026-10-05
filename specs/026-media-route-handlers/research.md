# Research & Technical Decisions: Authenticated API Route Handlers for Media Operations (VS-43)

**Tracking Issue**: [VS-43](https://the-three-devsketeers.atlassian.net/browse/VS-43)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  
**Feature Branch**: `feature/VS-43-media-route-handlers`  
**Date**: 2026-10-05  

---

## 1. Technical Context & Objectives

The goal of VS-43 is to expose secure, production-grade HTTP route handlers that bridge the frontend upload components (e.g. `ImageUploadDropzone` in VS-45) with the core S3 storage library (`src/lib/s3/` delivered in VS-42).

All endpoints must comply strictly with the VoteSphere Constitution:
- **§I. Strict Type Safety & Boundary Validation**: Zod parsing of incoming request bodies.
- **§II. Server-First & Boundary Isolation**: Standard typed `ApiResponse<T>` envelopes using `apiSuccess()` and `apiError()`; Next.js 16 asynchronous request primitives (`cookies()`, `headers()`) must be awaited.
- **§IV. Secure-by-Design & Auth Integrity**: Session verification via `getSession()`, role authorization, and sanitized error messages.

---

## 2. Research Decisions & Architectural Rationale

### Decision 1: Endpoint Path Structure & Granularity

- **Decision**: Implement two dedicated, single-responsibility route handlers:
  1. `POST /api/media/presigned-url` (`src/app/api/media/presigned-url/route.ts`)
  2. `DELETE /api/media/delete` (`src/app/api/media/delete/route.ts`)
- **Rationale**:
  - Single Responsibility Principle (SRP): Presigned URL generation has different input parameters (`fileName`, `contentType`, `folder`, `maxSizeBytes`) and authorization requirements compared to asset deletion (`key`).
  - Dedicated routes simplify Next.js App Router tree-shaking, static analysis, and OpenAPI / API contract generation.
- **Alternatives Considered**:
  - Single composite route handler `POST /api/media` and `DELETE /api/media`: Rejected because combining URL creation and file deletion in a single route increases coupling and makes route-level middleware permissions more complex.

---

### Decision 2: Authentication & Authorization Strategy

- **Decision**: Use `getSession()` from `@/lib/auth/get-session` at the beginning of each route handler invocation:
  - **Presigned URL Route (`POST`)**: Requires an active user session (`if (!session) return apiError("Unauthorized", 401)`). Any verified registered user (organizer, contestant, admin) can request presigned URLs for permitted folder namespaces.
  - **Deletion Route (`DELETE`)**: Requires administrative or organizer role (`session.role === "ORGANIZER" || session.role === "ADMIN"`). Non-organizers attempting deletion receive HTTP 403 Forbidden.
- **Rationale**:
  - Conforms to Constitution §IV defense-in-depth: middleware guards URL patterns, but route handlers MUST independently verify user session identity and role.
  - Asynchronous Next.js 16 APIs: `getSession()` awaits `headers()` and `cookies()`, avoiding synchronous access warnings.
- **Alternatives Considered**:
  - Next.js Edge Middleware-only checks: Rejected because Edge middleware cannot perform deep business logic or tenant ownership checks.

---

### Decision 3: Boundary Validation & Error Handling

- **Decision**:
  - Parse request JSON with `.json().catch(() => null)`. Return `apiError("Invalid JSON payload", 400)` if parsing fails.
  - Validate with `presignedUploadRequestSchema.safeParse(body)` and `deleteImageRequestSchema.safeParse(body)`.
  - On validation error, aggregate Zod issue messages into readable strings: `apiError(issues.map(e => e.message).join("; "), 400)`.
  - Wrap downstream S3 service invocations in `try/catch`. Catch unexpected AWS exceptions, log details securely server-side without leaking credentials, and return `apiError("Internal media service error", 500)`.
- **Rationale**:
  - Protects against malformed requests and DOS crashes.
  - Guarantees that clients always receive structured `ApiResponse<T>` envelopes with consistent status codes.

---

### Decision 4: Unit Testing & Mocking Strategy

- **Decision**:
  - Test suites created under `tests/unit/api/`:
    - `tests/unit/api/media-presigned-url-route.test.ts`
    - `tests/unit/api/media-delete-route.test.ts`
  - Mock `@/lib/auth/get-session` and `@/lib/s3` functions using `vi.mock()`.
  - Test cases cover:
    1. Unauthenticated request -> HTTP 401
    2. Unauthorized role (Voter attempting delete) -> HTTP 403
    3. Malformed JSON payload -> HTTP 400
    4. Invalid MIME type or path traversal -> HTTP 400
    5. Successful presigned URL generation -> HTTP 200 with `ApiResponse<PresignedUploadResponse>`
    6. Successful deletion -> HTTP 200 with `ApiResponse<DeleteImageResponse>`
    7. Unexpected storage service failure -> HTTP 500
- **Rationale**:
  - Decoupled from real AWS network calls; executes in milliseconds in Vitest with 100% branch coverage.
