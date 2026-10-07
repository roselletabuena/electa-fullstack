# Data Model & Component Contracts: Reusable Image Upload & Dropzone Component (VS-45)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40)  
**Date**: 2026-10-07  
**Status**: Completed  

---

## 1. Component State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> DragOver: onDragEnter / onDragOver
    DragOver --> Idle: onDragLeave
    DragOver --> Validating: onDrop(file)
    Idle --> Validating: onFileSelect(input.files[0])
    
    Validating --> Error: MIME or Size Exceeded (client rejection)
    Validating --> Presigning: Valid File Parameters
    
    Presigning --> Error: Presign API Failed (401 / 500)
    Presigning --> Uploading: Presigned URL Received
    
    Uploading --> Uploading: onProgress(percent, loaded, total)
    Uploading --> Idle: Cancel Clicked (abort)
    Uploading --> Error: Network / S3 PUT Failure
    Uploading --> Success: HTTP 200 PUT Complete
    
    Error --> Presigning: Retry Clicked
    Error --> Idle: Reset / Dismiss
    Success --> Idle: Replace / Remove Asset
```

---

## 2. Direct-to-S3 Upload Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Organizer / Voter
    participant UI as ImageDropzone
    participant Hook as useImageUpload Hook
    participant API as Route: POST /api/media/presigned-url
    participant S3 as AWS S3 Storage (ap-southeast-1)

    User->>UI: Drops file or selects image
    UI->>Hook: uploadFile(file)
    Hook->>Hook: Client-side validation (MIME, max size)
    alt Validation Fails
        Hook-->>UI: ValidationError(message)
        UI-->>User: Show inline error alert
    else Validation Passes
        Hook->>API: POST /api/media/presigned-url { fileName, contentType, folder }
        alt Unauthorized (Session Expired)
            API-->>Hook: HTTP 401 { success: false, error: "Unauthorized" }
            Hook-->>UI: AuthError
            UI-->>User: Show sign-in required error
        else Authorized
            API-->>Hook: HTTP 200 { success: true, data: { uploadUrl, key, publicUrl, expiresIn } }
            Hook->>S3: XMLHttpRequest PUT uploadUrl (binary stream, Content-Type)
            loop During Transfer
                S3-->>Hook: xhr.upload.onprogress (loaded, total)
                Hook-->>UI: Progress (0% -> 100%)
                UI-->>User: Smooth progress bar update
            end
            S3-->>Hook: HTTP 200 OK
            Hook->>UI: onUploadComplete({ key, publicUrl, fileName, fileSize, contentType })
            UI-->>User: Show image preview thumbnail & success badge
        end
    end
```

---

## 3. TypeScript Interfaces & Schemas

### 3.1 Component Props Interface (`ImageDropzoneProps`)

```typescript
export type MediaFolder = 'events/banners' | 'events/logos' | 'contestants/avatars' | 'sponsors';

export interface UploadedMedia {
  key: string;
  publicUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_MIME_TYPE' | 'PRESIGN_FAILED' | 'UPLOAD_FAILED' | 'ABORTED' | 'UNAUTHORIZED';
  message: string;
  retryable: boolean;
}

export interface ImageDropzoneProps {
  /** Target S3 storage folder category */
  folder: MediaFolder;
  /** Maximum allowed file size in bytes (defaults: 5MB for avatars, 10MB for banners) */
  maxSizeBytes?: number;
  /** Allowed MIME types (defaults to image/jpeg, image/png, image/webp) */
  allowedMimeTypes?: string[];
  /** Existing image URL to render as initial thumbnail */
  initialPreviewUrl?: string;
  /** Callback emitted when S3 upload finishes successfully */
  onUploadComplete: (asset: UploadedMedia) => void;
  /** Optional callback emitted on error */
  onError?: (error: UploadError) => void;
  /** Optional callback emitted when user clicks remove */
  onRemove?: () => void;
  /** Disabled interaction state */
  disabled?: boolean;
  /** Accessible label description */
  label?: string;
  /** Helper text displayed below dropzone */
  helperText?: string;
  /** Additional CSS class names */
  className?: string;
}
```

### 3.2 Upload State Interface

```typescript
export type UploadStatus = 
  | 'idle'
  | 'validating'
  | 'presigning'
  | 'uploading'
  | 'success'
  | 'error';

export interface UploadState {
  status: UploadStatus;
  progressPercent: number;
  loadedBytes: number;
  totalBytes: number;
  previewUrl: string | null;
  uploadedAsset: UploadedMedia | null;
  error: UploadError | null;
}
```
