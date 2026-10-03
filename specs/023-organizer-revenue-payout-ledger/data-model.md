# Data Model: Organizer Command Center, Revenue Tracker & Payout Ledger (VS-24)

**Feature**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/023-organizer-revenue-payout-ledger/spec.md)  
**Date**: 2026-10-03  
**Status**: Ready for Implementation

---

## 1. Database Schema Extensions (Prisma)

### Modified Model: `Event`

Extend the existing `Event` model in `prisma/schema.prisma` with admin-controlled commission rate and payout relationship:

```prisma
model Event {
  // Existing fields...
  id                  String                 @id @default(uuid())
  slug                String                 @unique
  title               String
  // ...

  // NEW: Admin-controlled platform take-rate percentage (default 12.00%)
  takeRatePercentage  Decimal                @default(12.00) @db.Decimal(5, 2)

  // Relationships
  payoutRequests      PayoutRequest[]
  // Existing relations (contestants, divisions, votes, paymentTransactions)...
}
```

---

### New Enums & Models: `PayoutRequest`

```prisma
enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}

enum PayoutMethod {
  BANK_TRANSFER
  GCASH
  MAYA
}

model PayoutRequest {
  id                    String        @id @default(uuid())
  referenceNumber       String        @unique // e.g. "PO-20261003-ABCD"
  eventId               String
  organizerId           String
  amountInPhp           Decimal       @db.Decimal(10, 2)
  payoutMethod          PayoutMethod  @default(BANK_TRANSFER)

  // Destination account details (masked in UI for privacy)
  accountName           String
  accountNumber         String
  bankOrProviderName    String?       // e.g. "BDO", "BPI", "GCash", "Maya"

  status                PayoutStatus  @default(PENDING)
  requestedAt           DateTime      @default(now())
  processedAt           DateTime?

  // Administrative fulfillment metadata (Electa Admin)
  adminReferenceNumber  String?       // External bank/e-wallet transfer reference
  fulfilledByAdminId    String?
  notes                 String?
  rejectionReason       String?

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  event                 Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId, status])
  @@index([organizerId])
  @@index([referenceNumber])
  @@index([createdAt])
}
```

---

## 2. In-Memory TypeScript Domain Interfaces

```typescript
export interface FinancialMetricsSummary {
  grossSalesPhp: number;
  totalTransactionsCount: number;
  gatewayFeesPhp: number;
  platformTakeRatePercentage: number;
  platformCommissionPhp: number;
  netOrganizerRevenuePhp: number;
  totalDisbursedPhp: number;
  totalPendingPayoutPhp: number;
  availablePayoutBalancePhp: number;
}

export interface ContestantRevenueShare {
  contestantId: string;
  contestantNumber: number;
  name: string;
  avatarUrl: string;
  totalVotes: number;
  grossSalesPhp: number;
  revenueSharePercentage: number;
}

export interface PaymentChannelBreakdown {
  channel: "QR_PH" | "GCASH" | "MAYA" | "CARD" | "ONLINE_BANKING";
  displayName: string;
  transactionCount: number;
  grossSalesPhp: number;
  gatewayFeePhp: number;
}

export interface VoteAuditLogEntry {
  transactionId: string;
  referenceNumber: string;
  timestamp: string; // ISO-8601
  contestantName: string;
  contestantNumber: number;
  votesAwarded: number;
  amountInPhp: number;
  paymentChannel: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  maskedVoterId: string; // e.g. "vot_***9a3b"
  voterIpHash: string; // SHA-256 salted hash
}
```

---

## 3. Zod Validation Schemas

```typescript
import { z } from "zod";

export const createPayoutRequestSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  amountInPhp: z
    .number()
    .min(1000, "Minimum payout request is ₱1,000.00")
    .max(10000000, "Maximum payout request exceeded"),
  payoutMethod: z.enum(["BANK_TRANSFER", "GCASH", "MAYA"]),
  accountName: z.string().min(2, "Account name is required").max(100),
  accountNumber: z.string().min(8, "Valid account or mobile number is required").max(30),
  bankOrProviderName: z.string().max(50).optional(),
});

export const fulfillPayoutRequestSchema = z.object({
  payoutId: z.string().uuid("Invalid payout ID"),
  status: z.enum(["COMPLETED", "REJECTED"]),
  adminReferenceNumber: z.string().min(3, "Disbursement reference number is required").optional(),
  rejectionReason: z.string().max(250).optional(),
  notes: z.string().max(500).optional(),
});

export const updateTakeRateSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  takeRatePercentage: z
    .number()
    .min(0, "Take rate cannot be negative")
    .max(50, "Take rate cannot exceed 50.0%"),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  contestantId: z.string().uuid().optional(),
  paymentChannel: z.enum(["QR_PH", "GCASH", "MAYA", "CARD", "ONLINE_BANKING"]).optional(),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
});
```
