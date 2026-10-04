# Implementation Plan: Core S3 Storage Service & Presigned URL Generator

**Branch**: `025-s3-storage-service` | **Date**: 2026-10-05 | **Spec**: [spec.md](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/spec.md)

**Input**: Feature specification from `/specs/025-s3-storage-service/spec.md` (Jira: [VS-42](https://the-three-devsketeers.atlassian.net/browse/VS-42))

---

## Summary

Implement the foundational S3 media storage layer in `electa-fullstack/src/lib/s3/` to enable secure, direct-to-S3 browser uploads via short-lived (300s) presigned `PUT` URLs, along with server-side buffer uploads, idempotent asset deletions, and asset replacements. 

The service enforces strict boundary validation using Zod (MIME whitelist: `image/jpeg`, `image/png`, `image/webp`; configurable size ceilings up to 10MB), generates sanitized, collision-resistant UUID keys (`<folder>/<uuid>-<sanitized-filename>`), and constructs canonical virtual-hosted URLs targeting the dedicated S3 media bucket (`electa-dev-media-assets` in `ap-southeast-1`).

---

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode enabled, no `any`, no non-null assertions)  
**Primary Dependencies**: Next.js 16.3.2 (App Router), `@aws-sdk/client-s3` (^3.758.0), `@aws-sdk/s3-request-presigner` (^3.758.0), `zod` (^4.4.3), `@t3-oss/env-nextjs`  
**Storage**: AWS S3 (`electa-dev-media-assets`, regional endpoint `ap-southeast-1.amazonaws.com`)  
**Testing**: Vitest (`vitest run`), `@testing-library/react`, mocked AWS SDK v3 client calls  
**Target Platform**: Node.js 20+ runtime (Next.js server-side environment)  
**Project Type**: Core Backend / Service Utility Slice (`src/lib/s3/`)  
**Performance Goals**: Presigned URL generation response time `< 50ms` (no binary data streamed through server); sub-second deletion dispatch  
**Constraints**: Zero binary upload buffering through Next.js App Router server for client uploads; strict 300s expiration for presigned URLs; zero-tolerance for unwhitelisted MIME types (rejects SVG, PDF, HTML, EXE)  
**Scale/Scope**: Foundation for all event banner and contestant profile image uploads across hundreds of active events and thousands of contestants  

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Check | Status | Verification Notes |
| :--- | :--- | :---: | :--- |
| **§I. Strict Type Safety & Boundary Validation** | Non-negotiable TS strict mode. No `any`, `<any>`, or `!`. Validate all boundaries with Zod schemas. | **PASS** | `presignedUploadRequestSchema`, `bufferUploadRequestSchema`, and `deleteImageRequestSchema` validate all inputs via Zod. Strict TypeScript interfaces for all return types. |
| **§II. Server-First & Boundary Isolation** | RSC by default; isolated server actions and route handlers; standard `ApiResponse<T>` envelope. | **PASS** | `src/lib/s3/` runs strictly in Node.js server context. Any future API route handlers wrapping this will return `apiSuccess()` / `apiError()`. |
| **§III. Strict State Separation** | Prisma single source of truth for DB; TanStack Query for server data; no mirror in Zustand. | **PASS** | Storage service manages S3 object storage; database references will store only canonical S3 keys / public URLs. |
| **§IV. Secure-by-Design & Auth Integrity** | Access secrets through `@/env` only; no raw `process.env`. Session resolution via `getSession()`. | **PASS** | Bucket name and region are imported from `@/env`. Direct process.env access is forbidden by `env-validator`. |
| **§V. Modular Architecture & Named Exports** | Vertical slices; reusable primitives; named exports only. | **PASS** | All modules in `src/lib/s3/` (`client.ts`, `storage-service.ts`, `validation.ts`) use strictly named exports. |
| **§VI. Test-First & Quality Gates** | TDD with Vitest; code must pass typecheck, lint, and unit tests. | **PASS** | Unit test suite defined in `tests/unit/storage/s3-storage-service.test.ts` covering validation, signing, key generation, and error conditions. |

---

## Project Structure

### Documentation (this feature)

```text
electa-fullstack/specs/025-s3-storage-service/
├── spec.md              # Requirements and user scenarios
├── plan.md              # This implementation plan
├── research.md          # Phase 0 AWS SDK v3 & security research
├── data-model.md        # Phase 1 entities, schemas, and types
├── quickstart.md        # Phase 1 quickstart & verification guide
├── contracts/           # Phase 1 API contracts
│   └── presigned-url-contract.json
└── tasks.md             # Phase 2 task checklist (generated via /speckit-tasks)
```

### Source Code (Repository Root: `electa-fullstack/`)

```text
electa-fullstack/
├── src/
│   ├── env.ts                       # Environment variable validation schema (AWS_REGION, S3_MEDIA_BUCKET)
│   └── lib/
│       └── s3/
│           ├── client.ts            # S3 client singleton with credential resolution
│           ├── validation.ts        # Zod validation schemas & key sanitization logic
│           ├── storage-service.ts   # Core storage service (presigned URLs, buffer upload, delete, replace)
│           └── index.ts             # Barrel export for S3 library
└── tests/
    └── unit/
        └── storage/
            ├── s3-validation.test.ts        # Unit tests for MIME, size, and sanitization
            └── s3-storage-service.test.ts   # Unit tests for presigned URLs, buffer uploads, deletion
```

---

## Phase 0: Research Outline & Decisions

All research items have been resolved in [research.md](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/research.md):
1. **SDK Choice**: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` (AWS SDK v3).
2. **Method**: Presigned HTTP `PUT` with signed `ContentType` header and 300s expiration.
3. **MIME Restriction**: Whitelist restricted strictly to `image/jpeg`, `image/png`, and `image/webp`.
4. **Key Partitioning**: `<folder>/<uuid>-<sanitized-filename>` with directory traversal protection.
5. **Public URL Strategy**: Canonical virtual-hosted S3 URL via `getS3PublicUrl(key)`.
6. **Idempotency**: S3 `DeleteObjectCommand` is inherently idempotent; error suppression for missing keys.
7. **Mocking**: Vitest mocks for AWS SDK commands without live AWS network calls during tests.

---

## Phase 1: Data Model & Contracts

Detailed in [data-model.md](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/data-model.md) and [presigned-url-contract.json](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/contracts/presigned-url-contract.json):
- Zod Schemas: `presignedUploadRequestSchema`, `bufferUploadRequestSchema`, `deleteImageRequestSchema`, `replaceImageRequestSchema`.
- Types: `PresignedUploadRequest`, `PresignedUploadResponse`, `BufferUploadRequest`, `BufferUploadResponse`, `DeleteImageResponse`, `ReplaceImageResponse`.
- Functions: `generatePresignedUploadUrl()`, `uploadImageBuffer()`, `deleteImageFromS3()`, `replaceImage()`, `generateS3Key()`, `getS3PublicUrl()`.

---

## Implementation Strategy (Upcoming in Phase 2 & 3)

1. **Dependency Installation**: Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` in `electa-fullstack`.
2. **Validation & Utilities**: Implement `src/lib/s3/validation.ts` (Zod schemas, `generateS3Key`, `getS3PublicUrl`).
3. **S3 Client Singleton**: Implement `src/lib/s3/client.ts` consuming `@/env`.
4. **Core Service**: Implement `src/lib/s3/storage-service.ts` with `generatePresignedUploadUrl`, `uploadImageBuffer`, `deleteImageFromS3`, `replaceImage`.
5. **Testing**: Write comprehensive unit tests in `tests/unit/storage/s3-validation.test.ts` and `tests/unit/storage/s3-storage-service.test.ts`.
6. **Verification Gate**: Execute `npm run typecheck`, `npm run lint`, and `npm run test:unit`.

---

## Complexity Tracking

No constitution violations or excessive complexity detected. The solution cleanly isolates AWS SDK logic inside `src/lib/s3/` without introducing external state or circular dependencies.
