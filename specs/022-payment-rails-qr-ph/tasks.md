# Tasks: Philippine Payment Rails & Dynamic QR Ph Engine (VS-21)

## Phase 1: Database Schema & Environment Setup

- [x] Task 1.1: Update `prisma/schema.prisma` with `PaymentTransaction`, `PaymentStatus`, and relations.
- [x] Task 1.2: Generate Prisma Client (`npx prisma generate`).
- [x] Task 1.3: Update `src/env.ts` with PayMongo environment variables.

## Phase 2: Core Domain Logic & Pricing Engine

- [x] Task 2.1: Implement `src/features/payments/types/index.ts` with types & DTOs.
- [x] Task 2.2: Implement `src/features/payments/utils/pricing.ts` with pricing matrix and bonus calculations.
- [x] Task 2.3: Implement `src/features/payments/services/paymongo.ts` and sandbox provider.
- [x] Task 2.4: Implement `src/features/payments/services/qrph-generator.ts` with SVG QR generation.

## Phase 3: Server Actions & Webhooks

- [x] Task 3.1: Implement `src/features/payments/actions/create-payment-intent.ts`.
- [x] Task 3.2: Implement `src/features/payments/actions/verify-payment.ts`.
- [x] Task 3.3: Implement `src/app/api/webhooks/paymongo/route.ts` with atomic vote crediting.

## Phase 4: UI Components & Experience

- [x] Task 4.1: Implement `src/features/payments/components/BoostVoteModal.tsx`.
- [x] Task 4.2: Implement `src/features/payments/components/QrPhPaymentView.tsx`.
- [x] Task 4.3: Implement `src/features/payments/components/PaymentReceiptCard.tsx`.
- [x] Task 4.4: Export public barrel file `src/features/payments/index.ts`.
- [x] Task 4.5: Integrate Boost Vote trigger into contestant profiles / voting components.

## Phase 5: Verification & Quality Gates

- [x] Task 5.1: Create automated unit tests in `tests/unit/payments/`.
- [x] Task 5.2: Run `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
