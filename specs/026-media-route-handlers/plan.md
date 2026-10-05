# Implementation Plan: Authenticated API Route Handlers for Media Operations (VS-43)

**Branch**: `feature/VS-43-media-route-handlers` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)  
**Tracking Issue**: [VS-43](https://the-three-devsketeers.atlassian.net/browse/VS-43)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  

**Input**: Feature specification from `/specs/026-media-route-handlers/spec.md`

---

## Summary

Implement two production-ready Next.js 16 App Router Route Handlers:
1. `POST /api/media/presigned-url` — validates session authentication, checks MIME whitelist and file size constraints, and issues short-lived (300s) presigned S3 PUT upload URLs.
2. `DELETE /api/media/delete` — enforces organizer/admin authorization, validates object key format, and idempotently deletes assets from S3.

Both endpoints return standard typed `ApiResponse<T>` envelopes (`apiSuccess` / `apiError`), await all Next.js 16 asynchronous request primitives, and leverage the core S3 library delivered in `VS-42`.

---

## Technical Context

**Language/Version**: TypeScript 5.9 / Node.js 20+  
**Primary Dependencies**: Next.js 16.0.7 (App Router), `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `zod`  
**Storage**: AWS S3 (`S3_MEDIA_BUCKET` in `AWS_REGION` ap-southeast-1)  
**Testing**: Vitest (`npm run test:unit`) with mock route handlers  
**Target Platform**: Next.js 16 Server / Node.js runtime  
**Project Type**: RESTful API Route Handlers (Web Service)  
**Performance Goals**: Presigned URL response latency < 35ms; unauthenticated rejection < 15ms  
**Constraints**: Zero unvalidated inputs; strict Zod parsing; standard `ApiResponse<T>` envelopes; no leaked credentials or stack traces  
**Scale/Scope**: Two dedicated route handler files under `src/app/api/media/`  

---

## Constitution Check

_GATE: All principles from VoteSphere Constitution (§I–§VI) must pass before implementation._

| Principle | Requirement | Plan Conformance | Status |
| :--- | :--- | :--- | :---: |
| **§I. Strict Type Safety** | No `any`, non-null assertions, strict Zod boundary parsing | Handlers parse bodies with `presignedUploadRequestSchema` and `deleteImageRequestSchema`. Full TypeScript strict mode. | ✅ PASS |
| **§II. Server-First & Boundary Isolation** | Async Next.js request APIs awaited; standard `ApiResponse<T>` returned | `await headers()`, `await cookies()`, `await request.json()`. Responses return `apiSuccess()` and `apiError()`. | ✅ PASS |
| **§III. State Separation** | Server state via TanStack Query; auth via Zustand/Cognito | Route handlers interact with stateless S3 and Cognito session. | ✅ PASS |
| **§IV. Secure-by-Design & Auth** | Authenticate via `getSession()`, role authorization, no raw `process.env` | Session verified via `getSession()`; delete requires `ORGANIZER`/`ADMIN`. Environment through `@/env`. | ✅ PASS |
| **§V. Colocation & Modularity** | Modular routes and shared libraries | Routes located under `src/app/api/media/`, consuming `@/lib/s3` and `@/lib/api/response`. | ✅ PASS |
| **§VI. Test-First Quality Gates** | Vitest unit tests covering all status codes | Mock test suites for presigned-url and delete routes in `tests/unit/api/`. | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/026-media-route-handlers/
├── spec.md              # Feature specification
├── plan.md              # This architecture plan
├── research.md          # Technical research & design decisions
├── data-model.md        # Schemas, interfaces & sequence diagrams
├── quickstart.md        # Verification and curl test guide
├── checklists/
│   └── requirements.md  # Quality verification checklist
└── contracts/
    ├── presigned-url-contract.json
    └── delete-media-contract.json
```

### Source Code & Test Layout

```text
src/
├── app/
│   └── api/
│       └── media/
│           ├── presigned-url/
│           │   └── route.ts     # POST /api/media/presigned-url
│           └── delete/
│               └── route.ts     # DELETE /api/media/delete
├── lib/
│   ├── s3/                      # Core storage service & validation (VS-42)
│   │   ├── client.ts
│   │   ├── validation.ts
│   │   ├── storage-service.ts
│   │   └── index.ts
│   ├── auth/
│   │   └── get-session.ts       # Session resolver
│   └── api/
│       └── response.ts          # apiSuccess / apiError helpers

tests/
└── unit/
    └── api/
        ├── media-presigned-url-route.test.ts   # POST /api/media/presigned-url tests
        └── media-delete-route.test.ts          # DELETE /api/media/delete tests
```

---

## Implementation Phases

### Phase 1: Test Suite Scaffolding (TDD Red Phase)
- Write `tests/unit/api/media-presigned-url-route.test.ts` covering:
  - 401 Unauthorized for unauthenticated requests
  - 400 Bad Request for malformed JSON
  - 400 Bad Request for disallowed MIME types (`application/pdf`)
  - 400 Bad Request for oversized file declarations
  - 200 OK with `uploadUrl`, `key`, `publicUrl`, `expiresIn: 300` for valid requests
  - 500 Internal Server Error when S3 throws
- Write `tests/unit/api/media-delete-route.test.ts` covering:
  - 401 Unauthorized when unauthenticated
  - 403 Forbidden for non-organizer/voter session
  - 400 Bad Request for empty or malformed key
  - 200 OK for successful idempotent deletion
  - 500 Internal Server Error when S3 throws

### Phase 2: Route Handler Implementation (Green Phase)
- Implement `src/app/api/media/presigned-url/route.ts`:
  - Await `getSession()`
  - Parse and validate JSON with `presignedUploadRequestSchema`
  - Call `generatePresignedUploadUrl(body)`
  - Return `apiSuccess(result, 200)`
- Implement `src/app/api/media/delete/route.ts`:
  - Await `getSession()`
  - Enforce role check: `session.role === "ORGANIZER" || session.role === "ADMIN"`
  - Parse and validate JSON with `deleteImageRequestSchema`
  - Call `deleteImageFromS3(body.key)`
  - Return `apiSuccess({ success: true, key: body.key }, 200)`

### Phase 3: Quality Gates & Verification
- Execute `npm run test:unit tests/unit/api/media-*.test.ts`
- Run `npm run typecheck`
- Run `npm run lint`
- Audit against VoteSphere Constitution (§I–§VI)
