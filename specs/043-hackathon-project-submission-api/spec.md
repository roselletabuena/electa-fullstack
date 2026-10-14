# Feature Specification: Hackathon Project Submission API & Track Tagging Service

**Feature ID**: `043-hackathon-project-submission-api`  
**Ticket**: [VS-112](https://the-three-devsketeers.atlassian.net/browse/VS-112)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Draft  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

Electa supports multi-archetype events including pageants, student council elections, and hackathons. Unlike individual pageant contestant profiles or static election ballots, hackathons require team-based submissions with distinct technical deliverables: Git repository URLs (GitHub, GitLab), live demo links, video presentations (YouTube, Loom), design decks (Figma), track tag associations, and team member rosters.

This feature delivers the **Hackathon Project Submission API & Track Tagging Service**:
1. A robust domain service (`submission-service.ts`) managing the lifecycle of hackathon project entries (`ProjectSubmission`), including creation, updates, querying, and team member associations.
2. A RESTful Route Handler (`src/app/api/events/[slug]/submissions/route.ts`) returning standardized `ApiResponse<T>` envelopes.
3. Strict Zod validation schemas (`hackathon-submission.ts`) enforcing HTTPS format for GitHub/GitLab repository URLs, optional video/demo/Figma links, team member rosters, and track tag IDs.
4. Schedule window validation ensuring submissions and modifications can only occur during open submission periods (before `endsAt`).
5. Relational persistence in Prisma modeling `ProjectSubmission`, `ProjectMember`, `ProjectTrackTag`, and `ProjectSubmissionLink`, with cascading cleanup and uniqueness constraints.

---

## 2. Actors & User Stories

### User Story

> **As a** Hackathon Team Lead,  
> **I want to** submit our project entry with team member roster, GitHub repository URL, demo video, and track tags via an API service,  
> **so that** our team's project is registered and indexed for judging and community exhibition.

### Actors
- **Hackathon Team Lead**: Authenticated participant who creates and manages their team's project submission, links repository and demo URLs, and adds teammates.
- **Hackathon Organizer / Judge**: Consumes indexed submissions and track tags for judging, scoring, and exhibition grids (FE: 3.2).
- **Downstream Frontend Clients**: Web forms and exhibition grids interacting with `/api/events/[slug]/submissions`.

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Project Entry Submission
- **Given** an open submission window for a `HACKATHON` event and an authenticated team lead
- **When** the team lead submits a title, description, valid GitHub URL (`https://github.com/team/repo`), team member roster, and 2 track tags
- **Then** the submission is saved with `SUBMITTED` status and linked to the team lead's account (`teamLeadId`),
- **And** all team members, track tags, and optional links are persisted in the database,
- **And** the API returns a `201 CREATED` status code with the serialized `ProjectSubmission` payload.

### Scenario 2: Validation & Error Handling - Invalid Repository URL
- **Given** a user attempting to submit an invalid non-git URL (e.g., `ftp://example.com`, `https://notgit.com/repo`, or plain text)
- **When** the submission payload is validated by the Zod schema
- **Then** the service rejects the request with a `400 BAD_REQUEST` envelope and field error: `"Must be a valid GitHub or GitLab repository URL."`,
- **And** no database records are created or mutated.

### Scenario 3: Edge Case - Post-Deadline Submission Attempt
- **Given** a hackathon event where the submission deadline (`endsAt`) has elapsed
- **When** a team attempts to create or update their submission
- **Then** the API rejects the request with a `403 FORBIDDEN` error: `"Submission window is closed."`,
- **And** no modifications are saved.

### Scenario 4: Validation & Error Handling - Invalid Event Archetype
- **Given** an existing event whose archetype is `PAGEANT` or `STUDENT_COUNCIL` (not `HACKATHON`)
- **When** a user attempts to submit a hackathon project to `/api/events/[slug]/submissions`
- **Then** the API rejects the request with a `400 BAD_REQUEST` error: `"Project submissions are only enabled for Hackathon events."`.

### Scenario 5: Authorization - Unauthenticated Submission Attempt
- **Given** an unauthenticated visitor without a valid session
- **When** a `POST` request is sent to `/api/events/[slug]/submissions`
- **Then** the API rejects the request with a `401 UNAUTHORIZED` error: `"Authentication required."`.

### Scenario 6: Idempotent or Multiple Submissions Query
- **Given** an event with existing submitted projects
- **When** a `GET` request is made to `/api/events/[slug]/submissions`
- **Then** the API returns a list of submissions including tracks, members, and links, ordered by `createdAt` descending.

---

## 4. Technical Scope & Target Files

- **Database Schema (`prisma/schema.prisma`)**:
  - `model ProjectSubmission`: `id`, `eventId`, `teamLeadId`, `title`, `description`, `repositoryUrl`, `demoUrl`, `videoUrl`, `status`, timestamps.
  - `model ProjectMember`: `id`, `submissionId`, `name`, `email`, `role`, timestamps.
  - `model ProjectTrackTag`: `id`, `submissionId`, `trackName` (or relation to `EventPosition`), timestamps.
  - `model ProjectSubmissionLink`: `id`, `submissionId`, `label`, `url`, timestamps.
- **Validation Schema (`src/lib/validations/hackathon-submission.ts`)**:
  - `createProjectSubmissionSchema`: URL validators for GitHub/GitLab, YouTube/Loom/Figma, team members, track tags.
- **Domain Service (`src/features/hackathons/services/submission-service.ts`)**:
  - `createProjectSubmission()`: checks event archetype and deadline window, creates submission and child relations atomically.
  - `getProjectSubmissions()`: fetches submissions for event with filters.
  - `getProjectSubmissionById()`: fetches single submission with details.
- **API Route Handler (`src/app/api/events/[slug]/submissions/route.ts`)**:
  - `GET`: public or authenticated listing of submissions for the event.
  - `POST`: authenticated creation of a project submission with error envelopes.
- **Type Definitions (`src/features/hackathons/types/submission.ts`)**:
  - Input, DTO, and Response interfaces adhering to TypeScript 5 strict mode.

---

## 5. Quality Gate & Definition of Done

- Strict TypeScript 5 (no `any`, no non-null assertions `!`).
- Unit tests for URL validation schemas, deadline checks, and service logic (`tests/unit/hackathons/`).
- Prisma schema migration tested and Prisma client regenerated.
- Passes typecheck (`npm run typecheck`), linter (`npm run lint`), and tests (`npm run test:unit`).
- Complies with Electa Constitution (§I–§VI).
