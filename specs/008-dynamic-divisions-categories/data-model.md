# Data Model: Dynamic Divisions & Award Categories

**Feature**: Dynamic Divisions & Award Categories Data Model and API  
**Branch**: `008-dynamic-divisions-categories`  
**Date**: 2026-09-27

## Overview

This document specifies the database models, relations, Zod validation schemas, and TypeScript domain types for the dynamic competition divisions and award categories taxonomy in VoteSphere.

---

## Prisma Schema Models

### 1. `Division` Model

Represents an event-scoped competition division bracket (e.g., "Miss Universe", "Mister Global", "Teen", "Adult").

```prisma
model Division {
  id           String       @id @default(uuid())
  eventId      String
  name         String
  description  String?
  displayOrder Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  event        Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  contestants  Contestant[]

  @@unique([eventId, name])
  @@index([eventId])
  @@index([eventId, displayOrder])
}
```

### 2. `AwardCategory` Model (Enhanced)

Represents an event-scoped award category track (e.g., "People's Choice", "Best Evening Gown") with individual voting toggle and display ordering.

```prisma
model AwardCategory {
  id           String                         @id @default(uuid())
  eventId      String
  name         String
  description  String?
  isVotingOpen Boolean                        @default(true)
  displayOrder Int                            @default(0)
  createdAt    DateTime                       @default(now())
  updatedAt    DateTime                       @updatedAt

  event        Event                          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  contestants  ContestantCategoryAssignment[]

  @@unique([eventId, name])
  @@index([eventId])
  @@index([eventId, displayOrder])
}
```

### 3. `Contestant` Model Updates

Updated to reference the dynamic `Division` relation alongside existing fields:

```prisma
model Contestant {
  id               String                         @id @default(uuid())
  eventId          String
  contestantNumber Int
  name             String
  divisionId       String?
  status           ContestantStatus               @default(ACTIVE)
  hometown         String?
  heightCm         Int?
  bio              String?
  advocacy         String?
  avatarUrl        String
  instagramUrl     String?
  tiktokUrl        String?
  facebookUrl      String?
  voteCount        Int                            @default(0)
  createdAt        DateTime                       @default(now())
  updatedAt        DateTime                       @updatedAt

  event            Event                          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  division         Division?                      @relation(fields: [divisionId], references: [id], onDelete: SetNull)
  media            ContestantMedia[]
  categories       ContestantCategoryAssignment[]

  @@unique([eventId, contestantNumber])
  @@index([eventId])
  @@index([eventId, status])
  @@index([eventId, divisionId])
}
```

---

## Validation Schemas (Zod)

Located in `src/lib/validations/category-awards.ts` and `src/lib/validations/division.ts`:

### Division Validation Schemas

```typescript
import { z } from "zod";

export const createDivisionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Division name is required")
    .max(100, "Division name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .default(0),
});

export const updateDivisionSchema = createDivisionSchema.partial();

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>;
```

### Award Category Validation Schemas

```typescript
import { z } from "zod";

export const createAwardCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  isVotingOpen: z.boolean().default(true),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .default(0),
});

export const updateAwardCategorySchema = createAwardCategorySchema.partial();

export type CreateAwardCategoryInput = z.infer<typeof createAwardCategorySchema>;
export type UpdateAwardCategoryInput = z.infer<typeof updateAwardCategorySchema>;
```

---

## TypeScript Domain Types

Located in `src/features/events/types/index.ts`:

```typescript
export interface DivisionDto {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  contestantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AwardCategoryDto {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  isVotingOpen: boolean;
  displayOrder: number;
  contestantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventTaxonomyDto {
  divisions: DivisionDto[];
  awardCategories: AwardCategoryDto[];
}
```
