# Research: Dynamic Divisions & Award Categories Data Model and API

**Feature**: Dynamic Divisions & Award Categories Data Model and API  
**Branch**: `008-dynamic-divisions-categories`  
**Date**: 2026-09-27

## Executive Summary

To support arbitrary competition formats without relying on fixed global enums (such as `enum ContestantDivision { FEMALE, MALE, LGBTQ, TEEN }`), VoteSphere requires a dynamic, event-scoped taxonomy model. This research establishes the architectural decisions for introducing a database-backed `Division` model, enhancing the `AwardCategory` model with display ordering, updating contestant relationships, and exposing robust, validated REST Route Handlers.

---

## Key Technical Decisions

### Decision 1: Database Schema & Migration Strategy for Dynamic Divisions

- **Context**: The existing database schema defines a static enum `ContestantDivision` (`FEMALE`, `MALE`, `LGBTQ`, `TEEN`) hardcoded in `prisma/schema.prisma`. Organizers need the flexibility to define any custom division (e.g., "Little Miss", "Grand Seniors", "Varsity Dance", "Chamber Choir") per event.
- **Decision**:
  1. Introduce a new `Division` model in `prisma/schema.prisma`:
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
  2. Enhance the existing `AwardCategory` model with `displayOrder`:
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
  3. Update `Contestant` to reference `divisionId String?` (with optional or required `Division` relation) while keeping backwards compatibility during migration.
- **Rationale**: Event-scoped uniqueness `@@unique([eventId, name])` guarantees organizers can name divisions as needed without collisions across different events. Adding `displayOrder` allows explicit, deterministic ordering in voter ballots and management dashboards.
- **Alternatives Considered**:
  - _JSON column on Event model_: Storing divisions as a JSON array (`Event.divisions JSON`) was rejected because it prohibits foreign key relational integrity, cascading deletions, and efficient indexing for contestant joins.
  - _Keep static enum with fallback string_: Rejected because it leads to split code paths and incomplete dynamic capabilities.

---

### Decision 2: API Architecture & Endpoint Design

- **Context**: Clients (organizer management dashboards, contestant roster forms, voter ballot UIs) require both atomic CRUD operations on individual divisions/categories and a consolidated retrieval mechanism.
- **Decision**:
  1. Provide unified read endpoint: `GET /api/events/[slug]/categories` returning both divisions and award categories in a structured taxonomy envelope.
  2. Provide dedicated division endpoints:
     - `GET /api/events/[slug]/divisions` — List all divisions for an event sorted by `displayOrder asc, name asc`.
     - `POST /api/events/[slug]/divisions` — Create a new division (Organizer auth required).
     - `PATCH /api/events/[slug]/divisions/[divisionId]` — Update division properties (Organizer auth required).
     - `DELETE /api/events/[slug]/divisions/[divisionId]` — Delete division if unassigned (Organizer auth required).
  3. Provide dedicated award category endpoints:
     - `GET /api/events/[slug]/award-categories` (and alias on `GET /api/events/[slug]/categories`) — List all award categories for an event sorted by `displayOrder asc, name asc`.
     - `POST /api/events/[slug]/award-categories` — Create a new category (Organizer auth required).
     - `PATCH /api/events/[slug]/award-categories/[categoryId]` — Update category (Organizer auth required).
     - `DELETE /api/events/[slug]/award-categories/[categoryId]` — Delete category if unlinked (Organizer auth required).
- **Rationale**: Conforms to RESTful conventions, allows independent caching and granular mutations, while keeping backward compatibility with the existing `/api/events/[slug]/categories` endpoint.
- **Alternatives Considered**:
  - _Single bulk-save endpoint_: Rejected for fine-grained operations because it requires sending the full taxonomy tree on minor label edits.

---

### Decision 3: Input Validation & Boundary Defense

- **Context**: Division and category names must not be empty, must not exceed reasonable length limits, and must reject whitespace-padded duplicates.
- **Decision**:
  - Use Zod schemas colocated in `src/lib/validations/category-awards.ts` and `src/lib/validations/division.ts`.
  - Transform and trim strings automatically: `.trim().min(1, "Name is required").max(100, "Name cannot exceed 100 characters")`.
  - Validate display orders as non-negative integers: `z.number().int().min(0).default(0)`.
  - Validate `isVotingOpen` as boolean: `z.boolean().default(true)`.
  - Wrap all Route Handler responses in `apiSuccess<T>` and `apiError` standard envelopes (Constitution Principle I & II).
- **Rationale**: Guarantees consistent validation error messages across all endpoints with zero unchecked runtime inputs.

---

### Decision 4: Authorization & Multi-Tenant Isolation

- **Context**: Only the authenticated event owner (or authorized platform admin) can mutate event divisions and award categories.
- **Decision**:
  - Leverage `requireEventOwnership(slug)` / `getSession()` to verify that the requesting user owns the event associated with the target slug before performing any `POST`, `PATCH`, or `DELETE` mutation.
  - Return HTTP 401 for unauthenticated requests, HTTP 403 for unauthorized organizer accounts, and HTTP 404 if the event or resource does not exist.
  - Public `GET` access is permitted for events that are `PUBLISHED` or for the event's organizer.
- **Rationale**: Satisfies Constitution Principle IV (Secure-by-Design & Auth Integrity) with strict multi-tenant isolation.

---

### Decision 5: Deletion Safeguards & Referential Integrity

- **Context**: Deleting a division or category that is actively referenced by contestants or voting records could lead to orphaned data or corrupt tally results.
- **Decision**:
  - Before executing a division deletion, check `db.contestant.count({ where: { divisionId } })`. If count > 0, reject with HTTP 409 / 400 with message `"Cannot delete division with registered contestants. Reassign or remove contestants first."`.
  - Before executing an award category deletion, check `db.contestantCategoryAssignment.count({ where: { awardCategoryId } })`. If count > 0, reject with HTTP 409 / 400 with message `"Cannot delete award category assigned to contestants."`.
- **Rationale**: Prevents accidental data destruction and maintains strict database integrity without orphan cascade hazards.
