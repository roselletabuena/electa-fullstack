import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_BANNER_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const DEFAULT_BANNER_FALLBACK_URL = "/placeholders/event-banner-default.webp";

export const supabaseUploadRequestSchema = z.object({
  folder: z.enum(["events/banners", "events/logos", "contestants/avatars"]).default("events/banners"),
});

export const supabaseUploadResponseSchema = z.object({
  key: z.string().min(1, "Storage key is required"),
  publicUrl: z.string().url("Public URL must be a valid URL"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  contentType: z.string().min(1, "Content type is required"),
  bucket: z.string().default("events"),
});

export type SupabaseUploadResponse = z.infer<typeof supabaseUploadResponseSchema>;
