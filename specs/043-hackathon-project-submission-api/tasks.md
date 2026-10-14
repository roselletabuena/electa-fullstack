# Implementation Tasks: Hackathon Project Submission API & Track Tagging Service

**Feature ID**: `043-hackathon-project-submission-api`  
**Ticket**: [VS-112](https://the-three-devsketeers.atlassian.net/browse/VS-112)  

---

## Task List

- [x] **Task 1: Database Models & Prisma Client Generation** `feat(database): add ProjectSubmission and related models`
  - Add `ProjectSubmissionStatus` enum to `prisma/schema.prisma`
  - Add `ProjectSubmission`, `ProjectMember`, `ProjectTrackTag`, and `ProjectSubmissionLink` models
  - Add `projectSubmissions` relation to `Event` model
  - Run `npx prisma generate` to update client types

- [x] **Task 2: Validation Schemas & URL RegEx Rules** `feat(hackathons): add project submission validation schemas and unit tests`
  - Implement `src/lib/validations/hackathon-submission.ts` with `createProjectSubmissionSchema`
  - Support GitHub/GitLab HTTPS URLs, video links, team members, and track tags
  - Write comprehensive unit tests in `tests/unit/hackathons/hackathon-submission-validation.test.ts`

- [x] **Task 3: Domain Types & Submission Service** `feat(hackathons): implement submission service and track tagging with tests`
  - Implement `src/features/hackathons/types/submission.ts` with strong typing
  - Implement `src/features/hackathons/services/submission-service.ts`:
    - Event archetype check (`HACKATHON` only)
    - Deadline check (`endsAt`)
    - Atomic creation of submission, members, track tags, and links
    - Query helpers for listing and fetching submissions
  - Implement unit tests in `tests/unit/hackathons/submission-service.test.ts`

- [x] **Task 4: RESTful Route Handler** `feat(hackathons): add project submissions API route handler with tests`
  - Implement `src/app/api/events/[slug]/submissions/route.ts` (Next.js 16 async params, `getSession()`, `apiSuccess()`, `apiError()`)
  - Implement unit tests in `tests/unit/hackathons/submissions-route.test.ts`

- [x] **Task 5: End-to-End Verification & Quality Audit** `chore(qa): verify hackathon submission test suite, lint, and typecheck`
  - Run `npm run typecheck`, `npm run lint`, and `npm run test:unit`
  - Confirm zero defects and 100% test pass
