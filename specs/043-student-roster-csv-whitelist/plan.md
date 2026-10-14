# Implementation Plan: Student Roster CSV Ingestion & Email Domain Whitelist Service

**Feature ID**: `043-student-roster-csv-whitelist`  
**Ticket**: [VS-108](https://the-three-devsketeers.atlassian.net/browse/VS-108)  

---

## 1. Architecture & Component Mapping

### Database & Schema
- File: `prisma/schema.prisma`
- Model: `StudentRosterEntry`
  - `id`: String @id @default(uuid())
  - `eventId`: String
  - `studentIdHash`: String
  - `email`: String
  - `createdAt`: DateTime @default(now())
  - `updatedAt`: DateTime @updatedAt
  - Relations: `event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)`
  - Indexes & Constraints:
    - `@@unique([eventId, email])`
    - `@@unique([eventId, studentIdHash])`
    - `@@index([eventId])`
    - `@@index([studentIdHash])`
    - `@@index([email])`
- Model: `Event`
  - Field: `allowedEmailDomains String[] @default([])`
  - Relation: `studentRoster StudentRosterEntry[]`

### Validations & Schemas
- File: `src/lib/validations/roster.ts`
  - `studentRosterRowSchema`
  - `updateEventDomainWhitelistSchema`
  - `checkVoterEligibilitySchema`

### Service & Business Logic
- File: `src/features/institutions/services/roster-service.ts`
  - `parseRosterCsvStream(streamOrString)`: streaming line parser & header validator.
  - `hashStudentId(studentId)`: deterministic SHA-256 string hasher.
  - `ingestRosterCsv({ eventId, content })`: atomic replace transaction with chunked `createMany`.
  - `verifyVoterEligibility({ eventId, studentId, email })`: O(1) hybrid eligibility checker.
  - `updateEventAllowedDomains({ eventId, domains })`: updates domain whitelist.

### API Routes
- File: `src/app/api/events/[slug]/roster/route.ts`
  - `POST`: Authenticated route for event organizers to upload roster CSVs or set email domains.
  - `GET`: Authenticated summary route returning roster count, domain whitelists, and upload status.

### Unit & Integration Testing
- Directory: `tests/unit/institutions/`
  - `csv-parser.test.ts`: test header detection, empty lines, quote handling, invalid headers.
  - `roster-service.test.ts`: test atomic ingestion, deduplication, deterministic hashing, and hybrid eligibility checks.
  - `roster-route.test.ts`: test HTTP boundary, organizer auth verification, and 422 error cases.

---

## 2. Test Plan & Coverage

1. **Parser & Format Tests**:
   - Valid headers (`studentId,email` / `student_id,email`)
   - Missing required headers (triggers `422 UNPROCESSABLE_ENTITY`)
   - Normalization of email casing and trimming
   - Malformed lines and trailing whitespace
2. **Ingestion & Database Tests**:
   - Ingestion of valid 3,000 mock student entries in <3 seconds
   - In-memory and database deduplication
   - Atomic replacement: verify older records are cleared when new roster is uploaded
3. **Voter Eligibility Verification Tests**:
   - Eligible by student ID in roster
   - Eligible by email in roster
   - Eligible by domain match (e.g. `@school.edu`) without being in roster
   - Ineligible when neither matches
4. **Security & Guard Tests**:
   - Non-organizer caller receives 403 Forbidden
   - Unauthenticated caller receives 401 Unauthorized
