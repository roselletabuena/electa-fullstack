import { z } from 'zod';

export const mediaFolderSchema = z.enum([
  'events/banners',
  'events/logos',
  'contestants/avatars',
  'sponsors',
]);

export type MediaFolder = z.infer<typeof mediaFolderSchema>;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const uploadedMediaSchema = z.object({
  key: z.string().min(1, 'Media key is required'),
  publicUrl: z.string().url('Public URL must be a valid URL'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive('File size must be positive'),
  contentType: z.string().min(1, 'Content type is required'),
});

export type UploadedMedia = z.infer<typeof uploadedMediaSchema>;

export type UploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME_TYPE'
  | 'EMPTY_FILE'
  | 'PRESIGN_FAILED'
  | 'UPLOAD_FAILED'
  | 'ABORTED'
  | 'UNAUTHORIZED';

export interface UploadError {
  code: UploadErrorCode;
  message: string;
  retryable: boolean;
}

export type UploadStatus =
  | 'idle'
  | 'validating'
  | 'presigning'
  | 'uploading'
  | 'success'
  | 'error';

export interface UploadProgress {
  percentage: number;
  loadedBytes: number;
  totalBytes: number;
}

export interface UploadState {
  status: UploadStatus;
  progressPercent: number;
  loadedBytes: number;
  totalBytes: number;
  previewUrl: string | null;
  uploadedAsset: UploadedMedia | null;
  error: UploadError | null;
}

export interface ImageDropzoneProps {
  /** Target S3 storage folder category */
  folder: MediaFolder;
  /** Maximum allowed file size in bytes (defaults: 5MB for avatars, 10MB for banners) */
  maxSizeBytes?: number | undefined;
  /** Allowed MIME types (defaults to image/jpeg, image/png, image/webp) */
  allowedMimeTypes?: readonly string[] | undefined;
  /** Existing image URL to render as initial thumbnail */
  initialPreviewUrl?: string | undefined;
  /** Callback emitted when S3 upload finishes successfully */
  onUploadComplete?: ((asset: UploadedMedia) => void) | undefined;
  /** Optional callback emitted on error */
  onError?: ((error: UploadError) => void) | undefined;
  /** Optional callback emitted when user clicks remove */
  onRemove?: (() => void) | undefined;
  /** Disabled interaction state */
  disabled?: boolean | undefined;
  /** Accessible label description */
  label?: string | undefined;
  /** Helper text displayed below dropzone */
  helperText?: string | undefined;
  /** Additional CSS class names */
  className?: string | undefined;
}
