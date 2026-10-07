import type { UploadError } from '../types';

export interface ValidateImageOptions {
  maxSizeBytes: number;
  allowedMimeTypes?: readonly string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: UploadError;
}

/**
 * Validates file parameters client-side before presigning and S3 upload.
 */
export function validateImageFile(
  file: File,
  options: ValidateImageOptions
): ValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'Selected file is empty or corrupted.',
        retryable: false,
      },
    };
  }

  const allowed = options.allowedMimeTypes ?? [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!allowed.includes(file.type)) {
    const formattedTypes = allowed
      .map((mime) => mime.replace('image/', ''))
      .join(', ');
    return {
      valid: false,
      error: {
        code: 'INVALID_MIME_TYPE',
        message: `Unsupported file format. Please upload ${formattedTypes}.`,
        retryable: false,
      },
    };
  }

  if (file.size > options.maxSizeBytes) {
    const maxMb = Math.round(options.maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds the maximum limit of ${maxMb}MB.`,
        retryable: false,
      },
    };
  }

  return { valid: true };
}
