# Implementation Tasks: Student Roster CSV Ingestion & Email Domain Whitelist Service

**Feature ID**: `043-student-roster-csv-whitelist`  
**Ticket**: [VS-108](https://the-three-devsketeers.atlassian.net/browse/VS-108)  

---

## Phase 1: Database Schema & Client Regeneration
- [x] **Task 1.1**: Update `prisma/schema.prisma` with `allowedEmailDomains` on `Event` and `StudentRosterEntry` model. `feat(roster): add StudentRosterEntry model and allowedEmailDomains to schema`
- [x] **Task 1.2**: Generate Prisma Client (`npx prisma generate`). `chore(db): regenerate prisma client for StudentRosterEntry`

---

## Phase 2: Core Validations & Service Foundation
- [x] **Task 2.1**: Implement Zod validation schemas in `src/lib/validations/roster.ts`. `feat(roster): create roster row, domain whitelist, and eligibility zod schemas`
- [x] **Task 2.2**: Implement deterministic SHA-256 hasher and streaming CSV parser in `src/features/institutions/services/roster-service.ts`. `feat(roster): implement streaming csv parser and deterministic sha-256 hasher`

---

## Phase 3: Batch Ingestion & Voter Eligibility Service
- [x] **Task 3.1**: Implement atomic roster batch ingestion and hybrid voter eligibility check in `src/features/institutions/services/roster-service.ts`. `feat(roster): implement atomic batch ingestion and hybrid voter eligibility lookup`
- [x] **Task 3.2**: Create institutions feature barrel and type exports in `src/features/institutions/index.ts`. `feat(roster): export institution feature slice and type interfaces`

---

## Phase 4: Route Handlers & Organizer Boundary
- [x] **Task 4.1**: Implement `POST /api/events/[slug]/roster` with file upload parsing, authorization, and 422 error handling. `feat(roster): add POST roster ingestion route handler with organizer authorization`
- [x] **Task 4.2**: Implement `GET /api/events/[slug]/roster` returning roster status and whitelisted domains. `feat(roster): add GET roster summary route handler`

---

## Phase 5: Test Suite, Quality Gates & Verification
- [x] **Task 5.1**: Unit tests for streaming CSV parser and deterministic hashing in `tests/unit/institutions/roster-parser.test.ts`. `test(roster): add unit tests for streaming csv parser and hashing`
- [x] **Task 5.2**: Unit tests for batch ingestion and hybrid voter eligibility in `tests/unit/institutions/roster-service.test.ts`. `test(roster): add unit tests for roster service and eligibility verification`
- [x] **Task 5.3**: Unit tests for roster API route in `tests/unit/institutions/roster-route.test.ts`. `test(roster): add unit tests for roster api route handlers`
- [x] **Task 5.4**: Run verification gates (`npm run typecheck`, `npm run lint`, `npm run test:unit`). `chore(qa): verify full test suite, lint, and typecheck`
