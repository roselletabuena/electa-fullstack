# Quickstart: Core S3 Storage Service & Presigned URL Generator

**Feature Branch**: `025-s3-storage-service`  
**Date**: 2026-10-05  
**Spec**: [spec.md](file:///c:/Users/russel/workspace/electa-workspace/electa-fullstack/specs/025-s3-storage-service/spec.md)

---

## 1. Prerequisites & Environment Setup

Verify that AWS environment variables are declared in `electa-fullstack/.env.local`:

```bash
AWS_REGION="ap-southeast-1"
S3_MEDIA_BUCKET="electa-dev-media-assets"
# In local development with AWS CLI configured:
# AWS_ACCESS_KEY_ID="<your-access-key>"
# AWS_SECRET_ACCESS_KEY="<your-secret-key>"
```

Install the required AWS SDK v3 packages:

```bash
cd c:\Users\russel\workspace\electa-workspace\electa-fullstack
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 2. Running Unit Tests

Run the test suite for S3 storage utilities:

```bash
cd c:\Users\russel\workspace\electa-workspace\electa-fullstack
npm run test:unit tests/unit/storage/s3-storage-service.test.ts
```

Run TypeScript typechecking and linting:

```bash
npm run typecheck
npm run lint
```

---

## 3. Usage Examples

### 3.1 Generating a Presigned Upload URL

```typescript
import { generatePresignedUploadUrl } from "@/lib/s3/storage-service";

const uploadDescriptor = await generatePresignedUploadUrl({
  fileName: "banner-hero.png",
  contentType: "image/png",
  folder: "events/banners",
  fileSize: 2 * 1024 * 1024, // 2MB
});

console.log(uploadDescriptor);
// Output:
// {
//   uploadUrl: "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/...?X-Amz-Signature=...",
//   key: "events/banners/550e8400-e29b-41d4-a716-446655440000-banner-hero.png",
//   publicUrl: "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/550e8400-e29b-41d4-a716-446655440000-banner-hero.png",
//   expiresIn: 300,
//   contentType: "image/png"
// }
```

### 3.2 Client-Side Upload Execution (Frontend)

```typescript
// On the browser client
async function uploadFileToS3(file: File, uploadUrl: string, contentType: string) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`);
  }

  return true;
}
```

### 3.3 Server-Side Direct Buffer Upload (QR Codes / Canvas)

```typescript
import { uploadImageBuffer } from "@/lib/s3/storage-service";

const qrBuffer = Buffer.from("..."); // Generated PNG buffer
const result = await uploadImageBuffer({
  buffer: qrBuffer,
  key: "system/generated/qr-event-123.png",
  contentType: "image/png",
});

console.log(result.publicUrl);
```

### 3.4 Deleting and Replacing Media

```typescript
import { deleteImageFromS3, replaceImage } from "@/lib/s3/storage-service";

// Delete an obsolete image (idempotent)
await deleteImageFromS3("events/banners/old-banner.jpg");

// Clean replacement during asset updates
await replaceImage({
  oldKey: "contestants/avatars/old-photo.jpg",
  newKey: "contestants/avatars/new-photo.jpg",
});
```
