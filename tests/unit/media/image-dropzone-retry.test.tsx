import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageDropzone } from '@/features/media/components/ImageDropzone';
import * as useImageUploadModule from '@/features/media/hooks/use-image-upload';

describe('ImageDropzone retry and cancel interaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders cancel button during upload and triggers cancelUpload when clicked', () => {
    const cancelMock = vi.fn();
    vi.spyOn(useImageUploadModule, 'useImageUpload').mockReturnValue({
      status: 'uploading',
      progressPercent: 30,
      loadedBytes: 300,
      totalBytes: 1000,
      previewUrl: 'blob:mock',
      uploadedAsset: null,
      error: null,
      isUploading: true,
      uploadFile: vi.fn(),
      cancelUpload: cancelMock,
      retryUpload: vi.fn(),
      reset: vi.fn(),
    });

    render(<ImageDropzone folder="events/banners" />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(cancelMock).toHaveBeenCalled();
  });

  it('renders retry button on retryable error and triggers retryUpload when clicked', () => {
    const retryMock = vi.fn();
    vi.spyOn(useImageUploadModule, 'useImageUpload').mockReturnValue({
      status: 'error',
      progressPercent: 0,
      loadedBytes: 0,
      totalBytes: 0,
      previewUrl: null,
      uploadedAsset: null,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Upload failed. Please check connection and retry.',
        retryable: true,
      },
      isUploading: false,
      uploadFile: vi.fn(),
      cancelUpload: vi.fn(),
      retryUpload: retryMock,
      reset: vi.fn(),
    });

    render(<ImageDropzone folder="events/banners" />);

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(retryMock).toHaveBeenCalled();
  });
});
