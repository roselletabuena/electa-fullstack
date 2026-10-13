# Data Model: Event Archetype Schema, Taxonomy Models & Validation Service

**Feature**: `040-event-archetype-schema-taxonomy`  
**Date**: 2026-10-13  

---

## 1. Entities & Schema Additions

### Enum: `EventArchetype`

```prisma
enum EventArchetype {
  PAGEANT
  STUDENT_COUNCIL
  HACKATHON
  CUSTOM
}
```

### Model: `EventPosition`

Represents an elected office, hackathon track, or custom contest grouping with selection constraints.

```prisma
model EventPosition {
  id                   String       @id @default(uuid())
  eventId              String
  name                 String
  description          String?
  maxSelectionsPerVoter Int         @default(1)
  minSelectionsPerVoter Int         @default(0)
  displayOrder         Int          @default(0)
  isVotingOpen         Boolean      @default(true)
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  event                Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  contestants          Contestant[]
  votes                Vote[]

  @@unique([eventId, name])
  @@index([eventId])
  @@index([eventId, displayOrder])
}
```

### Updates to `Event` Model

```prisma
model Event {
  // Existing fields...
  archetype           EventArchetype         @default(PAGEANT)
  
  // Existing relations...
  positions           EventPosition[]
}
```

### Updates to `Contestant` Model

```prisma
model Contestant {
  // Existing fields...
  positionId       String?
  
  // Existing relations...
  position         EventPosition?                 @relation(fields: [positionId], references: [id], onDelete: SetNull)

  @@index([eventId, positionId])
}
```

### Updates to `Vote` Model

```prisma
model Vote {
  // Existing fields...
  positionId           String?
  
  // Existing relations...
  position             EventPosition?      @relation(fields: [positionId], references: [id], onDelete: SetNull)

  @@index([positionId])
}
```

---

## 2. Invariants & Constraints

1. **`Event.archetype`**: Default is `PAGEANT`. Cannot be null.
2. **`EventPosition.name`**: Must be unique per event (`@@unique([eventId, name])`). Length: 1 to 100 characters.
3. **`EventPosition.maxSelectionsPerVoter`**: Must be an integer `>= 1` and `<= 50`.
4. **`EventPosition.minSelectionsPerVoter`**: Must be an integer `>= 0` and `<= maxSelectionsPerVoter`.
5. **Cascading Deletion**: Deleting an `Event` cascades to delete its `EventPosition` records.
6. **Contestant Safety**: Deleting an `EventPosition` does NOT delete candidates; `positionId` is set to `NULL` (`onDelete: SetNull`).
7. **Vote Safety**: Deleting an `EventPosition` sets `Vote.positionId` to `NULL` (`onDelete: SetNull`), preserving audit trail and payment records.

---

## 3. Data Transfer Objects (DTOs)

```typescript
export interface EventPositionDto {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  maxSelectionsPerVoter: number;
  minSelectionsPerVoter: number;
  displayOrder: number;
  isVotingOpen: boolean;
  candidateCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedTaxonomyDto {
  archetype: EventArchetype;
  positions: EventPositionDto[];
  divisions: DivisionDto[];
  awardCategories: AwardCategoryDto[];
}
```
