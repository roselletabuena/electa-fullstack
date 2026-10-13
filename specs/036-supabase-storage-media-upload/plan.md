# Implementation Plan: Supabase Storage Media Upload Route & Presigned Client

**Feature ID**: `036-supabase-storage-media-upload`
**Jira Key**: `VS-104`

## 1. Architecture & Component Mapping

### Backend Layer
- `src/lib/supabase/client.ts` — Browser singleton client (`createBrowserClient()`)
- `src/lib/supabase/server.ts` — Server singleton client (`createServerSupabaseClient()`)
- `src/lib/supabase/storage-service.ts` — Storage operations (`uploadBannerToSupabase()`, `resolveBannerUrl()`, `getStoragePublicUrl()`)
- `src/app/api/media/supabase-upload/route.ts` — Route handler with `ApiResponse<T>` envelope validating auth via `requireMediaAuth()`, file boundaries, and storage upload.

### Client & Feature Layer
- `src/features/media/utils/supabase-upload-client.ts` — Client-side upload utility communicating with route and reporting accurate progress (0-100%).
- `src/features/media/hooks/use-image-upload.ts` — Enhanced hook supporting backend selection (`supabase` vs `s3`) with default to `supabase`.
- `src/features/media/components/ImageDropzone.tsx` — Dropzone UI with zero-radius styling, progress indicators, preview, and fallback.
- `public/placeholders/event-banner-default.webp` — Default brand geometric fallback asset.

## 2. Test Plan
- Unit tests under `tests/unit/media/supabase-storage.test.ts` testing:
  - File size boundary validation (≤ 10MB vs > 10MB)
  - MIME type validation (JPEG, PNG, WebP vs invalid)
  - Missing artwork fallback resolution
  - API route auth protection and error responses
