# Contract: Voting Engine API & Server Action

**Feature**: `015-core-voting-engine`  
**Endpoint**: `POST /api/voting` and Server Action `castVoteAction(rawInput)`

---

## Request Payload

```json
{
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "contestantId": "7bc29e12-32a1-432a-a924-f7b58c7042a1",
  "awardCategoryId": null,
  "voteType": "FREE",
  "voteWeight": 1,
  "turnstileToken": "0.XXXXX.YYYYY",
  "deviceFingerprint": "fp_8a7d6e5c4b3a2f1",
  "idempotencyKey": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
}
```

---

## Response Envelope (`ApiResponse<T>`)

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "voteId": "d9e8f7a6-b5c4-3d2e-1f0a-9b8c7d6e5f4a",
    "contestantId": "7bc29e12-32a1-432a-a924-f7b58c7042a1",
    "newContestantVoteCount": 42,
    "voteType": "FREE",
    "quotaState": {
      "usedToday": 1,
      "dailyLimit": 1,
      "remainingAllowance": 0,
      "isExhausted": true,
      "nextResetTime": "2026-10-02T00:55:00.000Z"
    }
  },
  "error": null
}
```

### Error Responses

#### Missing or Invalid Turnstile Token (403 Forbidden)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BOT_DETECTION_FAILED",
    "message": "Security verification failed. Please try again."
  }
}
```

#### IP Velocity Throttling (429 Too Many Requests)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many vote requests from this network. Please slow down."
  }
}
```

#### Quota Exhausted (400 Bad Request)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "DAILY_QUOTA_EXHAUSTED",
    "message": "You have used all your free daily votes for this competition cycle.",
    "details": {
      "nextResetTime": "2026-10-02T00:55:00.000Z"
    }
  }
}
```
