# Research & Architecture Decisions: Event Archetype Schema, Taxonomy Models & Validation Service

**Feature**: `040-event-archetype-schema-taxonomy`  
**Date**: 2026-10-13  

---

## 1. Stack Context (Pre-established — Electa Constitution §I–§VI)

| Concern | Decision | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 App Router | Modern React Server Components architecture. |
| **Language** | TypeScript 5 strict mode | No `any`, no non-null assertions `!`. Strict type safety. |
| **Database** | PostgreSQL via Supabase, Prisma ORM | Single source of truth in `prisma/schema.prisma` accessed via `db` singleton (`src/lib/db.ts`). |
| **Validation** | Zod v3 schemas | All inputs validated at boundaries before touching DB. |
| **API Envelope** | `ApiResponse<T>` (`src/lib/api/response.ts`) | Consistent `{ success: true, data: T }` and `{ success: false, error: string }`. |
| **Branding** | Electa Brutalist Design Tokens | Zero-radius geometry (`rounded-none`), Outfit & Sora typography, light-mode first. |

---

## 2. Technical Decisions & Rationale

### Decision 1: Model Naming — `EventPosition` vs Generic `TaxonomyGroup`

- **Options Considered**:
  1. `TaxonomyGroup` with generic `type` field ("POSITION", "TRACK", "DIVISION").
  2. Separate `EventPosition` model while keeping `Division` and `AwardCategory` as specialized models.
  3. Polymorphic table altering `Division` to serve all purposes.
- **Chosen**: **Option 2: `EventPosition`**.
- **Rationale**:
  - Pageant `Division` and `AwardCategory` are already referenced in 10+ frontend components, routes, and migrations. Refactoring `Division` polymorphically creates high regression risk and breaks existing event assumptions.
  - Student Council elections and Hackathons specifically require positional attributes such as `maxSelectionsPerVoter` (e.g. choose 1 President, choose 5 Senators, or submit to 1 Track).
  - Introducing `EventPosition` with a 1-to-many relation from `Event` and an optional `positionId` foreign key on `Contestant` and `Vote` provides clear, explicit semantics without overloading existing models.
  - Adding `archetype EventArchetype @default(PAGEANT)` to `Event` ensures existing rows transparently remain pageants.

### Decision 2: Backward Compatibility for Existing Pageants

- **Decision**: Set `@default(PAGEANT)` on `Event.archetype` enum.
- **Rationale**:
  - Existing database records will automatically receive `PAGEANT` on migration.
  - The unified taxonomy service will return all three layers: `positions`, `divisions`, and `awardCategories`.
  - Legacy routes (such as `/api/events/[slug]/categories`) continue to return `divisions` and `awardCategories` without breaking frontend consumers.

### Decision 3: Contestant and Vote Relations to `EventPosition`

- **Decision**: Add optional `positionId String?` to both `Contestant` and `Vote` with `onDelete: SetNull`.
- **Rationale**:
  - In student elections and hackathons, contestants are candidates for a position (or projects in a track).
  - In voting, a vote is cast for a candidate under a specific position or award category.
  - Making `positionId` optional ensures existing pageant contestant records and votes are completely unaffected.
  - `onDelete: SetNull` ensures that if an organizer deletes an office, candidates are not accidentally permanently deleted from the event.

### Decision 4: Zod Validation Bounds

- **Decision**: Enforce `maxSelectionsPerVoter >= 1` (integer) and `0 <= minSelectionsPerVoter <= maxSelectionsPerVoter`.
- **Rationale**:
  - A position where voters cannot select anyone (`0`) is invalid; an open seat must allow at least 1 selection.
  - Multi-seat positions (e.g., Senators, Councilors, Trustees) typically allow 2–12 selections.
  - A maximum limit of 50 prevents denial-of-service/combinatorial voting ballot attacks.
