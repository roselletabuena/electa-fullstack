# Implementation Plan: AWS S3 Object Storage Integration & Pre-Signed Uploads

**Branch**: `014-s3-bucket-implementation` | **Date**: 2026-10-02 | **Spec**: [`specs/014-s3-bucket-implementation/spec.md`](file:///c:/Users/russel/workspace/vote-sphere/specs/014-s3-bucket-implementation/spec.md)

**Input**: Feature specification from [`specs/014-s3-bucket-implementation/spec.md`](file:///c:/Users/russel/workspace/vote-sphere/specs/014-s3-bucket-implementation/spec.md)

---

## Summary

Implement a production-grade, secure, and developer-friendly **AWS S3 Object Storage Integration** for Electa/VoteSphere. The architecture enables client applications (e.g. event creation, organizer branding settings, contestant profile showcases) to upload images directly to AWS S3 (or LocalStack/MinIO in offline development) using authenticated, short-lived pre-signed PUT URLs. This keeps heavy binary streams off the Next.js server runtime, validates MIME types and file sizes prior to signing, prevents key collisions via UUID namespacing, and registers trusted domains in `next.config.ts` to ensure seamless `next/image` rendering.

---

## Technical Context

**Language/Version**: TypeScript 5 Strict Mode | Node.js 20+  
**Framework**: Next.js 16.3.2 (App Router, Turbopack, Server Actions & Route Handlers)  
**Primary Dependencies**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `zod`, `@t3-oss/env-nextjs`  
**Storage**: AWS S3 (or LocalStack S3 for offline dev), PostgreSQL via Prisma 7 singleton  
**Testing**: Vitest 4 (`tests/unit/s3-bucket-implementation/`)  
**Target Platform**: Edge & Node.js Server Runtime + Modern Web Browsers  
**Performance Goals**: < 150ms pre-signed URL generation latency; zero Next.js server memory bloat from multi-megabyte image streaming  
**Constraints**: Max banner size 10MB; max avatar/photo size 5MB; supported MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`; no raw `process.env`.

---

## Constitution Check

- **§I. Type Safety & Boundary Validation**: Pre-signed URL requests, upload confirmations, and S3 config DTOs are strictly validated via Zod schemas. No `any` and no non-null assertions (`!`).
- **§II. Server-First & Boundary Isolation**: Pre-signed URLs are created via Server Actions / Route Handlers requiring session auth. Direct client uploads use browser standard `fetch(PUT)`.
- **§III. State Separation**: S3 asset URLs stored in PostgreSQL via Prisma. Client upload status managed via React hooks; no binary blobs in Zustand.
- **§IV. Secure-by-Design & Auth Integrity**: Only authenticated organizers/users can request pre-signed upload keys. AWS credentials (`AWS_S3_BUCKET_NAME`, `AWS_REGION`, etc.) are validated via `src/env.ts` and never exposed on the client.
- **§V. Feature Colocation**: All upload actions, hooks, and types colocated in `src/features/s3-bucket-implementation/`; reusable S3 client singleton located in `src/lib/s3/client.ts`.
- **§VI. Test-First Quality Gates**: Vitest unit tests in `tests/unit/s3-bucket-implementation/` covering key generation, MIME/size validation, and URL signing.

---

## Project Structure

```text
src/
├── env.ts                                           # AWS S3 env schema additions
├── lib/
│   └── s3/
│       ├── client.ts                                # AWS S3Client singleton
│       └── presigner.ts                             # S3 pre-signed PUT/GET generator
├── features/
│   └── s3-bucket-implementation/
│       ├── actions/
│       │   └── generate-upload-url-action.ts        # Server action for presigned URL request
│       ├── hooks/
│       │   └── use-s3-upload.ts                     # React hook for client-side direct upload
│       ├── types/
│       │   ├── index.ts                             # TypeScript DTOs & interfaces
│       │   └── validation.ts                        # Zod schemas for upload requests
│       ├── utils/
│       │   └── s3-key-builder.ts                    # Structured key naming & partition logic
│       └── index.ts                                 # Barrel export
└── app/
    └── api/
        └── s3-bucket-implementation/
            └── route.ts                             # REST Route Handler for upload pre-signing

tests/
└── unit/
    └── s3-bucket-implementation/
        ├── s3-validation.test.ts                    # Zod file type and size validation tests
        ├── s3-key-builder.test.ts                   # Object key partitioning & UUID sanitization tests
        └── presigner.test.ts                        # Presigned URL generation unit tests
```

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| None | All principles satisfied | Standard pre-signed PUT architecture aligns with Next.js 16 server-first design. |
