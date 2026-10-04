# Implementation Plan: Philippine Payment Rails & Dynamic QR Ph Engine (VS-21)

## 1. Technical Boundary Mapping

- **Database Layer**: `prisma/schema.prisma` -> add `PaymentTransaction` & `PaymentStatus`.
- **Environment**: `src/env.ts` -> add PayMongo configuration.
- **Service Layer**:
  - `src/features/payments/services/paymongo.ts`: PayMongo REST API integration.
  - `src/features/payments/services/qrph-generator.ts`: Dynamic QR code generation.
  - `src/features/payments/utils/pricing.ts`: Tier calculations and bonus rules.
- **Server Actions & API Routes**:
  - `src/features/payments/actions/create-payment-intent.ts`: Server action for generating intent.
  - `src/features/payments/actions/verify-payment.ts`: Polling / status verification action.
  - `src/app/api/webhooks/paymongo/route.ts`: Webhook listener with HMAC verification & atomic vote crediting.
- **Frontend UI Components**:
  - `src/features/payments/components/BoostVoteModal.tsx`: Package selection & custom slider modal.
  - `src/features/payments/components/QrPhPaymentView.tsx`: High-contrast QR code display, timer, sandbox test button.
  - `src/features/payments/components/PaymentReceiptCard.tsx`: Digital receipt & downloadable PNG proof.
- **Tests**:
  - `tests/unit/payments/pricing.test.ts`
  - `tests/unit/payments/qrph.test.ts`
  - `tests/unit/payments/webhook.test.ts`
