import type { UploadProgress, UploadedMedia } from "../types";
import type { ApiResponse } from "@/lib/api/response";

export interface UploadToSupabaseOptions {
  file: File;
  folder?: string;
  onProgress?: (progress: UploadProgress) => void;
}

export interface SupabaseUploadHandle {
  promise: Promise<UploadedMedia>;
  abort: () => void;
}

/**
 * Uploads a file to the Supabase media upload route using XMLHttpRequest,
 * providing accurate progress tracking (0% to 100%) and cancellation support.
 */
export function uploadToSupabaseWithProgress({
  file,
  folder = "banners",
  onProgress,
}: UploadToSupabaseOptions): SupabaseUploadHandle {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<UploadedMedia>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("folder", folder);

    xhr.open("POST", "/api/media/supabase-upload");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && event.total > 0) {
          const percentage = Math.min(
            100,
            Math.max(0, Math.round((event.loaded / event.total) * 100)),
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
      try {
        const response = JSON.parse(xhr.responseText) as ApiResponse<UploadedMedia>;
        if (xhr.status >= 200 && xhr.status < 300 && response.success && response.data) {
          // Guarantee 100% progress report on completion
          onProgress?.({
            percentage: 100,
            loadedBytes: file.size,
            totalBytes: file.size,
          });
          resolve(response.data);
        } else {
          const errorMsg = response.error || `Upload failed with status ${xhr.status}`;
          reject(new Error(errorMsg));
        }
      } catch {
        reject(new Error(`Server error (${xhr.status}): Invalid response format`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Supabase media upload"));
    };

    xhr.onabort = () => {
      reject(new Error("Upload aborted by user"));
    };

    xhr.send(formData);
  });

  return {
    promise,
    abort: () => {
      xhr.abort();
    },
  };
}
