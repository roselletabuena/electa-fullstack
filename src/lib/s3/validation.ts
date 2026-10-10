import { z } from "zod";
import { env } from "@/env";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

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

export const presignedUploadRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "File name must not be empty")
    .max(255, "File name must not exceed 255 characters")
    .refine((val) => !/[\\/]/.test(val) && !val.includes(".."), {
      message: "File name must not contain directory paths or path traversal tokens",
    }),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
  }),
  folder: z
    .string()
    .trim()
    .min(1, "Target folder must not be empty")
    .regex(/^[a-zA-Z0-9_\-/]+$/, "Folder must be URL-safe without special characters")
    .refine((val) => !val.includes(".."), {
      message: "Folder path must not contain traversal characters",
    }),
  maxSizeBytes: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be greater than zero")
    .max(
      BANNER_MAX_SIZE_BYTES,
      `File size exceeds maximum allowed (${BANNER_MAX_SIZE_BYTES / (1024 * 1024)}MB)`,
    )
    .optional(),
});

export type PresignedUploadRequest = z.infer<typeof presignedUploadRequestSchema>;

export const bufferUploadRequestSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Key is required")
    .regex(/^[a-zA-Z0-9_\-/.]+$/, "Key must be a valid S3 path")
    .refine((val) => !val.includes(".."), {
      message: "Key must not contain traversal characters",
    }),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
  }),
  buffer: z.custom<Buffer>((data) => typeof Buffer !== "undefined" && Buffer.isBuffer(data), {
    message: "Payload must be a valid Buffer",
  }),
});

export type BufferUploadRequest = z.infer<typeof bufferUploadRequestSchema>;

export const deleteImageRequestSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Key must not be empty")
    .regex(/^[a-zA-Z0-9_\-/.]+$/, "Key must be a valid S3 path")
    .refine((val) => !val.includes(".."), {
      message: "Key must not contain traversal characters",
    }),
});

export type DeleteImageRequest = z.infer<typeof deleteImageRequestSchema>;

export const replaceImageRequestSchema = z.object({
  oldKey: z.string().trim().min(1).optional().nullable(),
  newKey: z
    .string()
    .trim()
    .min(1, "newKey is required")
    .regex(/^[a-zA-Z0-9_\-/.]+$/, "newKey must be a valid S3 path")
    .refine((val) => !val.includes(".."), {
      message: "newKey must not contain traversal characters",
    }),
});

export type ReplaceImageRequest = z.infer<typeof replaceImageRequestSchema>;

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
  contentType: AllowedMimeType;
}

export interface BufferUploadResponse {
  key: string;
  publicUrl: string;
}

export interface ReplaceImageResponse {
  success: boolean;
  deletedKey: string | null;
  activeKey: string;
}

export interface DeleteImageResponse {
  success: boolean;
  key: string;
}

/**
 * Sanitizes a client-provided file name and generates a collision-resistant S3 key.
 *
 * Example:
 *   generateS3Key("events/banners", "Grand Prix 2026! (FINAL).PNG")
 *   => "events/banners/<uuid>-grand-prix-2026-final.png"
 */
export function generateS3Key(folder: string, fileName: string): string {
  // Strip path traversal and directory separators
  const baseNameWithoutPath = fileName.split(/[\\/]/).pop() ?? fileName;

  // Split extension
  const lastDotIndex = baseNameWithoutPath.lastIndexOf(".");
  let rawName = baseNameWithoutPath;
  let ext = "";

  if (lastDotIndex > 0) {
    rawName = baseNameWithoutPath.slice(0, lastDotIndex);
    ext = baseNameWithoutPath.slice(lastDotIndex + 1).toLowerCase();
  }

  // Normalize and sanitize base name
  const sanitizedBase = rawName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-zA-Z0-9_-]/g, "-") // replace non-alphanumeric with hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, "") // trim boundary hyphens
    .toLowerCase();

  const finalName = sanitizedBase || "asset";
  const cleanExt = ext ? `.${ext}` : "";
  const uuid = crypto.randomUUID();

  // Normalize folder prefix (strip leading/trailing slashes)
  const cleanFolder = folder.split("/").filter(Boolean).join("/");

  return `${cleanFolder}/${uuid}-${finalName}${cleanExt}`;
}

/**
 * Constructs the canonical public virtual-hosted S3 URL for a given object key.
 */
export function getS3PublicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  return `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`;
}
