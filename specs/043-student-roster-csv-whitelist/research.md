# Research & Architecture Decisions: Student Roster CSV Ingestion & Email Domain Whitelist Service

**Feature**: `043-student-roster-csv-whitelist`  
**Ticket**: [VS-108](https://the-three-devsketeers.atlassian.net/browse/VS-108)  
**Date**: 2026-10-14  

---

## 1. Stack Context & Principles (Electa Constitution Enforced)

| Concern | Architectural Decision |
| :--- | :--- |
| **Framework** | Next.js 16 App Router — Route handler in `src/app/api/events/[slug]/roster/route.ts` |
| **Language** | TypeScript 5 Strict Mode (`exactOptionalPropertyTypes: true`, zero `any`, zero `!`) |
| **Database** | PostgreSQL via Supabase, Prisma ORM singleton `src/lib/db.ts` |
| **Auth Guard** | AWS Cognito / Custom Session via `getSession()` from `src/lib/auth/get-session.ts` |
| **Privacy / Cryptography** | Deterministic SHA-256 via Node.js native `crypto` module |
| **Streaming Parser** | Zero-dependency high-performance streaming CSV parser with regex-free chunked tokenizer |
| **API Envelope** | Standardized `ApiResponse<T>` from `src/lib/api/response.ts` (`apiSuccess`, `apiError`) |

---

## 2. Technical Decisions & Rationale

### Decision 1: High-Throughput Streaming CSV Parser
- **Context**: Roster uploads may contain up to 25,000 students. Ingestion must run fast (<3 seconds for 3k rows) without triggering Node.js out-of-memory errors or blocking event loops.
- **Decision**: Implement a native streaming CSV parser supporting async iterables and chunked streams. Normalizes header names case-insensitively (`studentId`, `student_id`, `id_number`, `email`, `student_email`).
- **Rationale**: Avoids adding heavy external CSV dependencies while providing precise control over memory buffers and early header validation.

### Decision 2: Deterministic SHA-256 for Student ID Privacy
- **Context**: Institutional regulations (FERPA, Data Privacy Act) prohibit unencrypted storage of student ID numbers alongside voting choices.
- **Decision**: Hash raw student IDs using `crypto.createHash('sha256').update(trimmedRawId.toLowerCase()).digest('hex')` prior to persistence.
- **Rationale**: Deterministic hashing enables O(1) indexed lookup in the database (`@@index([studentIdHash])`) without exposing raw student IDs at rest.

### Decision 3: Atomic Batch Replacement Pattern
- **Context**: An election commissioner may revise and re-upload the student roster multiple times before voting opens.
- **Decision**: Execute roster upload inside a Prisma `$transaction`:
  1. Verify event ownership by caller.
  2. Parse and validate CSV rows into in-memory deduplicated tuples.
  3. Delete existing `StudentRosterEntry` records for `eventId`.
  4. Perform chunked `createMany` (batches of 1,000 rows) for high throughput.
- **Rationale**: Guarantees consistency. If a CSV has errors mid-way, the transaction rolls back cleanly, leaving previous state intact.

### Decision 4: Hybrid OR Voter Eligibility Model
- **Context**: Institutional events may use a formal student list, open institutional domain logins (`@up.edu.ph`), or both.
- **Decision**: If `allowedEmailDomains` is defined and matches the voter's email domain, grant access immediately. Otherwise, check `StudentRosterEntry` by `studentIdHash` or `email`.
- **Rationale**: Maximizes operational flexibility for university administrators while maintaining strict access boundaries.
