# Data Model & Schema Specification: Core S3 Storage Service

**Feature Branch**: `025-s3-storage-service`  
**Date**: 2026-10-05  
**Spec**: [spec.md](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/spec.md)

---

## 1. Entities & Types

### 1.1 MIME & Folder Constants

```typescript
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const STORAGE_FOLDERS = [
  "events/banners",
  "contestants/avatars",
  "system/generated",
] as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[number] | (string & {});

export const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const BANNER_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const PRESIGNED_URL_EXPIRATION_SECONDS = 300; // 5 minutes
```

---

### 1.2 Zod Validation Schemas

```typescript
import { z } from "zod";

/**
 * Validates request payload for presigned upload URL generation
 */
export const presignedUploadRequestSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name must not be empty")
    .max(255, "File name must not exceed 255 characters")
    .regex(/^[^\\/]+$/, "File name must not contain path separators"),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
  }),
  folder: z
    .string()
    .min(1, "Target folder must not be empty")
    .regex(/^[a-zA-Z0-9_\-\/]+$/, "Folder must be URL-safe"),
  fileSize: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be greater than zero")
    .max(BANNER_MAX_SIZE_BYTES, `File size exceeds maximum allowed (${BANNER_MAX_SIZE_BYTES / (1024 * 1024)}MB)`)
    .optional(),
});

export type PresignedUploadRequest = z.infer<typeof presignedUploadRequestSchema>;

/**
 * Validates direct buffer upload request
 */
export const bufferUploadRequestSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-zA-Z0-9_\-\/\.]+$/, "Key must be a valid S3 path"),
  contentType: z.enum(ALLOWED_MIME_TYPES),
  buffer: z.instanceof(Buffer, { message: "Payload must be a valid Buffer" }),
});

export type BufferUploadRequest = z.infer<typeof bufferUploadRequestSchema>;

/**
 * Validates asset deletion request
 */
export const deleteImageRequestSchema = z.object({
  key: z
    .string()
    .min(1, "Key must not be empty")
    .regex(/^[a-zA-Z0-9_\-\/\.]+$/, "Key must be a valid S3 path"),
});

export type DeleteImageRequest = z.infer<typeof deleteImageRequestSchema>;

/**
 * Validates asset replacement request
 */
export const replaceImageRequestSchema = z.object({
  oldKey: z
    .string()
    .min(1)
    .optional()
    .nullable(),
  newKey: z
    .string()
    .min(1, "newKey is required"),
});

export type ReplaceImageRequest = z.infer<typeof replaceImageRequestSchema>;
```

---

### 1.3 Response Contracts & Interfaces

```typescript
/**
 * Returned to callers requesting a presigned PUT URL
 */
export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
  contentType: AllowedMimeType;
}

/**
 * Returned upon direct server buffer upload
 */
export interface BufferUploadResponse {
  key: string;
  publicUrl: string;
}

/**
 * Returned upon asset replacement
 */
export interface ReplaceImageResponse {
  success: boolean;
  deletedKey: string | null;
  activeKey: string;
}

/**
 * Returned upon asset deletion
 */
export interface DeleteImageResponse {
  success: boolean;
  key: string;
}
```

---

## 2. Key Generation & Sanitization Logic

```typescript
/**
 * Sanitizes a client-provided file name and attaches a collision-resistant UUID prefix.
 * 
 * Rules:
 * 1. Normalize characters to NFKD and strip accents.
 * 2. Convert spaces and non-alphanumeric chars (except dots) to hyphens.
 * 3. Collapse multiple consecutive hyphens into one.
 * 4. Convert to lowercase.
 * 5. Prepend crypto.randomUUID().
 * 
 * Example:
 * Input: folder = "events/banners", fileName = "Grand Prix 2026! (FINAL).PNG"
 * Output: "events/banners/550e8400-e29b-41d4-a716-446655440000-grand-prix-2026-final.png"
 */
export function generateS3Key(folder: string, fileName: string): string;
```

---

## 3. Public URL Resolution Logic

```typescript
/**
 * Resolves the canonical virtual-hosted S3 URL for a given object key.
 * 
 * Pattern: `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
 */
export function getS3PublicUrl(key: string): string;
```
