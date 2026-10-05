# Quickstart & Verification Guide: Authenticated Media API Route Handlers (VS-43)

**Tracking Issue**: [VS-43](https://the-three-devsketeers.atlassian.net/browse/VS-43)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40)  
**Feature Branch**: `feature/VS-43-media-route-handlers`  

---

## 1. Prerequisites & Environment Setup

Ensure your local development environment has required AWS variables configured in `electa-fullstack/.env.local`:

```bash
AWS_REGION=ap-southeast-1
S3_MEDIA_BUCKET=electa-dev-media-assets
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

Verify that the core S3 library from `VS-42` is intact:
```bash
npm run test:unit tests/unit/storage/
```

---

## 2. Automated Unit Test Verification

Run the dedicated route handler test suites:

```bash
# Run all route handler tests for media operations
npm run test:unit tests/unit/api/media-presigned-url-route.test.ts
npm run test:unit tests/unit/api/media-delete-route.test.ts
```

Expected output:
```text
✓ tests/unit/api/media-presigned-url-route.test.ts (6 tests)
✓ tests/unit/api/media-delete-route.test.ts (6 tests)

Test Files  2 passed (2)
     Tests  12 passed (12)
```

---

## 3. Manual Endpoint Verification (Curl & Next.js Dev Server)

Start the local Next.js dev server:
```bash
npm run dev
```

### Scenario 1: Unauthenticated Presigned URL Request (Fails with 401)

```bash
curl -X POST http://localhost:3000/api/media/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName": "banner.jpg", "contentType": "image/jpeg", "folder": "events/banners"}'
```

**Expected Response (HTTP 401)**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2026-10-05T12:00:00.000Z"
}
```

---

### Scenario 2: Authenticated Presigned URL Request (Succeeds with 200)

Using mock organizer bearer token:
```bash
curl -X POST http://localhost:3000/api/media/presigned-url \
  -H "Authorization: Bearer mock-organizer-token" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "pageant-hero.png",
    "contentType": "image/png",
    "folder": "events/banners",
    "maxSizeBytes": 5242880
  }'
```

**Expected Response (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/...",
    "key": "events/banners/123e4567-e89b-12d3-a456-426614174000-pageant-hero.png",
    "publicUrl": "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/123e4567-e89b-12d3-a456-426614174000-pageant-hero.png",
    "expiresIn": 300,
    "contentType": "image/png"
  },
  "timestamp": "2026-10-05T12:00:00.000Z"
}
```

---

### Scenario 3: Authenticated Object Deletion (Succeeds with 200)

```bash
curl -X DELETE http://localhost:3000/api/media/delete \
  -H "Authorization: Bearer mock-organizer-token" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "events/banners/123e4567-e89b-12d3-a456-426614174000-pageant-hero.png"
  }'
```

**Expected Response (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "key": "events/banners/123e4567-e89b-12d3-a456-426614174000-pageant-hero.png"
  },
  "timestamp": "2026-10-05T12:00:00.000Z"
}
```

---

## 4. Full Quality Gates

Run full static analysis and type checks:
```bash
npm run typecheck
npm run lint
```
