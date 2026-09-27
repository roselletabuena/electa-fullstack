# Phase 1 Data Model: Organizer Voting Rules & Daily Free Vote Quota Configuration

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Database Schema Changes (Prisma)

### Updated `Event` Model

```prisma
model Event {
  id                  String                 @id @default(uuid())
  slug                String                 @unique
  title               String
  description         String
  bannerUrl           String
  startsAt            DateTime
  endsAt              DateTime
  publicationStatus   EventPublicationStatus @default(DRAFT)
  draftPassphraseHash String?
  showResultsOnClose  Boolean                @default(true)
  isFreeVotingEnabled Boolean                @default(true)
  dailyFreeVoteLimit  Int                    @default(1)
  organizerId         String
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt

  contestants         Contestant[]
  awardCategories     AwardCategory[]
  auditLogs           EventAuditLog[]

  @@index([slug])
  @@index([organizerId])
  @@index([publicationStatus, startsAt, endsAt])
}
```

### Existing `EventAuditLog` Model (Referenced)

```prisma
model EventAuditLog {
  id          String   @id @default(uuid())
  eventId     String
  action      String   // Value: "UPDATE_VOTING_RULES"
  changedBy   String   // Organizer User ID
  previousVal Json     // Snapshot: { isFreeVotingEnabled, dailyFreeVoteLimit }
  newVal      Json     // Snapshot: { isFreeVotingEnabled, dailyFreeVoteLimit }
  reason      String?  // Optional explanation provided by organizer
  createdAt   DateTime @default(now())

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
}
```

---

## 2. Validation Schemas (Zod)

Located in `src/lib/validations/event-voting-rules.ts`:

```typescript
import { z } from "zod";

export const votingRulesFormSchema = z.object({
  isFreeVotingEnabled: z.boolean({
    required_error: "Free voting toggle state is required",
  }),
  dailyFreeVoteLimit: z.coerce
    .number({
      required_error: "Daily free vote limit is required",
      invalid_type_error: "Daily free vote limit must be a valid number",
    })
    .int("Daily free vote limit must be an integer")
    .min(1, "Daily free vote limit must be between 1 and 5")
    .max(5, "Daily free vote limit must be between 1 and 5"),
  reason: z
    .string()
    .trim()
    .max(500, "Reason for change must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateVotingRulesInputSchema = votingRulesFormSchema.extend({
  slug: z.string().min(1, "Event slug is required"),
});

export type VotingRulesFormValues = z.infer<typeof votingRulesFormSchema>;
export type UpdateVotingRulesInput = z.infer<typeof updateVotingRulesInputSchema>;
```

---

## 3. TypeScript Domain Types

Located in `src/features/events/types/index.ts`:

```typescript
export interface VotingRulesSnapshot {
  isFreeVotingEnabled: boolean;
  dailyFreeVoteLimit: number;
}

export interface UpdateVotingRulesResult {
  success: boolean;
  message: string;
  data?: {
    isFreeVotingEnabled: boolean;
    dailyFreeVoteLimit: number;
    auditLogId: string;
  };
  errors?: Record<string, string[]>;
}
```
