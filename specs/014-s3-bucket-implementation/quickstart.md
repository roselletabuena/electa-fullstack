# Quickstart & Verification Guide: S3 Bucket Implementation

## Prerequisites

1. Active development server running (`npm run dev`).
2. Valid organizer session (either logged in via `/login` or using test bearer token).
3. AWS S3 bucket configured or LocalStack running:
   ```env
   AWS_REGION="ap-southeast-1"
   AWS_S3_BUCKET_NAME="electa-media-bucket"
   AWS_ACCESS_KEY_ID="test"
   AWS_SECRET_ACCESS_KEY="test"
   ```

---

## Verification Scenarios

### 1. Request a Pre-Signed Upload URL

Send a POST request to `/api/s3-bucket-implementation` with valid metadata:

```bash
curl -X POST http://localhost:3000/api/s3-bucket-implementation \
  -H "Content-Type: application/json" \
  -H "Cookie: votesphere_session=<YOUR_SESSION_COOKIE>" \
  -d '{
    "filename": "cover.webp",
    "contentType": "image/webp",
    "fileSizeBytes": 1500000,
    "entityType": "event_banner",
    "entityId": "evt_test123"
  }'
```

**Expected Outcome**:
- Status: `200 OK`
- Body contains `uploadUrl`, `key` (matching `events/evt_test123/banners/<uuid>.webp`), and `publicUrl`.

---

### 2. Upload File Directly to S3 via Pre-Signed URL

Using the returned `uploadUrl`:

```bash
curl -X PUT "<UPLOAD_URL>" \
  -H "Content-Type: image/webp" \
  --data-binary @"./tests/fixtures/sample-banner.webp"
```

**Expected Outcome**:
- Status: `200 OK` from S3.
- The object is now stored in the bucket at the given key.

---

### 3. Verify Validation Errors (Disallowed File Type & Oversized File)

#### A. Disallowed MIME Type:
```bash
curl -X POST http://localhost:3000/api/s3-bucket-implementation \
  -H "Content-Type: application/json" \
  -H "Cookie: votesphere_session=<YOUR_SESSION_COOKIE>" \
  -d '{
    "filename": "payload.exe",
    "contentType": "application/x-msdownload",
    "fileSizeBytes": 1000,
    "entityType": "event_banner",
    "entityId": "evt_test123"
  }'
```
**Expected Outcome**:
- Status: `400 Bad Request` with error message explaining invalid image format.

#### B. Oversized File (> 10MB for banner):
```bash
curl -X POST http://localhost:3000/api/s3-bucket-implementation \
  -H "Content-Type: application/json" \
  -H "Cookie: votesphere_session=<YOUR_SESSION_COOKIE>" \
  -d '{
    "filename": "huge-banner.jpg",
    "contentType": "image/jpeg",
    "fileSizeBytes": 15000000,
    "entityType": "event_banner",
    "entityId": "evt_test123"
  }'
```
**Expected Outcome**:
- Status: `400 Bad Request` citing payload exceeds maximum allowable size.

---

### 4. Run Automated Unit Tests

Execute the unit test suite for S3 validation, key building, and presigning:

```bash
npm run test:unit tests/unit/s3-bucket-implementation
```

**Expected Outcome**:
- All tests in `tests/unit/s3-bucket-implementation/` pass with zero failures.
