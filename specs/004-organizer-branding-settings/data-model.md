# Data Model & Validation Schemas: Organizer Event Branding

**Feature**: `004-organizer-branding-settings` | **Spec**: [spec.md](../spec.md)

---

## 1. Database Schema (`prisma/schema.prisma`)

The feature utilizes the existing `Event` and `EventAuditLog` Prisma models without requiring destructive schema changes:

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
  organizerId         String
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt

  auditLogs           EventAuditLog[]
}

model EventAuditLog {
  id          String   @id @default(uuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  action      String   // "UPDATE_BRANDING"
  changedBy   String   // session.userId
  previousVal Json     // { title: string, description: string, bannerUrl: string }
  newVal      Json     // { title: string, description: string, bannerUrl: string }
  reason      String?  // Optional audit context note
  createdAt   DateTime @default(now())

  @@index([eventId])
}
```

---

## 2. Zod Validation Schemas (`src/lib/validations/event-branding.ts`)

```typescript
import { z } from "zod";

export const updateEventBrandingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Event title must be at least 3 characters")
    .max(100, "Event title must not exceed 100 characters"),
  description: z.string().trim().max(2000, "Description must not exceed 2000 characters"),
  bannerUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .regex(/^https:\/\/.+/i, "Banner image URL must use secure HTTPS protocol"),
  reason: z
    .string()
    .trim()
    .max(500, "Reason must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type UpdateEventBrandingInput = z.infer<typeof updateEventBrandingSchema>;
```

---

## 3. Server Action Return Type Envelope

```typescript
export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```
