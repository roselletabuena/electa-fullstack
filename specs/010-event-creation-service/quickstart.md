# Quickstart & Developer Validation Guide: Event Creation Backend

**Feature**: `010-event-creation-service`  
**Date**: 2026-09-27

---

## 1. Automated Vitest Suites

Run the dedicated unit test suites for schema validation, slug verification, and event creation actions:

```bash
# Run all event backend validation & creation tests
npm run test -- tests/unit/events/create-event-validation.test.ts tests/unit/events/create-event-service.test.ts tests/unit/events/check-slug.test.ts
```

---

## 2. API Manual Verification (cURL / HTTP)

### Verify Slug Availability

```bash
# Available slug check
curl -X GET "http://localhost:3000/api/events/check-slug?slug=pageant-night-2026" \
  -H "Accept: application/json"

# Reserved slug check (should return available: false)
curl -X GET "http://localhost:3000/api/events/check-slug?slug=dashboard" \
  -H "Accept: application/json"
```

### Verify Event Creation Endpoint

```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-session=<TOKEN>" \
  -d '{
    "title": "Summer Model Search 2026",
    "slug": "summer-models-2026",
    "description": "Annual nationwide modeling and talent voting competition.",
    "bannerUrl": "https://example.com/banner.jpg",
    "startsAt": "2026-11-01T00:00:00.000Z",
    "endsAt": "2026-11-30T23:59:59.000Z"
  }'
```

---

## 3. Quality Gate Checks

Execute linting, formatting, and strict typecheck:

```bash
npm run typecheck
npm run lint
npm run format:check
```
