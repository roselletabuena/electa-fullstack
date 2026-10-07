import type { UploadProgress } from '../types';

export interface UploadToS3Options {
  url: string;
  file: File | Blob;
  contentType: string;
  onProgress?: (progress: UploadProgress) => void;
}

export interface S3UploadHandle {
  promise: Promise<void>;
  abort: () => void;
}

/**
 * Uploads a binary file directly to an AWS S3 presigned PUT URL using native XMLHttpRequest
 * with progress tracking and cancellation support.
 */
export function uploadToS3WithProgress({
  url,
  file,
  contentType,
  onProgress,
}: UploadToS3Options): S3UploadHandle {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<void>((resolve, reject) => {
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && event.total > 0) {
          const percentage = Math.min(
            100,
            Math.max(0, Math.round((event.loaded / event.total) * 100))
          );
          onProgress({
            percentage,
            loadedBytes: event.loaded,
            totalBytes: event.total,
          });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 direct upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during S3 upload'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload aborted by user'));
    };

    xhr.send(file);
  });

  return {
    promise,
    abort: () => {
      xhr.abort();
    },
  };
}
