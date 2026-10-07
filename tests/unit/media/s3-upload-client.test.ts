import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadToS3WithProgress } from '@/features/media/utils/s3-upload-client';

describe('uploadToS3WithProgress', () => {
  let mockXhr: {
    open: ReturnType<typeof vi.fn>;
    setRequestHeader: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    status: number;
    upload: {
      onprogress: ((event: ProgressEvent) => void) | null;
    };
    onload: (() => void) | null;
    onerror: (() => void) | null;
    onabort: (() => void) | null;
  };

  beforeEach(() => {
    mockXhr = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      send: vi.fn(),
      abort: vi.fn(),
      status: 200,
      upload: {
        onprogress: null,
      },
      onload: null,
      onerror: null,
      onabort: null,
    };

    function MockXMLHttpRequest(this: unknown) {
      return mockXhr;
    }

    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes PUT request with correct URL and Content-Type header', () => {
    const file = new File(['sample binary content'], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    const { promise } = uploadToS3WithProgress({
      url: 'https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/test.jpg?signed=true',
      file,
      contentType: 'image/jpeg',
    });

    expect(mockXhr.open).toHaveBeenCalledWith(
      'PUT',
      'https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/test.jpg?signed=true'
    );
    expect(mockXhr.setRequestHeader).toHaveBeenCalledWith(
      'Content-Type',
      'image/jpeg'
    );
    expect(mockXhr.send).toHaveBeenCalledWith(file);

    mockXhr.status = 200;
    mockXhr.onload?.();

    return expect(promise).resolves.toBeUndefined();
  });

  it('notifies onProgress callback with computed percentage during upload', async () => {
    const file = new File(['sample bytes'], 'banner.png', {
      type: 'image/png',
    });
    const onProgress = vi.fn();

    const { promise } = uploadToS3WithProgress({
      url: 'https://example.com/upload',
      file,
      contentType: 'image/png',
      onProgress,
    });

    expect(mockXhr.upload.onprogress).toBeDefined();

    mockXhr.upload.onprogress?.({
      lengthComputable: true,
      loaded: 500,
      total: 1000,
    } as ProgressEvent);

    expect(onProgress).toHaveBeenCalledWith({
      percentage: 50,
      loadedBytes: 500,
      totalBytes: 1000,
    });

    mockXhr.status = 200;
    mockXhr.onload?.();
    await promise;
  });

  it('rejects with error if S3 returns non-2xx HTTP status', async () => {
    const file = new File(['content'], 'test.webp', { type: 'image/webp' });

    const { promise } = uploadToS3WithProgress({
      url: 'https://example.com/upload',
      file,
      contentType: 'image/webp',
    });

    mockXhr.status = 403;
    mockXhr.onload?.();

    await expect(promise).rejects.toThrow(
      'S3 direct upload failed with status 403'
    );
  });

  it('rejects on network error', async () => {
    const file = new File(['content'], 'test.webp', { type: 'image/webp' });

    const { promise } = uploadToS3WithProgress({
      url: 'https://example.com/upload',
      file,
      contentType: 'image/webp',
    });

    mockXhr.onerror?.();

    await expect(promise).rejects.toThrow('Network error during S3 upload');
  });

  it('aborts active upload when abort handle is invoked', async () => {
    const file = new File(['content'], 'test.webp', { type: 'image/webp' });

    const { promise, abort } = uploadToS3WithProgress({
      url: 'https://example.com/upload',
      file,
      contentType: 'image/webp',
    });

    abort();
    expect(mockXhr.abort).toHaveBeenCalled();

    mockXhr.onabort?.();
    await expect(promise).rejects.toThrow('Upload aborted by user');
  });
});
