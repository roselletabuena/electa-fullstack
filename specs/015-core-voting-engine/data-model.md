# Data Model: Core Voting Engine, Omnichannel Auth & Anti-Fraud

**Feature**: `015-core-voting-engine`  
**Date**: 2026-10-01

---

## 1. Existing Prisma Schema Entities

The existing database schema in `prisma/schema.prisma` already defines the core relational models:

```prisma
enum VoteType {
  FREE
  BOOST
}

model Vote {
  id              String        @id @default(uuid())
  eventId         String
  contestantId    String
  voterId         String
  awardCategoryId String?
  voteType        VoteType      @default(FREE)
  voteWeight      Int           @default(1)
  createdAt       DateTime      @default(now())

  event           Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  contestant      Contestant    @relation(fields: [contestantId], references: [id], onDelete: Cascade)

  @@index([eventId, voterId, createdAt])
  @@index([eventId, voterId, voteType, createdAt])
  @@index([contestantId])
  @@index([eventId, createdAt])
}
```

---

## 2. In-Memory & Telemetry Anti-Fraud Schemas

### Device & Velocity Invariants

```typescript
export interface VelocityRecord {
  ip: string;
  timestamps: number[];
}

export interface DeviceAccountRecord {
  deviceId: string;
  eventId: string;
  accountIds: Set<string>;
  lastSeen: number;
}
```

### Zod Validation Schemas (`src/features/voting/types/index.ts`)

```typescript
export const CastVoteInputSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  contestantId: z.string().uuid("Invalid contestant ID"),
  awardCategoryId: z.string().uuid().nullable().optional(),
  voteType: z.enum(["FREE", "BOOST"]).default("FREE"),
  voteWeight: z.number().int().min(1).max(1000).default(1),
  turnstileToken: z
    .string()
    .min(1, "Cloudflare Turnstile token required for free votes")
    .optional(),
  deviceFingerprint: z.string().min(8, "Device fingerprint required"),
  idempotencyKey: z.string().uuid("Invalid idempotency key").optional(),
});

export type CastVoteInput = z.infer<typeof CastVoteInputSchema>;
```

---

## 3. Omnichannel Auth Identity Types (`src/features/auth/types/index.ts`)

```typescript
export type AuthProvider = "google" | "apple" | "facebook" | "magic-link" | "phone-otp";

export interface PasswordlessAuthRequest {
  channel: "email" | "sms" | "whatsapp";
  destination: string; // email address or E.164 phone number
}

export interface PasswordlessVerifyRequest {
  channel: "email" | "sms" | "whatsapp";
  destination: string;
  code: string;
}
```
