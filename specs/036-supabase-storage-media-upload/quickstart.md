# Quickstart & Verification Guide: Supabase Storage Media Upload Route & Presigned Client

## 1. Overview & Setup
Prerequisites:
- Worktree branch: `feature/VS-104-supabase-storage-media-upload`
- Valid `.env.local` containing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 2. Verification Scenarios

### Scenario A: Happy Path Banner Upload
1. Instantiate `ImageDropzone` with `folder="events/banners"`.
2. Select a valid banner file (`banner.png`, 1.5MB).
3. Observe upload progress bar progressing from 0% to 100%.
4. Verify returned public URL matches Supabase storage public CDN URL.

### Scenario B: Oversized & Invalid File Rejection
1. Select a file exceeding 10MB or a non-image file (`document.pdf`).
2. Verify upload is blocked before network dispatch with error message `File exceeds maximum size of 10MB` or `Unsupported file type`.

### Scenario C: Fallback Artwork Resolution
1. When no custom banner URL is provided or an empty string is submitted, call `resolveBannerUrl(undefined)`.
2. Verify the returned URL is `/placeholders/event-banner-default.webp`.

## 3. Automated Test Suite Execution

```bash
npm run typecheck
npm run lint
npm run test:unit tests/unit/media/
```
