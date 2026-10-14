# Implementation Plan: Hackathon Project Submission API & Track Tagging Service

**Feature ID**: `043-hackathon-project-submission-api`  
**Ticket**: [VS-112](https://the-three-devsketeers.atlassian.net/browse/VS-112)  

---

## 1. Architecture & Component Mapping

```
src/
├── app/
│   └── api/
│       └── events/
│           └── [slug]/
│               └── submissions/
│                   └── route.ts               # GET & POST route handlers
├── features/
│   └── hackathons/
│       ├── services/
│       │   └── submission-service.ts          # Core submission domain service
│       ├── types/
│       │   └── submission.ts                  # Domain & DTO types
│       └── index.ts                           # Barrel export
└── lib/
    └── validations/
        └── hackathon-submission.ts            # Zod validation schemas
prisma/
└── schema.prisma                              # ProjectSubmission, ProjectMember, ProjectTrackTag, ProjectSubmissionLink
tests/
└── unit/
    └── hackathons/
        ├── hackathon-submission-validation.test.ts # Zod schema tests
        ├── submission-service.test.ts              # Service logic & deadline tests
        └── submissions-route.test.ts               # Route handler mock tests
```

---

## 2. Step-by-Step Implementation Strategy

### Step 1: Database Schema Expansion (`prisma/schema.prisma`)
- Add enum `ProjectSubmissionStatus` with values `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`.
- Add model `ProjectSubmission` linked to `Event` with fields: `id`, `eventId`, `teamLeadId`, `title`, `tagline`, `description`, `repositoryUrl`, `demoUrl`, `videoUrl`, `status`, `createdAt`, `updatedAt`.
- Add child models: `ProjectMember`, `ProjectTrackTag`, `ProjectSubmissionLink`.
- Add relation `projectSubmissions ProjectSubmission[]` on `Event`.
- Run Prisma client regeneration (`npx prisma generate`).

### Step 2: Validation Schemas (`src/lib/validations/hackathon-submission.ts`)
- Implement `createProjectSubmissionSchema`:
  - Strict HTTPS validation for `repositoryUrl` (GitHub or GitLab).
  - Validation for `demoUrl`, `videoUrl`, `trackTags`, `members`, and `links`.

### Step 3: Domain Types & Service Layer (`src/features/hackathons/`)
- Define DTO interfaces and mapping helpers in `src/features/hackathons/types/submission.ts`.
- Implement `createProjectSubmission(eventId, teamLeadId, input)` in `submission-service.ts`:
  - Verify event exists and `archetype === "HACKATHON"`.
  - Verify `event.publicationStatus === "PUBLISHED"`.
  - Verify deadline: `new Date() <= event.endsAt`.
  - Create submission with members, track tags, and links in an atomic transaction.
- Implement `getProjectSubmissions(eventId, filters)`:
  - Query all submissions with relations ordered by `createdAt` descending.
- Implement `getProjectSubmissionById(id)`:
  - Query single submission with relations.

### Step 4: Route Handler (`src/app/api/events/[slug]/submissions/route.ts`)
- Context interface: `interface RouteParams { params: Promise<{ slug: string }> }`.
- `GET`: Fetch submissions for event by slug.
- `POST`: Authenticate session via `getSession()`, parse body with Zod schema, invoke `createProjectSubmission()`, and return `apiSuccess(dto, 201)` or `apiError(message, status)`.

### Step 5: Unit Tests (`tests/unit/hackathons/`)
- Validation schema test suite: tests valid GitHub, valid GitLab, invalid URLs, missing title, track bounds.
- Service unit test suite: tests successful creation, deadline rejection, non-hackathon archetype rejection, and query helpers.
- Route handler unit test suite: tests unauthenticated 401, not found 404, invalid input 400, deadline 403, and success 201.

---

## 3. Test Plan & Quality Gates

1. **Unit Tests**:
   - `npm run test:unit tests/unit/hackathons/`
2. **Typecheck**:
   - `npm run typecheck`
3. **Lint**:
   - `npm run lint`
