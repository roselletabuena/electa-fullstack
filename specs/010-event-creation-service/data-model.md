# Data Model & Type Definitions: Event Creation Service

**Feature**: `010-event-creation-service`  
**Date**: 2026-09-27  
**Status**: Ready

---

## 1. Database Entities (Prisma)

### Event Model Reference

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
  divisions           Division[]
  awardCategories     AwardCategory[]
  auditLogs           EventAuditLog[]

  @@index([slug])
  @@index([organizerId])
  @@index([publicationStatus, startsAt, endsAt])
}
```

### EventAuditLog Model Reference

```prisma
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

## 2. Validation Schemas (Zod)

```typescript
import { z } from "zod";

export const RESERVED_SLUGS = [
  "new",
  "edit",
  "admin",
  "api",
  "dashboard",
  "settings",
  "check-slug",
] as const;

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const eventSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters")
  .max(60, "Slug must not exceed 60 characters")
  .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and single hyphens")
  .refine((slug) => !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]), {
    message: "This slug is reserved by the system and cannot be used",
  });

export const checkSlugQuerySchema = z.object({
  slug: eventSlugSchema,
});

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must not exceed 120 characters"),
    slug: eventSlugSchema,
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    bannerUrl: z.string().url("Banner URL must be a valid URL"),
    startsAt: z.string().datetime({ message: "startsAt must be a valid ISO-8601 datetime string" }),
    endsAt: z.string().datetime({ message: "endsAt must be a valid ISO-8601 datetime string" }),
  })
  .refine(
    (data) => {
      const starts = new Date(data.startsAt).getTime();
      const ends = new Date(data.endsAt).getTime();
      const ONE_HOUR_MS = 60 * 60 * 1000;
      return ends - starts >= ONE_HOUR_MS;
    },
    {
      message: "Event end time must be at least 1 hour after the start time",
      path: ["endsAt"],
    },
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CheckSlugQuery = z.infer<typeof checkSlugQuerySchema>;
```

---

## 3. TypeScript Interfaces & DTOs

```typescript
import type { Event } from "@/generated/client/client";

export interface CheckSlugResult {
  available: boolean;
  slug: string;
  reason?: string;
}

export interface CreateEventResult {
  success: boolean;
  data?: Event;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
```
