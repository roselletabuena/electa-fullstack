# Phase 1 Data Model: Organizer Event Operational Schedule & Publication Lifecycle Controls

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Prisma Schema Entities

The feature leverages existing fields on the `Event` and `EventAuditLog` models in `prisma/schema.prisma`.

```prisma
enum EventPublicationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

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

model EventAuditLog {
  id          String   @id @default(uuid())
  eventId     String
  action      String
  changedBy   String
  previousVal Json
  newVal      Json
  reason      String?
  createdAt   DateTime @default(now())

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
}
```

---

## 2. Zod Validation Schemas

Located in `src/lib/validations/event-schedule-lifecycle.ts`:

```typescript
import { z } from "zod";

export const eventPublicationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const scheduleLifecycleFormSchema = z
  .object({
    startsAt: z
      .string()
      .min(1, "Voting start date and time is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date format"),
    endsAt: z
      .string()
      .min(1, "Voting end date and time is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end date format"),
    publicationStatus: eventPublicationStatusSchema.default("DRAFT"),
    draftPassphrase: z
      .string()
      .max(100, "Draft passphrase cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),
    clearDraftPassphrase: z.boolean().default(false),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();
      return end > start;
    },
    {
      message: "Voting end date must be after start date",
      path: ["endsAt"],
    },
  )
  .refine(
    (data) => {
      if (data.draftPassphrase && data.draftPassphrase.trim().length > 0) {
        return data.draftPassphrase.trim().length >= 4;
      }
      return true;
    },
    {
      message: "Draft preview passphrase must be at least 4 characters",
      path: ["draftPassphrase"],
    },
  );

export type ScheduleLifecycleFormValues = z.infer<typeof scheduleLifecycleFormSchema>;
export type UpdateScheduleLifecycleInput = ScheduleLifecycleFormValues;
```

---

## 3. Domain Types & DTOs

Located in `src/features/events/types/index.ts`:

```typescript
export interface ScheduleLifecycleSnapshot {
  startsAt: string;
  endsAt: string;
  publicationStatus: EventPublicationStatus;
  hasDraftPassphrase: boolean;
}

export interface ScheduleLifecycleAuditPayload {
  startsAt: string;
  endsAt: string;
  publicationStatus: EventPublicationStatus;
  hasDraftPassphrase: boolean;
}
```

---

## 4. Publication Lifecycle State Machine

| Current State | Target State | Allowed? | Preconditions & Requirements                                                                  |
| :------------ | :----------- | :------- | :-------------------------------------------------------------------------------------------- |
| `DRAFT`       | `PUBLISHED`  | Yes      | Requires valid `startsAt` and `endsAt` with `endsAt > startsAt`. Prompts confirmation dialog. |
| `DRAFT`       | `ARCHIVED`   | Yes      | Prompts confirmation dialog.                                                                  |
| `PUBLISHED`   | `DRAFT`      | Yes      | Prompts warning confirmation dialog (unpublishes live event).                                 |
| `PUBLISHED`   | `ARCHIVED`   | Yes      | Prompts confirmation dialog (locks voting permanently).                                       |
| `ARCHIVED`    | `PUBLISHED`  | Yes      | Prompts confirmation dialog (reopens archived event).                                         |
| `ARCHIVED`    | `DRAFT`      | Yes      | Prompts confirmation dialog.                                                                  |
