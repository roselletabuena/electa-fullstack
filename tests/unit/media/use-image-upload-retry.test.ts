import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from '@/features/media/hooks/use-image-upload';
import * as s3ClientModule from '@/features/media/utils/s3-upload-client';

describe('useImageUpload retry and abort', () => {
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

  it('cancels active upload and resets progress percent when cancelUpload is called', async () => {
    const abortSpy = vi.fn();
    vi.spyOn(s3ClientModule, 'uploadToS3WithProgress').mockReturnValue({
      promise: new Promise(() => {}), // never resolves
      abort: abortSpy,
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            uploadUrl: 'https://example.com/upload',
            key: 'k',
            publicUrl: 'u',
          },
        }),
      })
    );

    const { result } = renderHook(() =>
      useImageUpload({ folder: 'events/banners' })
    );

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    // Start upload
    act(() => {
      result.current.uploadFile(file);
    });

    // Wait a tick
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.cancelUpload();
    });

    expect(abortSpy).toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    expect(result.current.progressPercent).toBe(0);
  });

  it('retries upload with the same file when retryUpload is invoked', async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 500,
          json: async () => ({ success: false, error: 'Internal Server Error' }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            uploadUrl: 'https://example.com/upload',
            key: 'k2',
            publicUrl: 'u2',
          },
        }),
      };
    });

    vi.stubGlobal('fetch', fetchMock);

    vi.spyOn(s3ClientModule, 'uploadToS3WithProgress').mockReturnValue({
      promise: Promise.resolve(),
      abort: vi.fn(),
    });

    const { result } = renderHook(() =>
      useImageUpload({ folder: 'events/banners' })
    );

    const file = new File(['retry-content'], 'retry.jpg', { type: 'image/jpeg' });

    // First attempt fails
    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.retryable).toBe(true);

    // Second attempt via retryUpload succeeds
    await act(async () => {
      await result.current.retryUpload();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.uploadedAsset?.key).toBe('k2');
  });
});
