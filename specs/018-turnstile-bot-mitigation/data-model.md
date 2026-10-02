# Phase 1 Data Model: Cloudflare Turnstile & Free-Tier Velocity Bot Mitigation

**Feature ID**: `018-turnstile-bot-mitigation`  
**Date**: 2026-10-02

---

## 1. Schema Entities & DTOs

### BotMitigationPayload

```typescript
export interface BotMitigationPayload {
  contestantId: string;
  categoryTrackId?: string;
  eventSlug?: string;
  turnstileToken?: string;
  clientIp?: string;
  userAgent?: string;
}
```

### RateLimitEntry (Sliding Window Model)

```typescript
export interface RateLimitEntry {
  ip: string;
  timestamps: number[];
  blockedUntil?: number;
}
```

### TurnstileVerificationResult

```typescript
export interface TurnstileVerificationResult {
  success: boolean;
  challengeTs?: string;
  hostname?: string;
  errorCodes?: string[];
}
```

---

## 2. Status Codes & Error Mappings

| Error Code                      | HTTP Status | Meaning / Response Payload                       |
| :------------------------------ | :---------: | :----------------------------------------------- |
| `BOT_DETECTION_FAILED`          |     403     | Turnstile challenge failed or missing token.     |
| `RATE_LIMIT_EXCEEDED`           |     429     | IP exceeded 10 free votes in 60s sliding window. |
| `DEVICE_ACCOUNT_LIMIT_EXCEEDED` |     429     | Exceeded distinct accounts per device limit.     |
| `NOT_AUTHENTICATED`             |     401     | Missing voter session or invalid JWT.            |
| `DAILY_QUOTA_EXHAUSTED`         |     400     | User has no remaining daily free votes.          |
| `EVENT_NOT_ACTIVE`              |     400     | Event is in DRAFT, UPCOMING, or COMPLETED state. |
