# Feature Specification: Student Roster CSV Ingestion & Email Domain Whitelist Service

**Feature ID**: `043-student-roster-csv-whitelist`  
**Ticket**: [VS-108](https://the-three-devsketeers.atlassian.net/browse/VS-108)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Specified  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

Official school council elections (`STUDENT_COUNCIL`) and university department balloting require strict voter eligibility constraints. Currently, Electa allows general registration without institutional roster verification.

This feature delivers the **Student Roster CSV Ingestion & Email Domain Whitelist Service**:
1. High-throughput, memory-safe streaming CSV ingestion supporting rosters up to 25,000 students without memory spikes.
2. Secure privacy-preserving storage of student identifiers using deterministic SHA-256 hashing.
3. Institutional email domain whitelisting (e.g. `@up.edu.ph`, `@school.edu`) enabling domain-only, roster-only, or hybrid voter eligibility models.
4. Replace mode on roster re-upload to maintain a clean single source of truth per election.
5. High-speed O(1) indexed voter verification service during voter sign-in and ballot initialization.
6. REST API endpoint `POST /api/events/[slug]/roster` with strict boundary validation, organizer authorization, and standardized `ApiResponse<T>` envelopes.

---

## 2. Clarifications

### Session 2026-10-14
- **Q**: When an organizer re-uploads a student CSV roster for an event, how should the database handle existing roster entries?  
  → **A**: **Replace**: A new CSV upload completely replaces the event's previous student roster entries in an atomic transaction.
- **Q**: When both an uploaded student roster and email domain whitelists are configured for an election, what is the eligibility rule?  
  → **A**: **Hybrid OR**: A voter is eligible if they match an entry in the uploaded student roster OR their verified email matches an approved institutional email domain.

---

## 3. Actors & User Stories

### User Story 1 (Priority: P1 - Ingestion & Storage)
> **As a** School Election Commissioner,  
> **I want to** upload a CSV roster of eligible students with `studentId` and `email` columns,  
> **so that** the election system records an indexed whitelist of authorized students for the election.

**Why this priority**: Essential foundation for institutional voter validation.  
**Independent Test**: Upload a CSV with 3,000 rows to `POST /api/events/[slug]/roster` and verify records are saved, hashed, and indexed.

### User Story 2 (Priority: P1 - Voter Eligibility Check)
> **As an** institutional student voter,  
> **I want to** authenticate and have my student ID or email verified against the event whitelist,  
> **so that** I am granted access to the official student council ballot.

**Why this priority**: Core security guard preventing non-students from casting ballots.  
**Independent Test**: Call `verifyVoterEligibility({ eventId, studentId, email })` and verify true for whitelisted users, false for unauthorized users.

### User Story 3 (Priority: P2 - Domain Whitelisting)
> **As an** Election Organizer,  
> **I want to** configure approved email domains (`@institution.edu`) with or without an uploaded CSV,  
> **so that** students with verified university OAuth accounts can vote even before a full roster is uploaded.

**Why this priority**: Enables campus-wide open voting for university members.  
**Independent Test**: Configure `@school.edu` and verify any user with `user@school.edu` is granted voter eligibility.

---

## 4. Acceptance Scenarios (Gherkin)

### Scenario 1: Happy Path - Roster Upload & Indexing
- **Given** an authenticated election administrator with an active `STUDENT_COUNCIL` event
- **When** they upload a CSV containing 3,000 student entries with columns `studentId` and `email`
- **Then** the service parses, deduplicates, and saves the roster returning a success summary count in under 3 seconds
- **And** student IDs are stored as deterministic SHA-256 hashes for privacy preservation.

### Scenario 2: Validation & Error Handling - Malformed CSV Format
- **Given** an organizer uploading an invalid CSV missing required student identifier headers (neither `studentId` nor `email`)
- **When** the upload route parses the file
- **Then** the upload is rejected with a descriptive `422 UNPROCESSABLE_ENTITY` error specifying the missing headers.

### Scenario 3: Edge Case - Domain-Only Verification Mode
- **Given** an election configured with email domain restriction (`@up.edu.ph`) without a pre-uploaded CSV roster
- **When** an authenticated voter signs in with a verified email matching that domain
- **Then** the service authorizes voter access and confirms eligibility.

### Scenario 4: Roster Replacement on Re-upload
- **Given** an event that already has an existing student roster of 1,000 entries
- **When** the organizer uploads a new CSV containing 1,500 entries
- **Then** the previous 1,000 entries are atomically removed and replaced with the new 1,500 entries.

### Scenario 5: High-Volume Performance Benchmark
- **Given** a high-volume election roster CSV containing 25,000 student rows
- **When** the streaming parser processes the payload
- **Then** the streaming parser completes chunking and ingestion without exceeding Node.js memory limits.

---

## 5. Functional Requirements

- **FR-001**: System MUST provide a CSV parser that validates required column headers (`studentId` or `student_id`, and `email`).
- **FR-002**: System MUST hash all `studentId` values with SHA-256 before storing in the database.
- **FR-003**: System MUST normalize all emails to lowercase and strip leading/trailing whitespace.
- **FR-004**: System MUST deduplicate duplicate records within the same CSV upload based on hashed `studentId` and `email`.
- **FR-005**: System MUST execute roster replacement atomically within a Prisma `$transaction`.
- **FR-006**: System MUST support configuring institutional domain whitelist strings (e.g. `["@up.edu.ph", "@ateneo.edu"]`) on the Event.
- **FR-007**: System MUST provide `verifyVoterEligibility({ eventId, studentId?, email? })` returning `{ isEligible: boolean, reason?: string }` with O(1) indexed lookups.
- **FR-008**: System MUST protect the roster upload API endpoint, verifying that the requesting user is the organizer of the event.

---

## 6. Technical Scope & Boundary Mapping

- **Database (`prisma/schema.prisma`)**:
  - `model StudentRosterEntry`: `id`, `eventId`, `studentIdHash`, `email`, `createdAt`, `updatedAt`, unique composite `@@unique([eventId, email])`, `@@unique([eventId, studentIdHash])`, indexes `@@index([eventId])`, `@@index([studentIdHash])`, `@@index([email])`.
  - `allowedEmailDomains String[]` field on `Event`.
- **Validation (`src/lib/validations/roster.ts`)**:
  - Zod schemas for CSV rows, roster upload options, domain whitelist configurations, and eligibility query parameters.
- **Service Layer (`src/features/institutions/services/roster-service.ts`)**:
  - `parseRosterCsvStream()`: streaming parser and header validator.
  - `hashStudentId(rawId: string)`: deterministic SHA-256 hash utility.
  - `ingestRoster({ eventId, rows })`: batch insertion with atomic replace.
  - `verifyVoterEligibility({ eventId, studentId?, email? })`: O(1) hybrid check.
- **API Route (`src/app/api/events/[slug]/roster/route.ts`)**:
  - `POST`: multipart/form-data or raw CSV upload with organizer authorization and `ApiResponse<RosterUploadResultDto>`.
  - `GET`: returns roster summary stats and domain whitelist for the event.
