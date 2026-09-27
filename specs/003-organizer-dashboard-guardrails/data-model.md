# Phase 1 Data Model: Organizer Dashboard Route & Ownership Authorization Guardrails

**Feature**: `003-organizer-dashboard-guardrails`  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Domain Entities & Database Schema

The database model is defined in `prisma/schema.prisma`. This feature consumes the existing `Event` model and relies on the `organizerId` relationship.

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

  contestants         Contestant[]
  awardCategories     AwardCategory[]
  auditLogs           EventAuditLog[]

  @@index([slug])
  @@index([organizerId])
  @@index([publicationStatus, startsAt, endsAt])
}
```

---

## 2. Authorization & Session Data Models

### User Session (`src/lib/auth/get-session.ts`)

```typescript
export interface UserSession {
  userId: string;
  email: string;
  role?: string;
}
```

### Event Ownership Authorization Result

```typescript
export type OwnershipCheckResult =
  | { authorized: true; event: Event; session: UserSession }
  | { authorized: false; reason: "UNAUTHENTICATED" }
  | { authorized: false; reason: "NOT_FOUND" }
  | { authorized: false; reason: "UNAUTHORIZED"; session: UserSession; eventTitle: string };
```

---

## 3. UI Navigation & Tab Types (`src/features/events/types/index.ts`)

```typescript
export const SETTINGS_TABS = ["general", "schedule", "voting-rules"] as const;
export type SettingsTabId = (typeof SETTINGS_TABS)[number];

export interface SettingsTabConfig {
  id: SettingsTabId;
  label: string;
  description: string;
  badge?: string;
}
```

---

## 4. Zod Validation Schemas (`src/lib/validations/event-settings.ts`)

```typescript
import { z } from "zod";

export const eventSlugParamsSchema = z.object({
  slug: z
    .string()
    .min(1, "Event slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
});

export const eventSettingsTabQuerySchema = z.object({
  tab: z.enum(["general", "schedule", "voting-rules"]).default("general").catch("general"),
});

export type EventSlugParams = z.infer<typeof eventSlugParamsSchema>;
export type EventSettingsTabQuery = z.infer<typeof eventSettingsTabQuerySchema>;
```
