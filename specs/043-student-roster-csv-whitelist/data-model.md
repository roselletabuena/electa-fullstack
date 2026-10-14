# Data Model: Student Roster CSV Ingestion & Email Domain Whitelist Service

**Feature**: `043-student-roster-csv-whitelist`  
**Ticket**: [VS-108](https://the-three-devsketeers.atlassian.net/browse/VS-108)  
**Date**: 2026-10-14  

---

## 1. Prisma Schema Additions

```prisma
// Extension to Event model in prisma/schema.prisma
model Event {
  // Existing fields ...
  allowedEmailDomains String[]               @default([])
  studentRoster       StudentRosterEntry[]

  // Existing relations ...
}

model StudentRosterEntry {
  id            String   @id @default(uuid())
  eventId       String
  studentIdHash String
  email         String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, email])
  @@unique([eventId, studentIdHash])
  @@index([eventId])
  @@index([studentIdHash])
  @@index([email])
}
```

---

## 2. Invariants & Storage Rules

1. **Deterministic Hashing**:
   - `studentIdHash` is computed as:
     `sha256(studentId.trim().toLowerCase())`
   - Preserves O(1) indexed lookups without exposing plain-text student numbers.
2. **Normalized Email**:
   - `email` is always stored lowercased and trimmed.
   - Enforced by unique constraint `@@unique([eventId, email])`.
3. **Cascade Deletion**:
   - When an `Event` is deleted, all associated `StudentRosterEntry` records are automatically cascaded.
4. **Domain Format**:
   - `allowedEmailDomains` stores normalized lowercase domain suffixes, e.g. `["@up.edu.ph", "@ateneo.edu"]` or `["up.edu.ph"]`. The domain check normalizes leading `@`.

---

## 3. Data Transfer Objects (DTOs)

```typescript
export interface StudentRosterRow {
  studentId: string;
  email: string;
}

export interface NormalizedRosterEntry {
  studentIdHash: string;
  email: string;
}

export interface RosterUploadResultDto {
  totalProcessed: number;
  totalIngested: number;
  totalDuplicatesSkipped: number;
  durationMs: number;
}

export interface VoterEligibilityResultDto {
  isEligible: boolean;
  matchType?: "ROSTER_STUDENT_ID" | "ROSTER_EMAIL" | "EMAIL_DOMAIN" | "NONE";
  reason?: string;
}
```
