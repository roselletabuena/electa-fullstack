# Implementation Tasks: Cryptographic Secret-Ballot Decoupling & Cast Ballot Processor

**Feature ID**: `045-secret-ballot-decoupling-processor`  
**Ticket**: [VS-110](https://the-three-devsketeers.atlassian.net/browse/VS-110)  

---

## Task List

- [x] **Task 1: Prisma Schema & Decoupled Models**
  - Add `VoterParticipation` and `BallotSelection` to `prisma/schema.prisma`.
  - Connect inverse relations to `Event`, `EventPosition`, and `Contestant`.
  - Run `npx prisma generate` to compile Prisma client.

- [x] **Task 2: Cryptographic Receipt Utility (TDD)**
  - Write tests in `tests/unit/crypto/ballot-receipt.test.ts` for deterministic receipt generation, HMAC integrity, and tamper detection.
  - Implement `src/lib/crypto/ballot-receipt.ts` using Node.js `crypto` with `AUTH_SECRET` from `@/env`.

- [x] **Task 3: Secret Ballot Domain Service (TDD)**
  - Write tests in `tests/unit/voting/secret-ballot-service.test.ts` covering:
    - Decoupled storage (zero `userId` in `BallotSelection`).
    - Duplicate voting prevention via `VoterParticipation`.
    - Atomic rollback on simulated transaction error.
    - Office selection caps & candidate eligibility validation.
  - Implement `src/features/voting/services/secret-ballot-service.ts`.

- [x] **Task 4: Server Action & Integration Adapter**
  - Implement `src/features/voting/actions/cast-secret-ballot.ts` with `getSession()` auth check and Zod validation.
  - Update `src/features/voting/actions/cast-ballot.ts` to delegate to secret ballot processor.
  - Update `src/features/voting/types/ballot.ts` and `src/features/voting/index.ts` exports.

- [x] **Task 5: Verification Gates & Code Review**
  - Run `npm run typecheck`
  - Run `npm run lint`
  - Run `npm run test:unit`
  - Run `code-review` and `code-review-and-quality` audits.
  - Auto-remediate any identified smells or issues.
  - Update Jira issue with completion changelog comment.
