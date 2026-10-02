# Implementation Plan: Cloudflare Turnstile & Free-Tier Velocity Bot Mitigation

**Branch**: `feature/VS-29-cloudflare-turnstile-bot-mitigation` | **Date**: 2026-10-02 | **Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/018-turnstile-bot-mitigation/spec.md)

**Input**: Feature specification from `specs/018-turnstile-bot-mitigation/spec.md`

## Summary

Implement server-side verification of Cloudflare Turnstile tokens alongside an in-memory sliding-window IP velocity rate limiter (10 attempts/minute/IP) to protect free-tier voting against automated scripts and bot attacks, exposing a dedicated `/api/events/[slug]/vote` App Router route handler conforming to VoteSphere Constitution §I–§VI.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+  
**Primary Dependencies**: Next.js 16 (App Router), Zod, React 19, Lucide React  
**Storage**: In-memory sliding window rate-limiting store (with Redis-ready abstraction)  
**Testing**: Vitest (`tests/unit/voting/`)  
**Target Platform**: Edge & Node.js Serverless runtime (Vercel)  
**Project Type**: Full-stack Next.js Web Application  
**Performance Goals**: <50ms verification overhead, <200ms p95 on `/api/events/[slug]/vote`  
**Constraints**: Zero-cost Cloudflare Turnstile API, fail-closed security posture on timeout  
**Scale/Scope**: Up to 10,000 concurrent votes during live coronation events

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                        | Check                                                                               | Status  |
| :----------------------------------------------- | :---------------------------------------------------------------------------------- | :-----: |
| **§I. Strict Type Safety & Boundary Validation** | Zod schema validation on request payloads; zero `any` or `as any`.                  | ✅ PASS |
| **§II. Server-First & Boundary Isolation**       | App Router route handler with `await context.params` and `ApiResponse<T>` envelope. | ✅ PASS |
| **§III. Strict State Separation**                | Server-side rate limiter isolated from client state.                                | ✅ PASS |
| **§IV. Secure-by-Design & Auth Integrity**       | Turnstile secret retrieved exclusively via `@/env`; fail-closed on network errors.  | ✅ PASS |
| **§V. Feature Colocation**                       | Colocated in `src/features/voting/utils/` and `src/app/api/events/[slug]/vote/`.    | ✅ PASS |
| **§VI. Test-First Quality Gates**                | 100% test coverage for Turnstile parser, rate limiter, and vote route handler.      | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/018-turnstile-bot-mitigation/
├── spec.md                  # Feature Specification
├── research.md              # Phase 0 Architecture Research
├── data-model.md            # Phase 1 Data Model & Error Codes
├── contracts/               # Phase 1 Contracts
│   └── bot-mitigation.ts
├── checklists/              # Quality Checklist
│   └── requirements.md
├── plan.md                  # This Implementation Plan
├── quickstart.md            # Quickstart Validation Guide
└── tasks.md                 # Implementation Tasks & Tracking
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── events/
│           └── [slug]/
│               └── vote/
│                   └── route.ts         # Event-scoped vote route handler
├── features/
│   └── voting/
│       ├── utils/
│       │   ├── turnstile.ts             # Cloudflare siteverify client
│       │   └── rate-limiter.ts           # IP sliding window velocity limiter
│       ├── actions/
│       │   └── cast-vote.ts             # Core voting action with bot checks
│       └── types/
│           └── index.ts                 # Voting DTOs & result contracts
tests/
└── unit/
    └── voting/
        ├── turnstile.test.ts            # Unit tests for siteverify & bypass
        ├── rate-limiter.test.ts         # Unit tests for sliding window rate limiter
        ├── event-vote-route.test.ts     # Route handler unit tests
        └── voting-route.test.ts         # Legacy /api/voting route tests
```

---

## Complexity Tracking

> No constitutional violations detected. No complexity exceptions required.
