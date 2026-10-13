# Research & Architecture Decisions: Supabase Storage Media Upload Route & Presigned Client

**Feature**: `036-supabase-storage-media-upload`
**Jira Key**: `VS-104`
**Date**: 2026-10-13

## Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                             |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)         |
| Storage       | Supabase Storage (`events` bucket, `banners/` prefix)                   |
| Auth          | AWS Cognito / Local session via `getSession()` from `src/lib/auth/get-session.ts` |
| Server State  | TanStack Query — never mirror server data in Zustand                    |
| Client State  | Zustand `auth-store` for session only                                   |
| Forms         | React Hook Form + Zod (`zodResolver`)                                   |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                     |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                 |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

## Technical Decisions & Rationale

### 1. Upload Strategy: Direct Multipart Upload vs. Storage API
- **Decision**: Provide both a server-side route handler `POST /api/media/supabase-upload` accepting `multipart/form-data` for guaranteed session-verified server proxy upload, and client utility `uploadToSupabaseStorage` with direct Supabase client options.
- **Rationale**: Server-side route handler guarantees full authentication checking via `getSession()` without exposing Supabase service role keys to client. Client direct upload can also be utilized for high-throughput with progress reporting using signed upload tokens or client standard upload.
- **Alternatives Considered**: S3 presigned PUT URLs (legacy; relies on AWS infrastructure which is not desired for local Supabase Docker / lightweight deployments).

### 2. Client & Service Singleton Architecture
- **Decision**:
  - `src/lib/supabase/client.ts`: Exports `createBrowserClient()` returning `@supabase/supabase-js` client instance initialized with `env.NEXT_PUBLIC_SUPABASE_URL` and `env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `src/lib/supabase/server.ts`: Exports `createServerSupabaseClient()` with service role or anon key.
  - `src/lib/supabase/storage-service.ts`: Exports business logic: `uploadBannerToSupabase()`, `getPublicUrl()`, and validation helpers.
- **Rationale**: Isolates Supabase client instantiation into canonical locations compliant with Constitution §III & §V.

### 3. Fallback Artwork Architecture
- **Decision**: Provide `/placeholders/event-banner-default.webp` statically in `public/placeholders/`, and utility helper `getEventBannerFallbackUrl()` or `resolveBannerUrl(customUrl?: string | null)`.
- **Rationale**: Guarantees zero broken banner images across event cards, hero sections, and preview headers while keeping payload submission valid even when organizer skips artwork upload.
