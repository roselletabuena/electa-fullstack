import { describe, it, expect } from 'vitest';
import { validateImageFile } from '@/features/media/utils/client-validation';

describe('validateImageFile', () => {
  it('returns valid: true for an allowed JPEG within size limits', () => {
    const file = new File(['binary-content'], 'photo.jpg', {
      type: 'image/jpeg',
    });
    const result = validateImageFile(file, {
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects an empty zero-byte file', () => {
    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file, {
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg'],
    });

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('EMPTY_FILE');
    expect(result.error?.message).toContain('empty or corrupted');
  });

  it('rejects forbidden MIME type with descriptive list of allowed types', () => {
    const file = new File(['content'], 'doc.pdf', {
      type: 'application/pdf',
    });
    const result = validateImageFile(file, {
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('INVALID_MIME_TYPE');
    expect(result.error?.message).toContain('jpeg, png, webp');
  });

  it('rejects file exceeding maxSizeBytes', () => {
    // 6MB buffer
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const file = new File([largeContent], 'large.png', { type: 'image/png' });
    const result = validateImageFile(file, {
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/png'],
    });

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('FILE_TOO_LARGE');
    expect(result.error?.message).toContain('5MB');
  });
});
