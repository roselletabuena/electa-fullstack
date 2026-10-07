# Quickstart: Reusable Image Upload & Dropzone Component (VS-45)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40)  
**Date**: 2026-10-07  

---

## 1. Component Overview

The `<ImageDropzone />` component is a zero-radius, dual-theme accessible dropzone for uploading event banners, contestant avatars, and logos directly to AWS S3. It manages:
- Immediate client-side validation for file size and MIME type.
- Fetching presigned upload URLs from `/api/media/presigned-url`.
- Direct browser-to-S3 binary `PUT` transfers via native `XMLHttpRequest` with continuous percentage progress.
- Preview thumbnail generation and memory cleanup.

---

## 2. Basic Usage Example

```tsx
'use client';

import { useState } from 'react';
import { ImageDropzone } from '@/features/media/components/ImageDropzone';
import type { UploadedMedia } from '@/features/media/types';

export function EventBannerUploadSection() {
  const [bannerAsset, setBannerAsset] = useState<UploadedMedia | null>(null);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
        Event Cover Banner
      </label>
      <ImageDropzone
        folder="events/banners"
        maxSizeBytes={10 * 1024 * 1024} // 10MB
        helperText="Supported formats: JPEG, PNG, WebP (Max 10MB). Recommended: 16:9 ratio."
        onUploadComplete={(asset) => {
          console.log('Upload complete:', asset);
          setBannerAsset(asset);
        }}
        onRemove={() => setBannerAsset(null)}
      />
    </div>
  );
}
```

---

## 3. Integration with React Hook Form

```tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { ImageDropzone } from '@/features/media/components/ImageDropzone';

interface FormData {
  avatarKey: string;
}

export function ContestantAvatarForm() {
  const { control, handleSubmit } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="avatarKey"
        control={control}
        render={({ field }) => (
          <ImageDropzone
            folder="contestants/avatars"
            maxSizeBytes={5 * 1024 * 1024}
            onUploadComplete={(asset) => field.onChange(asset.key)}
            onRemove={() => field.onChange('')}
          />
        )}
      />
    </form>
  );
}
```

---

## 4. Running Automated Unit Tests

```bash
# Run dropzone component unit tests
npx vitest run tests/unit/media/image-dropzone.test.tsx

# Run upload client utility unit tests
npx vitest run tests/unit/media/s3-upload-client.test.ts
```
