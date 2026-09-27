# Phase 0 Research & Technical Decisions: Event Creation Service, Zod Schema & Slug Availability API

**Feature**: `010-event-creation-service`  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Zod Validation & Temporal Guardrail Strategy

### Decision

Define a dedicated `createEventSchema` in `src/lib/validations/event.ts` (or `src/lib/validations/create-event.ts`) that enforces:

- `title`: string, trimmed, min 3, max 120 chars.
- `slug`: string, lowercase alphanumeric and single hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), min 3, max 60 chars, filtered against `RESERVED_SLUGS`.
- `description`: string, trimmed, min 10 chars, max 5000 chars.
- `bannerUrl`: string, valid URL string (`z.string().url()`).
- `startsAt`: ISO 8601 DateTime string.
- `endsAt`: ISO 8601 DateTime string.
- `.refine()` rule: `endsAt` must be at least 1 hour (3600 seconds / 3,600,000 ms) after `startsAt`.

### Rationale

- Complies with VoteSphere Constitution Principle I (Strict Type Safety & Boundary Validation).
- Enforcing the 1-hour minimum operational window prevents accidental zero-length or inverted competition timelines.
- Centralized `RESERVED_SLUGS` constant (`['new', 'edit', 'admin', 'api', 'dashboard', 'settings', 'check-slug']`) prevents conflicts with Next.js dynamic routes (`/events/[slug]` vs `/events/new`).

### Alternatives Considered

- _Validating temporal rules only on client form_: Rejected because API endpoints and malicious payloads could bypass client checks and corrupt event lifecycle state.
- _Allowing arbitrary slug characters_: Rejected because URL safety, SEO standards, and router path parsing require standard slug format.

---

## 2. Slug Availability & Uniqueness Verification

### Decision

Implement `GET /api/events/check-slug` which:

1. Validates query parameter `slug` using a lightweight slug schema.
2. Trims and normalizes the slug to lowercase.
3. Checks whether the slug is in `RESERVED_SLUGS` blocklist; if so, returns `{ available: false, reason: "RESERVED" }` (or `{ available: false }`).
4. Performs a case-insensitive database lookup:
   ```ts
   const existing = await db.event.findFirst({
     where: { slug: { equals: normalizedSlug, mode: "insensitive" } },
     select: { id: true },
   });
   ```
5. Returns `apiSuccess({ available: !existing, slug: normalizedSlug })`.

### Rationale

- Provides real-time, low-latency (<50ms) feedback to frontend creation forms.
- Case-insensitive check protects against collisions regardless of PostgreSQL collation settings.

### Alternatives Considered

- _Checking availability only on submit_: Poor UX; organizers could fill a multi-step wizard only to receive a collision error at the final submit step.

---

## 3. Atomic Multi-Tenant Event Creation & Provenance Trail

### Decision

Encapsulate event creation logic in a shared service function `createEvent` in `src/features/events/services/create-event.ts`:

1. Authenticates session via `getSession()` and extracts `userId`.
2. Validates input payload using `createEventSchema`.
3. Normalizes `slug` to lowercase.
4. Executes a Prisma transaction (`db.$transaction`):
   - Creates `Event` record with `organizerId: session.userId`, `publicationStatus: DRAFT`, `isFreeVotingEnabled: true`, `dailyFreeVoteLimit: 1`, `showResultsOnClose: true`.
   - Creates `EventAuditLog` record with `action: "EVENT_CREATED"`, `changedBy: session.userId`, `previousVal: {}`, `newVal: { ...event }`.
5. Handles potential race-condition unique constraint violations (Prisma `P2002`) and converts them into friendly error messages: `"Event slug is already taken"`.

### Rationale

- Atomic transaction ensures 100% data integrity between event creation and audit logging (VoteSphere Constitution Principle VI).
- Decoupling the service allows seamless reuse across Server Actions and Route Handlers.

---

## 4. API & Server Action Interface Design

### Decision

Expose two distinct consumer entry points:

1. **Server Action**: `createEventAction(input: CreateEventInput)` in `src/features/events/actions/create-event.ts` for direct React Hook Form / form action submission. Returns `ActionResponse<Event>`.
2. **Route Handler**: `POST /api/events` in `src/app/api/events/route.ts` using `apiSuccess` / `apiError` standard response envelopes (`ApiResponse<Event>`).

### Rationale

- Strictly aligns with VoteSphere Constitution Principle II: Server Actions for UI forms, Route Handlers for standard REST endpoints.
