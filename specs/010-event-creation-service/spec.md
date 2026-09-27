# Feature Specification: Event Creation Service, Zod Schema & Slug Availability Verification API

**Feature Branch**: `010-event-creation-service`

**Created**: 2026-09-27

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-48 - [BE] Event Creation Service, Zod Schema & Slug Availability API"

## Clarifications

### Session 2026-09-27

- **Q: Should the slug availability check prohibit reserved system route names (e.g., `new`, `edit`, `admin`, `api`, `dashboard`, `settings`, `check-slug`) in addition to checking for database collisions?**
  - **A:** Option A (Block reserved system keywords `new`, `edit`, `admin`, `api`, `dashboard`, `settings`, `check-slug` in both slug Zod schema validation and slug availability checks to prevent URL routing collisions).
- **Q: How should the event creation backend capability be exposed to client callers?**
  - **A:** Option A (Expose both a Server Action `createEventAction` for UI form submissions and a REST Route Handler `POST /api/events`, powered by a core event creation service).
- **Q: Should the event creation service create an initial audit log record when a new event is persisted?**
  - **A:** Option A (Create an initial `EVENT_CREATED` audit log record in `EventAuditLog` within the same database transaction to establish a full provenance trail).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Secure Multi-Tenant Event Creation & Initial Audit Trail (Priority: P1)

An authenticated event organizer submits valid event details (title, slug, description, banner URL, schedule) to initialize a new competition. The backend service validates the payload, binds the organizer's authenticated ID, applies default lifecycle and voting configuration, records an initial `EVENT_CREATED` audit log entry, and persists the event record atomically within a database transaction. Both Server Action (for UI forms) and REST API (for external/programmatic use) interfaces are provided.

**Why this priority**: Core backend functionality required to allow organizers to create new voting events in the platform with full governance traceability.

**Independent Test**: Can be tested by invoking either the `createEventAction` Server Action or `POST /api/events` with a valid payload from an authenticated organizer session and verifying that a 201 Created response (or successful action result) is returned with the persisted event record and an associated `EventAuditLog` record matching the organizer's ID.

**Acceptance Scenarios**:

1. **Given** an authenticated organizer and a valid event creation payload, **When** the event creation service is executed via Server Action or API route, **Then** a new record is created in the database with `organizerId` bound to the user's ID, `publicationStatus` set to `DRAFT`, `isFreeVotingEnabled` set to `true`, `dailyFreeVoteLimit` set to `1`, and `showResultsOnClose` set to `true`.
2. **Given** event creation execution, **When** persisted to the database, **Then** an `EventAuditLog` record with `action: "EVENT_CREATED"` and `changedBy: organizerId` is written in the same transaction.
3. **Given** successful creation via `POST /api/events`, **When** the server responds, **Then** it returns HTTP status 201 Created with the full created event entity in a standardized `ApiResponse` envelope.
4. **Given** successful creation via `createEventAction`, **When** executed, **Then** it returns a typed action success state `{ success: true, data: Event }`.

---

### User Story 2 - Real-Time Slug Availability & Format Verification (Priority: P2)

An organizer typing an event name or custom slug needs immediate feedback on whether their desired URL slug is available or already taken by another event. The backend provides a lightweight verification endpoint that normalizes the slug, checks against reserved keywords, and verifies case-insensitive uniqueness against existing records.

**Why this priority**: Prevents URL routing conflicts and provides responsive feedback to frontend forms during event drafting.

**Independent Test**: Can be tested by sending GET requests to `/api/events/check-slug?slug=[value]` for reserved keywords, existing slugs, and available slugs, verifying `{ available: true }` or `{ available: false }` responses.

**Acceptance Scenarios**:

1. **Given** a slug query parameter that does not exist in the database and is not reserved (e.g. `summer-gala-2026`), **When** querying `/api/events/check-slug?slug=summer-gala-2026`, **Then** the endpoint returns HTTP 200 with `{ available: true }`.
2. **Given** a slug query parameter that matches a reserved system keyword (e.g. `new`, `dashboard`, `admin`, `api`, `settings`, `check-slug`), **When** querying `/api/events/check-slug?slug=new`, **Then** the endpoint returns HTTP 200 with `{ available: false }`.
3. **Given** a slug query parameter that matches an existing event's slug in any case combination (e.g. `MUPH-2026` matching `muph-2026`), **When** querying `/api/events/check-slug?slug=MUPH-2026`, **Then** the endpoint returns HTTP 200 with `{ available: false }`.
4. **Given** a slug query parameter that violates formatting rules (e.g. contains spaces or special characters), **When** querying `/api/events/check-slug?slug=invalid+slug!`, **Then** the endpoint returns HTTP 400 Bad Request with format error details.

---

### User Story 3 - Strict Schema Boundary Validation & Temporal Guardrails (Priority: P3)

The backend enforces strict schema validation on all incoming event creation payloads to ensure data consistency, prevent malformed records, prohibit reserved keywords as slugs, and validate that event end dates occur logically after start dates.

**Why this priority**: Protects database integrity and ensures all event schedules conform to operational window rules.

**Independent Test**: Can be tested by submitting payloads with missing fields, reserved slugs, invalid URLs, short descriptions, or invalid date windows, confirming that HTTP 400 with field-level error messages is returned.

**Acceptance Scenarios**:

1. **Given** a payload with a title shorter than 3 characters or longer than 120 characters, **When** submitted for event creation, **Then** the server rejects the request with HTTP 400 Bad Request (or action error) and specific validation messages for `title`.
2. **Given** a payload with a slug matching a reserved system word (e.g. `new`), **When** submitted, **Then** the server rejects the request with HTTP 400 Bad Request indicating the slug is reserved.
3. **Given** a payload where `endsAt` is less than 1 hour after `startsAt` (or before `startsAt`), **When** submitted, **Then** the server rejects the request with HTTP 400 Bad Request indicating the minimum 1-hour duration requirement.
4. **Given** a payload with an invalid `bannerUrl` format or description under 10 characters, **When** submitted, **Then** the server rejects the request with HTTP 400 Bad Request.

---

### User Story 4 - Unauthorized Request Interception (Priority: P4)

The backend guards private organizer creation endpoints and actions against unauthenticated requests, ensuring multi-tenant isolation and security.

**Why this priority**: Essential security layer preventing anonymous or unauthorized event provisioning.

**Independent Test**: Can be tested by sending POST requests to the event creation endpoint or invoking the Server Action without valid session credentials, verifying immediate 401 Unauthorized rejection.

**Acceptance Scenarios**:

1. **Given** an unauthenticated request to the event creation endpoint or Server Action, **When** processed by the server, **Then** the request is rejected with HTTP 401 Unauthorized before any business logic or database operations execute.

---

### Edge Cases

- **Reserved Keyword Slugs**: Slugs matching reserved words (`new`, `edit`, `admin`, `api`, `dashboard`, `settings`, `check-slug`) are rejected during schema validation and reported as unavailable by the check endpoint.
- **Concurrent Slug Collision (Race Condition)**: If two organizers submit the same unused slug simultaneously, the database unique constraint catches the collision and the service returns a 409 Conflict or 400 Bad Request error with a friendly duplicate slug message.
- **Case-Insensitive Uniqueness**: Slugs submitted in uppercase or mixed-case are normalized to lowercase before database query and insertion.
- **Timezone Inconsistencies**: All date/time fields (`startsAt`, `endsAt`) are accepted in ISO 8601 strings and parsed/persisted in UTC.
- **Leading/Trailing Whitespace**: String inputs (title, description, slug) are trimmed during validation.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST expose a slug availability endpoint at `/api/events/check-slug` that accepts a `slug` query parameter.
- **FR-002**: System MUST perform a case-insensitive lookup against existing event slugs and verify against reserved system words (`new`, `edit`, `admin`, `api`, `dashboard`, `settings`, `check-slug`), returning `{ available: boolean }`.
- **FR-003**: System MUST define and enforce a strict Zod validation schema for event creation inputs (`createEventSchema`) with the following rules:
  - `title`: string, trimmed, min 3 characters, max 120 characters.
  - `slug`: string, lowercase alphanumeric and hyphens only (`^[a-z0-9-]+$`), min 3 characters, max 60 characters, non-reserved keyword.
  - `description`: string, trimmed, min 10 characters.
  - `bannerUrl`: string, valid URL format.
  - `startsAt`: valid ISO 8601 DateTime string.
  - `endsAt`: valid ISO 8601 DateTime string, verified to be at least 1 hour (3600 seconds) after `startsAt`.
- **FR-004**: System MUST reject invalid payloads with HTTP 400 Bad Request (or formatted action errors) containing structured field-level error messages.
- **FR-005**: System MUST require an authenticated session for event creation, rejecting unauthenticated requests with HTTP 401 Unauthorized.
- **FR-006**: System MUST persist the new event record in the database bound to the authenticated user's `organizerId`.
- **FR-007**: System MUST set default values on new event records: `publicationStatus: DRAFT`, `isFreeVotingEnabled: true`, `dailyFreeVoteLimit: 1`, and `showResultsOnClose: true`.
- **FR-008**: System MUST write an initial audit record in `EventAuditLog` with `action: "EVENT_CREATED"` in the same Prisma transaction as the event creation.
- **FR-009**: System MUST provide both a Server Action `createEventAction` (for form submissions) and a Route Handler `POST /api/events` returning HTTP 201 Created with a typed `ApiResponse` envelope.

### Key Entities

- **Event**: Core event entity with attributes `id`, `slug`, `title`, `description`, `bannerUrl`, `startsAt`, `endsAt`, `publicationStatus`, `showResultsOnClose`, `isFreeVotingEnabled`, `dailyFreeVoteLimit`, `organizerId`, `createdAt`, `updatedAt`.
- **EventAuditLog**: Audit trail entity recording `id`, `eventId`, `action` (`EVENT_CREATED`), `changedBy`, `previousVal`, `newVal`, `createdAt`.
- **SlugCheckResponse**: Lightweight response entity containing `{ available: boolean, slug: string }`.
- **CreateEventInput**: Validated payload containing title, slug, description, bannerUrl, startsAt, and endsAt.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Slug availability checks respond in under 50ms for 95% of queries.
- **SC-002**: 100% of invalid event payloads are rejected with structured field errors prior to database mutation.
- **SC-003**: 100% of newly created events are correctly associated with the authenticated organizer's ID with default `DRAFT` status and an initial audit log entry.
- **SC-004**: Zero duplicate or casing-variant slugs are permitted into the database.

## Assumptions

- Authentication verification utilizes the existing `getSession()` utility and AWS Cognito session tokens.
- Database access uses the central Prisma singleton (`src/lib/db.ts`).
- Standard API response envelopes follow the `ApiResponse<T>` structure mandated by the VoteSphere Constitution.
