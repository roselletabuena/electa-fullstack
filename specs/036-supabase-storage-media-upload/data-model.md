# Data Model: Supabase Storage Media Upload Route & Presigned Client

**Feature**: `036-supabase-storage-media-upload`
**Jira Key**: `VS-104`
**Date**: 2026-10-13

## 1. Entities & Data Structures

### Storage Payload & Response DTOs

```typescript
export interface SupabaseUploadPayload {
  file: File | Blob;
  folder?: 'events/banners' | 'events/logos' | 'contestants/avatars';
}

export interface SupabaseUploadResult {
  key: string;              // e.g. "banners/1741829000-abc12345.webp"
  publicUrl: string;        // Fully qualified public CDN URL
  fileName: string;
  fileSize: number;
  contentType: string;
  bucket: string;           // "events"
}

export interface SupabaseStorageError {
  code: 'FILE_TOO_LARGE' | 'INVALID_MIME_TYPE' | 'EMPTY_FILE' | 'UNAUTHORIZED' | 'UPLOAD_FAILED';
  message: string;
  retryable: boolean;
}
```

### Storage Configuration Schema

```typescript
export interface StorageBucketConfig {
  bucketName: 'events';
  allowedMimeTypes: readonly ['image/jpeg', 'image/png', 'image/webp'];
  maxSizeBytes: 10485760; // 10MB
  defaultFallbackUrl: '/placeholders/event-banner-default.webp';
}
```

## 2. Invariants & Validation Rules

1. **Size Invariant**: File size MUST be strictly `> 0` bytes and `<= 10,485,760` bytes (10MB).
2. **MIME Invariant**: Content-Type MUST be an exact match in `['image/jpeg', 'image/png', 'image/webp']`.
3. **Session Invariant**: Organizer must have valid session verified by `getSession()`.
4. **Key Pattern Invariant**: All uploads under `events` bucket MUST be prefixed with `banners/` (or designated subfolder) and have random salt/uuid to prevent collision and cache collisions.
5. **Fallback Invariant**: If input URL is `null`, `undefined`, or empty string `""`, `resolveBannerUrl()` resolves to `/placeholders/event-banner-default.webp`.
