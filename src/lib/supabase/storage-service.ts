import { createServerSupabaseClient } from "./server";
import { randomUUID } from "node:crypto";
import type { UploadedMedia } from "@/features/media/types";

export const MAX_BANNER_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const DEFAULT_BANNER_FALLBACK_URL = "/placeholders/event-banner-default.webp";
export const EVENTS_STORAGE_BUCKET = "events";

export interface FileValidationResult {
  valid: boolean;
  code?: "EMPTY_FILE" | "FILE_TOO_LARGE" | "INVALID_MIME_TYPE";
  error?: string;
}

/**
 * Validates file size and MIME type for event banner uploads.
 */
export function validateBannerFile(file: { size: number; type: string }): FileValidationResult {
  if (file.size <= 0) {
    return {
      valid: false,
      code: "EMPTY_FILE",
      error: "File is empty (0 bytes).",
    };
  }

  if (file.size > MAX_BANNER_FILE_SIZE) {
    return {
      valid: false,
      code: "FILE_TOO_LARGE",
      error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const isValidType = ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType);
  if (!isValidType) {
    return {
      valid: false,
      code: "INVALID_MIME_TYPE",
      error: `Unsupported image format (${file.type}). Allowed: JPEG, PNG, WebP.`,
    };
  }

  return { valid: true };
}

/**
 * Resolves an event banner URL, providing the brand fallback gradient if missing or blank.
 */
export function resolveBannerUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return DEFAULT_BANNER_FALLBACK_URL;
  }
  return url.trim();
}

/**
 * Resolves the public CDN URL for an object stored in Supabase Storage.
 */
export function getStoragePublicUrl(bucket: string, path: string): string {
  const supabase = createServerSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export interface UploadBannerParams {
  file: Buffer | ArrayBuffer | Blob;
  fileName: string;
  contentType: string;
  folder?: string;
}

/**
 * Uploads an event banner directly to the Supabase Storage events bucket.
 */
export async function uploadBannerToSupabase({
  file,
  fileName,
  contentType,
  folder = "banners",
}: UploadBannerParams): Promise<UploadedMedia> {
  const validation = validateBannerFile({
    size: file instanceof Blob ? file.size : file.byteLength,
    type: contentType,
  });

  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  const supabase = createServerSupabaseClient();
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "webp";
  const defaultName = "banner." + (extension || "webp");
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_") || defaultName;
  const uniqueKey = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from(EVENTS_STORAGE_BUCKET)
    .upload(uniqueKey, file, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase storage upload error: ${uploadError.message}`);
  }

  const publicUrl = getStoragePublicUrl(EVENTS_STORAGE_BUCKET, uniqueKey);
  const fileSize = file instanceof Blob ? file.size : file.byteLength;

  return {
    key: uniqueKey,
    publicUrl,
    fileName,
    fileSize,
    contentType,
  };
}
