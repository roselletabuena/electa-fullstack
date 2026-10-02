# Research & Architecture Decisions: S3 Bucket Implementation

**Feature**: `014-s3-bucket-implementation`
**Date**: 2026-10-02

## Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                             |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)         |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`       |
| Server State  | TanStack Query — never mirror server data in Zustand                    |
| Client State  | Zustand `auth-store` for session only                                   |
| URL State     | nuqs for search params, pagination, filters                             |
| Forms         | React Hook Form + Zod (`zodResolver`)                                   |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                     |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                 |

## Technical Decisions & Rationale

### 1. Direct-to-S3 Uploads via Pre-signed PUT URLs

- **Decision**: Generate short-lived (300 seconds / 5 minutes) pre-signed PUT URLs on the server using `@aws-sdk/s3-request-presigner` and upload directly from the browser using standard `fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })`.
- **Rationale**: Keeps binary payloads off the Next.js serverless and Node.js runtimes. Prevents memory spikes and avoids server request body limits (e.g. 4.5MB on Vercel/serverless edge).
- **Alternatives Considered**: 
  - *Proxying files through Next.js Route Handlers*: High server memory consumption, potential timeouts on slow uplinks.
  - *AWS S3 POST Presigned Policies*: More complex client-side FormData construction with little added benefit over simple PUT requests.

### 2. AWS SDK Client Configuration & Offline Fallback

- **Decision**: Initialize an `S3Client` singleton in `src/lib/s3/client.ts` configured with `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and optional `AWS_ENDPOINT_URL` (supporting LocalStack or MinIO for local development).
- **Rationale**: Matches the existing architecture of the Prisma singleton in `src/lib/db.ts` and allows seamless transitions between local offline emulation and cloud deployment.
- **Alternatives Considered**:
  - *Hardcoding AWS endpoint URLs*: Breaks LocalStack and private S3 setups.

### 3. Object Key Partitioning & Content Security

- **Decision**: Construct deterministic, collision-proof keys:
  - Event Banners: `events/${eventId}/banners/${crypto.randomUUID()}.${extension}`
  - Contestant Photos: `contestants/${contestantId}/avatars/${crypto.randomUUID()}.${extension}`
  - Generic Media: `uploads/${entityType}/${entityId}/${crypto.randomUUID()}.${extension}`
- **Rationale**: Strict partitioning allows fine-grained IAM bucket policies, prevents accidental overwrites or collisions, and enables atomic deletion of event assets when an event is purged.
- **Alternatives Considered**:
  - *Using original client filenames*: High risk of collisions, directory traversal attacks, and encoding issues.

### 4. MIME Type & File Size Validation Guardrails

- **Decision**: Enforce validation before issuing pre-signed URLs using Zod:
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
  - Max File Sizes: Banners: 10MB; Avatars/Profiles: 5MB; Badges: 2MB.
- **Rationale**: Prevents users from abusing presigned upload capabilities with unapproved file types (e.g. executables or massive video archives).
- **Alternatives Considered**:
  - *Validating after upload via S3 Lambda triggers*: Reactive rather than proactive; wastes storage and requires extra cloud infrastructure.

### 5. Next.js Image Optimization Configuration

- **Decision**: Add S3 bucket host pattern (and CloudFront/LocalStack host patterns) into `next.config.ts` under `images.remotePatterns`.
- **Rationale**: Next.js `<Image />` component requires whitelisted domains to prevent security vulnerabilities and SSRF attacks.
- **Alternatives Considered**:
  - *Rendering unoptimized HTML `<img>` tags*: Violates Constitution §VI / Design Standards ("All images MUST use Next.js `<Image>` for automatic optimization").
