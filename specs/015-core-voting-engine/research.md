# Technical Research & Architecture Decisions: Core Voting Engine, Omnichannel Auth & Anti-Fraud (VS-20)

**Feature**: `015-core-voting-engine`  
**Date**: 2026-10-01  
**Status**: Decided

---

## Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                             |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)         |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`       |
| Server State  | TanStack Query — never mirror server data in Zustand                    |
| Client State  | Zustand `auth-store` for session only                                   |
| URL State     | nuqs for search params, pagination, filters                             |
| Forms         | React Hook Form + Zod (`zodResolver`)                                   |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                     |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                 |

---

## Technical Decisions & Rationale

### 1. Omnichannel Identity Federation (Cognito Multi-Provider)

- **Decision**: Leverage AWS Cognito User Pool identity federation for Google, Apple, and Facebook OAuth, alongside custom auth flows for passwordless Email Magic Links and Phone OTP (SMS/WhatsApp). Unified voter identity is resolved to a single `voterId` via email/phone matching.
- **Rationale**:
  - Provides frictionless one-tap login for diverse demographics across mobile web and desktop.
  - Keeps session management unified under the existing `verifyLocalCognitoToken` and `getSession()` contracts.
- **Alternatives Considered**:
  - _NextAuth.js_: Violates Constitution §IV (AWS Cognito is the ratified project standard).
  - _Supabase Auth standalone_: Fragmented auth states between organizers (Cognito) and voters.

### 2. Cloudflare Turnstile Server-Side Validation

- **Decision**: Validate Cloudflare Turnstile token server-side via `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `TURNSTILE_SECRET_KEY` from `src/env.ts`.
- **Rationale**:
  - Turnstile provides privacy-preserving, non-intrusive CAPTCHA replacement.
  - Verification occurs in the Server Action before database transactions begin, completely shielding database connection pools from bot load.
- **Alternatives Considered**:
  - _Google reCAPTCHA v3_: Poorer privacy posture, frequent false positives on mobile cellular networks.
  - _Custom Proof-of-Work (PoW)_: Heavy client CPU drain on lower-end mobile devices.

### 3. Device Fingerprinting & IP Velocity Rate Limiting

- **Decision**: Combine client-side hardware/browser attribute hash (canvas, screen, user agent entropy) with server-side client IP evaluation (`x-forwarded-for` / `cf-connecting-ip`). Enforce 10 votes/min/IP limit and max 3 accounts per device fingerprint per event window.
- **Rationale**:
  - Prevents automated vote farms from cycling newly registered accounts on a single machine or script.
  - Transparent to legitimate users while flagging anomalous surges for audit logging.
- **Alternatives Considered**:
  - _Pure IP rate limiting_: Unfairly penalizes voters on shared school/office Wi-Fi networks without device differentiation.
  - _SMS verification on all votes_: Prohibitive operational cost ($0.05+ per SMS) for free daily votes.

### 4. High-Concurrency Concurrency Control & Double-Counting Immunity

- **Decision**: Execute vote admission, quota verification, vote insertion, and tally increments inside an interactive Prisma database transaction (`db.$transaction`) with `isolationLevel: Prisma.TransactionIsolationLevel.Serializable` or atomic condition updates.
- **Rationale**:
  - Guarantees zero double-counting during viral rush periods when hundreds of requests arrive in the same millisecond.
  - Eliminates race conditions between quota inspection and vote insertion.
- **Alternatives Considered**:
  - _Optimistic check-then-insert_: Fails under concurrent requests, allowing multiple votes before quota query reflects newly committed votes.
