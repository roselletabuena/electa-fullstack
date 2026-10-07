import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from '@/features/media/hooks/use-image-upload';
import * as s3ClientModule from '@/features/media/utils/s3-upload-client';

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:http://localhost/mock-uuid'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('initializes with idle state and initialPreviewUrl if provided', () => {
    const { result } = renderHook(() =>
      useImageUpload({
        folder: 'events/banners',
        initialPreviewUrl: 'https://example.com/initial.jpg',
      })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.previewUrl).toBe('https://example.com/initial.jpg');
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.uploadedAsset).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('successfully fetches presigned URL, executes S3 upload, and triggers onUploadComplete', async () => {
    const onUploadComplete = vi.fn();
    const mockPresignResponse = {
      success: true,
      data: {
        uploadUrl: 'https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/test-key.jpg?signed=1',
        key: 'events/banners/123-test-key.jpg',
        publicUrl: 'https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/123-test-key.jpg',
        expiresIn: 300,
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPresignResponse,
      })
    );

    const mockUploadHandle = {
      promise: Promise.resolve(),
      abort: vi.fn(),
    };
    const uploadSpy = vi
      .spyOn(s3ClientModule, 'uploadToS3WithProgress')
      .mockReturnValue(mockUploadHandle);

    const { result } = renderHook(() =>
      useImageUpload({
        folder: 'events/banners',
        onUploadComplete,
      })
    );

    const validFile = new File(['image-content-bytes'], 'banner.jpg', {
      type: 'image/jpeg',
    });

    await act(async () => {
      await result.current.uploadFile(validFile);
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/media/presigned-url',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'banner.jpg',
          contentType: 'image/jpeg',
          folder: 'events/banners',
        }),
      })
    );

    expect(uploadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: mockPresignResponse.data.uploadUrl,
        file: validFile,
        contentType: 'image/jpeg',
      })
    );

    expect(result.current.status).toBe('success');
    expect(result.current.uploadedAsset).toEqual({
      key: 'events/banners/123-test-key.jpg',
      publicUrl: mockPresignResponse.data.publicUrl,
      fileName: 'banner.jpg',
      fileSize: validFile.size,
      contentType: 'image/jpeg',
    });
    expect(onUploadComplete).toHaveBeenCalledWith(result.current.uploadedAsset);
  });

  it('sets error state if presigned URL request fails with 401', async () => {
    const onError = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ success: false, error: 'Unauthorized' }),
      })
    );

    const { result } = renderHook(() =>
      useImageUpload({
        folder: 'contestants/avatars',
        onError,
      })
    );

    const validFile = new File(['avatar-bytes'], 'avatar.png', {
      type: 'image/png',
    });

    await act(async () => {
      await result.current.uploadFile(validFile);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('UNAUTHORIZED');
    expect(onError).toHaveBeenCalled();
  });
});
