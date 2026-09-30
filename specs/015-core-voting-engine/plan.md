# Implementation Plan: Core Voting Engine, Omnichannel Auth & Anti-Fraud

**Branch**: `015-core-voting-engine` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)  
**Jira Key**: [VS-20](https://the-three-devsketeers.atlassian.net/browse/VS-20)  
**Parent Epic**: [VS-18](https://the-three-devsketeers.atlassian.net/browse/VS-18)

---

## Summary

Build and harden the core voting engine, omnichannel voter authentication suite, and multi-layered anti-fraud defense for VoteSphere. Voters can authenticate via Google, Apple, Facebook, Email Magic Links, or Phone OTP (SMS/WhatsApp) in a unified modal dialog. Every free vote is guarded by Cloudflare Turnstile bot verification, device fingerprinting, and IP velocity throttling. High-concurrency voting rushes are protected by atomic Prisma database transactions ensuring zero double-counting, idempotent retries, and strict rolling 24-hour quota enforcement across both free votes and paid boosts.

---

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode, no `any`, no `!`)  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma ORM, TanStack Query v5, Zod, Lucide React  
**Storage**: PostgreSQL via Supabase (`Vote`, `Event`, `Contestant`, `EventAuditLog` models)  
**Auth**: AWS Cognito federated auth + custom token adapter (`src/lib/auth/get-session.ts`, `src/features/auth/utils/token-adapter.ts`)  
**Testing**: Vitest (`tests/unit/voting/`, `tests/unit/auth/`)  
**Target Platform**: Responsive Web (Mobile-first & Desktop browsers)  
**Performance Goals**: Turnstile validation + atomic vote transaction commit $\le 250\text{ms}$; instant optimistic UI feedback  
**Constraints**: Zero concurrency over-voting leaks (atomic interactive transaction isolation), Cloudflare Turnstile token validation required for free votes, strictly no raw `process.env` (VoteSphere Constitution §IV)  
**Scale/Scope**: Support 10,000+ daily votes and high-velocity bursts during live pageant finale events

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Compliance Assessment                                                                                                | Status  |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :-----: |
| **§I: Strict Type Safety**        | Strict TypeScript 5; zero `any` or `!`; input validation via Zod schemas (`CastVoteInputSchema`, Turnstile schemas). | ✅ PASS |
| **§II: Server-First & Isolation** | Server Actions (`castVoteAction`) and Route Handler (`src/app/api/voting/route.ts`) return `ApiResponse<T>`.         | ✅ PASS |
| **§III: State Separation**        | Single source of truth via Prisma singleton (`src/lib/db.ts`); server state in TanStack Query.                       | ✅ PASS |
| **§IV: Secure-by-Design**         | Session authorization via `getSession()`; Turnstile secret key and env variables strictly via `src/env.ts`.          | ✅ PASS |
| **§V: Feature Colocation**        | Vertical slice colocation under `src/features/voting/` and `src/features/auth/`.                                     | ✅ PASS |
| **§VI: Test-First Quality**       | Comprehensive Vitest unit tests covering Turnstile verification, rate limiting, and atomic transaction checks.       | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/015-core-voting-engine/
├── spec.md              # Feature specification
├── plan.md              # Technical implementation plan
├── research.md          # Architectural research & decisions
├── data-model.md        # Data models and entity relations
├── quickstart.md        # Testing and manual verification guide
├── contracts/
│   ├── cast-vote.contract.md   # Voting API & Server Action contracts
│   └── turnstile.contract.md   # Turnstile verification contract
└── checklists/
    ├── requirements.md          # Spec quality checklist
    └── security-and-anti-fraud.md # Anti-fraud & concurrency checklist
```

### Source Code Slices

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── OmnichannelAuthModal.tsx    # Multi-provider voter auth modal (Google, Apple, FB, Email, SMS)
│   │   ├── utils/
│   │   │   └── passwordless-auth.ts        # Magic link & Phone OTP helpers
│   │   └── types/
│   │       └── index.ts                    # Auth provider interfaces
│   └── voting/
│       ├── actions/
│       │   ├── cast-vote.ts                # Unified atomic vote action (FREE & BOOST)
│       │   └── cast-free-vote.ts           # Existing free vote action (enhanced with Turnstile & velocity)
│       ├── components/
│       │   ├── TurnstileWidget.tsx         # Cloudflare Turnstile client widget
│       │   └── FreeVoteButton.tsx          # Updated with Turnstile challenge integration
│       ├── types/
│       │   └── index.ts                    # CastVoteInputSchema, AntiFraudPayload
│       └── utils/
│           ├── turnstile.ts                # Server-side Turnstile siteverify validator
│           ├── rate-limiter.ts             # In-memory IP velocity & device throttling
│           └── fingerprint.ts              # Client hardware/device entropy hashing
├── app/
│   └── api/
│       └── voting/
│           └── route.ts                    # Typed ApiResponse<T> Route Handler
└── env.ts                                  # Cloudflare Turnstile secret key declaration
```

---

## Phased Implementation Strategy

1. **Phase 1: Environment & Anti-Fraud Core Utilities**
   - Register `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `src/env.ts` with safe mock defaults for local/test environments.
   - Implement `verifyTurnstileToken(token, clientIp)` with unit tests.
   - Implement `checkIpVelocity(ip)` and `checkDeviceAccountLimit(deviceId, eventId, voterId)` with unit tests.
2. **Phase 2: Atomic Voting Engine Action & Route Handler**
   - Implement `castVoteAction` in `src/features/voting/actions/cast-vote.ts` supporting `FREE` and `BOOST` with atomic Prisma transaction.
   - Enforce idempotency key handling to prevent double-counting across network retries.
   - Expose `src/app/api/voting/route.ts` with standard `ApiResponse<T>` envelope.
3. **Phase 3: Omnichannel Voter Authentication Modal**
   - Implement `OmnichannelAuthModal.tsx` providing Google, Apple, Facebook, Email Magic Link, and Phone OTP tabs/buttons.
   - Colocate passwordless authentication helpers in `src/features/auth/utils/passwordless-auth.ts`.
4. **Phase 4: Client Integration & Turnstile Widget**
   - Implement `TurnstileWidget.tsx` using Cloudflare Turnstile script or mock fallback for dev.
   - Integrate Turnstile verification into `FreeVoteButton.tsx` and voter voting flows.
5. **Phase 5: Automated Verification & Test Suite**
   - Unit tests for Turnstile validation, rate limiting, and atomic voting transactions.
   - Full regression test run with Vitest.
