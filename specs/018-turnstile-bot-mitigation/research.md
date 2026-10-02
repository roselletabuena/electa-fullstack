# Phase 0 Architecture Research: Cloudflare Turnstile & Free-Tier Velocity Bot Mitigation

**Feature ID**: `018-turnstile-bot-mitigation`  
**Date**: 2026-10-02  
**Status**: Completed

---

## 1. Cloudflare Turnstile Verification Architecture

### Decision

Implement server-side verification using Cloudflare's `siteverify` endpoint (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).

### Rationale

- **Invisible User Experience**: Human voters pass seamlessly with 0-second CAPTCHA interaction.
- **Cost**: 100% free tier provided by Cloudflare with generous limits.
- **Security**: Cryptographically signed single-use tokens prevent replay attacks and scripted vote submissions.

### Alternatives Considered

- **Google reCAPTCHA v3**: Rejected due to privacy concerns, user friction on mobile browsers, and Google tracking cookies.
- **Custom PoW (Proof of Work)**: High CPU usage on mobile client devices and complex verification logic.

---

## 2. Velocity Rate Limiting Strategy

### Decision

Use a sliding-window timestamp buffer keyed by client IP (`src/features/voting/utils/rate-limiter.ts`) enforcing a max threshold of 10 requests per 60-second window.

### Rationale

- **Prevents Burst Voting**: Smooths traffic spikes during high-concurrency event moments.
- **Low Latency**: In-memory execution provides sub-millisecond evaluation (<1ms overhead).
- **Graceful Throttling**: Returns standard HTTP 429 status code with clear user-facing error message.

### Alternatives Considered

- **Fixed Window Counter**: Vulnerable to boundary burst attacks (e.g. 10 requests at second 59 and 10 requests at second 01).
- **Redis Token Bucket**: Good for distributed clusters, but unnecessary overhead for current serverless memory model; our interface is designed to allow drop-in Redis switching if multi-region scaling is required.

---

## 3. Server-First App Router Integration (`/api/events/[slug]/vote`)

### Decision

Expose `/api/events/[slug]/vote` adhering to Next.js 16 asynchronous request parameter conventions (`await context.params`).

### Rationale

- Conforms to **VoteSphere Constitution §II** (_Server-First & Boundary Isolation_).
- Directly encapsulates event-level routing and parameter injection into `castVoteAction`.
- Standardized `ApiResponse<CastVoteResultDto>` envelopes ensure consistency across all client hooks.

---

## 4. Fail-Closed Security & Automated Test Bypass

### Decision

- **Fail-Closed**: If Cloudflare Siteverify times out (>5000ms) or encounters network failure, the backend immediately denies the vote (`BOT_DETECTION_FAILED`, HTTP 403).
- **Test Environment Bypass**: If `NODE_ENV === "test"` or `process.env.TURNSTILE_BYPASS === "true"`, dummy tokens (e.g. `mock-valid-turnstile-token`) automatically pass verification.
