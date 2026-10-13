# Implementation Tasks: Event Archetype Schema, Taxonomy Models & Validation Service

**Feature ID**: `040-event-archetype-schema-taxonomy`  
**Ticket**: [VS-83](https://the-three-devsketeers.atlassian.net/browse/VS-83)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  
**Branch**: `feature/VS-83-event-archetype-schema-taxonomy`  

---

## Phase 1: Domain Types & Validation Contracts

**Purpose**: Establish domain types, DTOs, and strict Zod validation schemas for event archetypes and positions.

- [x] T001 Implement archetype domain types and DTOs in `src/features/events/types/archetype.ts` and re-export in `src/features/events/types/index.ts`
- [x] T002 Implement Zod validation schemas in `src/lib/validations/archetypes.ts`
- [x] T003 Implement unit tests for archetype and position validation schemas in `tests/unit/events/archetype-validation.test.ts` (Red-Green)

---

## Phase 2: Prisma Schema & Database Migration

**Purpose**: Add `EventArchetype` enum, `EventPosition` model, and relations to `prisma/schema.prisma`, execute migration, and regenerate Prisma client.

- [x] T004 Add `EventArchetype` enum, `EventPosition` model, and update `Event`, `Contestant`, and `Vote` relations in `prisma/schema.prisma`
- [x] T005 Run Prisma migration / generate client via `db-migrate` workflow and confirm compilation

---

## Phase 3: Taxonomy Service Implementation

**Purpose**: Implement the unified taxonomy data access service supporting multi-archetype grouping, CRUD, and reordering.

- [x] T006 Implement unit tests for `taxonomy-service.ts` in `tests/unit/events/taxonomy-service.test.ts` (Red)
- [x] T007 Implement `src/features/events/services/taxonomy-service.ts` with `getEventTaxonomy`, `createEventPosition`, `updateEventPosition`, `deleteEventPosition`, and `reorderEventPositions` (Green)
- [x] T008 Re-export taxonomy service functions in `src/features/events/index.ts`

---

## Phase 4: Backward Compatibility & Quality Verification

**Purpose**: Verify 100% backward compatibility with existing pageant categories, run all verification gates, and atomic commits.

- [x] T009 Run targeted unit tests: `npm run test:unit tests/unit/events/`
- [x] T010 Run full test suite: `npm run test:unit`
- [x] T011 Run typecheck and lint: `npm run typecheck && npm run lint`

---

## Phase 5: Automated Pull Request & Sync

**Purpose**: Open Pull Request via `pr-creator` targeting `main` and sync Jira ticket.

- [x] T012 Push branch and create PR via `pr-creator` targeting `origin/main`
- [x] T013 Update Jira ticket VS-83 with implementation summary and PR link

