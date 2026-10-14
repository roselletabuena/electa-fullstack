# Quickstart & Verification Guide: Student Roster CSV Ingestion & Email Domain Whitelist Service

**Feature ID**: `043-student-roster-csv-whitelist`  
**Ticket**: [VS-108](https://the-three-devsketeers.atlassian.net/browse/VS-108)  

---

## 1. Overview & Setup

This guide details how to verify the student roster ingestion pipeline, domain whitelist configuration, and voter eligibility checks.

### Prerequisites
- Active test database or mock Prisma environment.
- Node.js 20+ runtime.

---

## 2. Verification Scenarios

### Scenario A: Ingest 3,000 Row Roster via Service
1. Run `roster-service.test.ts` to execute streaming parse and batch ingestion.
2. Verify total duration is under 3,000ms.
3. Verify `StudentRosterEntry` entries contain valid SHA-256 hashes for student IDs.

### Scenario B: Upload Malformed CSV via API
1. Send a POST request to `/api/events/[slug]/roster` with a CSV missing the `studentId` column.
2. Confirm the route returns status `422` with code `MALFORMED_ROSTER_CSV`.

### Scenario C: Hybrid Voter Eligibility Verification
1. Configure event with `allowedEmailDomains: ["@up.edu.ph"]`.
2. Check user with email `alice@up.edu.ph` (not in CSV roster).
3. Confirm voter is verified with match type `EMAIL_DOMAIN`.
4. Check user with student ID in CSV roster.
5. Confirm voter is verified with match type `ROSTER_STUDENT_ID`.

---

## 3. Automated Test Suite Execution

Run the targeted test suite and quality gates:

```bash
# Run unit tests
npm run test:unit tests/unit/institutions/

# Run typecheck
npm run typecheck

# Run linter
npm run lint
```
