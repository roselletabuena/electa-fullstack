# Feature Specification: Event Archetype Schema, Taxonomy Models & Validation Service

**Feature ID**: `040-event-archetype-schema-taxonomy`  
**Ticket**: [VS-83](https://the-three-devsketeers.atlassian.net/browse/VS-83)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102) (`[Epic] Event Creation Experience & Organizer Onboarding Overhaul`)  
**Status**: Draft  
**Created**: 2026-10-13  

---

## 1. Overview & Business Value

Electa was originally designed with assumptions tailored primarily to beauty pageants (`ContestantDivision`, contestant numbers, paid vote packages, single-winner categories). To transform Electa into an institutional-grade multi-tenant election and voting platform capable of powering Student Council Elections, Hackathons, and Community Awards alongside Pageants, the core data layer and domain models must support event archetypes.

This feature establishes the **Event Archetype Foundation**:
1. An `EventArchetype` enumeration (`PAGEANT`, `STUDENT_COUNCIL`, `HACKATHON`, `CUSTOM`) in the Prisma schema with a safe, non-destructive migration.
2. An `EventPosition` grouping model supporting multi-seat elections and track divisions with configurable `maxSelectionsPerVoter` and `minSelectionsPerVoter`.
3. Candidate association to positions (`Contestant.positionId`) and vote attribution (`Vote.positionId`).
4. Strict Zod validation schemas (§I) enforcing positive bounds on selection limits.
5. A unified data access service (`taxonomy-service.ts`) providing CRUD and ordering operations for positions, divisions, and categories while preserving 100% backward compatibility for existing pageant events.

---

## 2. Actors & User Stories

### User Story

> **As a** platform developer and event organizer,  
> **I want to** define an `EventArchetype` enumeration and flexible grouping schema (offices, tracks, divisions) in Prisma,  
> **so that** Electa can model student council elections, hackathons, and pageants without rigid pageant-only database assumptions.

### Actors
- **Event Organizer**: Configures event archetype during creation and defines positions/tracks (e.g. "President", "Senator", "Best AI Hack") with selection rules.
- **Voter**: Casts ballots constrained by archetype-specific selection limits (e.g., select up to 5 senators, 1 president).
- **Platform Developer**: Consumes clean, strongly typed taxonomy services for downstream wizard UIs (VS-84) and voting engines (VS-85).

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Event Archetype and Position Configuration

- **Given** an event creation or settings mutation specifying `archetype: "STUDENT_COUNCIL"`,
- **When** the taxonomy service creates positions (e.g., `"President"` with `maxSelectionsPerVoter: 1`, `"Senator"` with `maxSelectionsPerVoter: 5`),
- **Then** the positions are persisted in the database with their selection constraints linked to the event ID,
- **And** querying the event taxonomy returns the positions ordered by `displayOrder`.

### Scenario 2: Validation & Error Handling - Invalid Selection Limits

- **Given** an organizer attempting to save an office or track configuration,
- **When** `maxSelectionsPerVoter` is less than 1 (e.g. `0` or `-1`) or `minSelectionsPerVoter > maxSelectionsPerVoter`,
- **Then** the Zod validation rejects the input with an actionable `400 BAD_REQUEST` error envelope and descriptive field error messages.

### Scenario 3: Edge Case / Backward Compatibility

- **Given** existing pageant events in the database with legacy or default archetype values,
- **When** migrations execute and queries fetch pageant categories or divisions,
- **Then** the system defaults the archetype to `PAGEANT`,
- **And** all existing divisions, categories, and contestant associations remain completely intact with zero data loss.

### Scenario 4: Position Management (CRUD & Reordering)

- **Given** an event with existing positions,
- **When** an organizer updates a position's title or reorders positions via the taxonomy service,
- **Then** the changes are atomically persisted and returned in the updated display order,
- **And** deleting a position safely nullifies contestant links without deleting the contestants themselves (`onDelete: SetNull`).

---

## 4. Technical Scope & Boundary Mapping

| Layer | Target Files / Deliverables | Description |
| :--- | :--- | :--- |
| **Database** | `prisma/schema.prisma`<br>`prisma/migrations/*` | Add `EventArchetype` enum, `EventPosition` model, update `Event`, `Contestant`, `Vote` relations |
| **Types** | `src/features/events/types/archetype.ts`<br>`src/features/events/types/index.ts` | Strongly typed archetype interfaces, DTOs, and presets |
| **Validations** | `src/lib/validations/archetypes.ts` | Strict Zod schemas for archetype and position payloads |
| **Service Layer** | `src/features/events/services/taxonomy-service.ts` | Data access service for taxonomy CRUD and archetype queries |
| **API Contract** | `specs/040-event-archetype-schema-taxonomy/contracts/event-archetype.ts` | DTO contracts and schemas |

---

## 5. Invariants & Guarantees

1. **Zero Data Loss**: Adding `EventArchetype` and `EventPosition` will not alter or drop any columns or rows in existing tables (`Event`, `Contestant`, `Division`, `AwardCategory`, `Vote`).
2. **Default Value Integrity**: `Event.archetype` defaults to `PAGEANT`.
3. **Strict Validation**: All selection limits must satisfy `maxSelectionsPerVoter >= 1` and `0 <= minSelectionsPerVoter <= maxSelectionsPerVoter`.
4. **Unique Position Names**: Within a single event, position names must be unique (`@@unique([eventId, name])`).
5. **No `any` or `!`**: Fully compliant with Electa Constitution §I (Strict TypeScript 5).
