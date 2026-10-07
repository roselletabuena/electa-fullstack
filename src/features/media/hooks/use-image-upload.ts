'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  MediaFolder,
  UploadedMedia,
  UploadError,
  UploadStatus,
  UploadProgress,
} from '../types';
import { uploadToS3WithProgress, type S3UploadHandle } from '../utils/s3-upload-client';
import { validateImageFile } from '../utils/client-validation';

export interface UseImageUploadOptions {
  folder: MediaFolder;
  maxSizeBytes?: number | undefined;
  allowedMimeTypes?: readonly string[] | undefined;
  initialPreviewUrl?: string | undefined;
  onUploadComplete?: ((asset: UploadedMedia) => void) | undefined;
  onError?: ((error: UploadError) => void) | undefined;
}

export function useImageUpload({
  folder,
  maxSizeBytes = 10 * 1024 * 1024,
  allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
  initialPreviewUrl,
  onUploadComplete,
  onError,
}: UseImageUploadOptions) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loadedBytes, setLoadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl ?? null
  );
  const [uploadedAsset, setUploadedAsset] = useState<UploadedMedia | null>(null);
  const [error, setError] = useState<UploadError | null>(null);

  const activeUploadRef = useRef<S3UploadHandle | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  const localBlobUrlRef = useRef<string | null>(null);

  // Clean up blob URLs when unmounting or resetting
  useEffect(() => {
    return () => {
      if (localBlobUrlRef.current) {
        URL.revokeObjectURL(localBlobUrlRef.current);
      }
      if (activeUploadRef.current) {
        activeUploadRef.current.abort();
      }
    };
  }, []);

  const triggerError = useCallback(
    (err: UploadError) => {
      setError(err);
      setStatus('error');
      onError?.(err);
    },
    [onError]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      selectedFileRef.current = file;
      setError(null);
      setStatus('validating');

      // 1. Client-side boundary validation
      const validation = validateImageFile(file, {
        maxSizeBytes,
        allowedMimeTypes,
      });

      if (!validation.valid && validation.error) {
        triggerError(validation.error);
        return;
      }

      // 2. Generate local object preview
      if (localBlobUrlRef.current) {
        URL.revokeObjectURL(localBlobUrlRef.current);
      }
      const blobUrl = URL.createObjectURL(file);
      localBlobUrlRef.current = blobUrl;
      setPreviewUrl(blobUrl);

      // 3. Handshake with presigned URL API
      setStatus('presigning');
      let presignData: {
        uploadUrl: string;
        key: string;
        publicUrl: string;
      };

      try {
        const response = await fetch('/api/media/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            folder,
          }),
        });

        if (response.status === 401) {
          triggerError({
            code: 'UNAUTHORIZED',
            message: 'Session expired. Please sign in to upload images.',
            retryable: false,
          });
          return;
        }

        const json = await response.json();
        if (!response.ok || !json.success) {
          triggerError({
            code: 'PRESIGN_FAILED',
            message: json.error || 'Failed to authorize media upload.',
            retryable: true,
          });
          return;
        }

        presignData = json.data;
      } catch (err) {
        triggerError({
          code: 'PRESIGN_FAILED',
          message:
            err instanceof Error ? err.message : 'Network failure during authorization.',
          retryable: true,
        });
        return;
      }

      // 4. Execute direct S3 binary transfer via XMLHttpRequest
      setStatus('uploading');
      setProgressPercent(0);
      setLoadedBytes(0);
      setTotalBytes(file.size);

      try {
        const handle = uploadToS3WithProgress({
          url: presignData.uploadUrl,
          file,
          contentType: file.type,
          onProgress: (progress: UploadProgress) => {
            setProgressPercent(progress.percentage);
            setLoadedBytes(progress.loadedBytes);
            setTotalBytes(progress.totalBytes);
          },
        });

        activeUploadRef.current = handle;
        await handle.promise;

        const asset: UploadedMedia = {
          key: presignData.key,
          publicUrl: presignData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        };

        setUploadedAsset(asset);
        setPreviewUrl(presignData.publicUrl);
        setStatus('success');
        setProgressPercent(100);
        onUploadComplete?.(asset);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed.';
        if (message.includes('aborted')) {
          setStatus('idle');
          setProgressPercent(0);
          setError({
            code: 'ABORTED',
            message: 'Upload cancelled by user.',
            retryable: true,
          });
        } else {
          triggerError({
            code: 'UPLOAD_FAILED',
            message: 'Upload failed. Please check connection and retry.',
            retryable: true,
          });
        }
      } finally {
        activeUploadRef.current = null;
      }
    },
    [folder, maxSizeBytes, allowedMimeTypes, triggerError, onUploadComplete]
  );

  const cancelUpload = useCallback(() => {
    if (activeUploadRef.current) {
      activeUploadRef.current.abort();
      activeUploadRef.current = null;
    }
    setStatus('idle');
    setProgressPercent(0);
  }, []);

  const retryUpload = useCallback(async () => {
    if (selectedFileRef.current) {
      await uploadFile(selectedFileRef.current);
    }
  }, [uploadFile]);

  const reset = useCallback(() => {
    if (activeUploadRef.current) {
      activeUploadRef.current.abort();
      activeUploadRef.current = null;
    }
    if (localBlobUrlRef.current) {
      URL.revokeObjectURL(localBlobUrlRef.current);
      localBlobUrlRef.current = null;
    }
    selectedFileRef.current = null;
    setStatus('idle');
    setProgressPercent(0);
    setLoadedBytes(0);
    setTotalBytes(0);
    setPreviewUrl(initialPreviewUrl ?? null);
    setUploadedAsset(null);
    setError(null);
  }, [initialPreviewUrl]);

  return {
    status,
    progressPercent,
    loadedBytes,
    totalBytes,
    previewUrl,
    uploadedAsset,
    error,
    isUploading: status === 'validating' || status === 'presigning' || status === 'uploading',
    uploadFile,
    cancelUpload,
    retryUpload,
    reset,
  };
}
