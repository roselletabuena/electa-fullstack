# Phase 1 Quickstart: Validation & Verification Guide

**Feature ID**: `018-turnstile-bot-mitigation`  
**Date**: 2026-10-02

---

## 🧪 Quickstart Validation Scenarios

### Scenario 1: Verify Valid Vote via Event-Scoped Endpoint

```bash
curl -X POST http://localhost:3000/api/events/miss-grand-2026/vote \
  -H "Content-Type: application/json" \
  -d '{
    "contestantId": "cnt_01",
    "turnstileToken": "mock-valid-turnstile-token"
  }'
```

**Expected Outcome**: Returns HTTP `200 OK` with JSON envelope `{ "success": true, "data": { "voteId": "...", "newContestantVoteCount": 1 } }`.

---

### Scenario 2: Test Bot Detection on Missing / Invalid Token

```bash
curl -X POST http://localhost:3000/api/events/miss-grand-2026/vote \
  -H "Content-Type: application/json" \
  -d '{
    "contestantId": "cnt_01",
    "turnstileToken": "invalid-token"
  }'
```

**Expected Outcome**: Returns HTTP `403 Forbidden` with `{ "success": false, "error": "Turnstile bot challenge verification failed." }`.

---

### Scenario 3: Test IP Velocity Limit (11th Request within 60s)

```bash
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/events/miss-grand-2026/vote \
    -H "Content-Type: application/json" \
    -d '{"contestantId": "cnt_01", "turnstileToken": "mock-valid-turnstile-token"}'
done
```

**Expected Outcome**: 1st through 10th requests pass; 11th request receives HTTP `429 Too Many Requests`.

---

### Scenario 4: Run Automated Test Suite

```bash
npm run test:unit -- tests/unit/voting/
```
