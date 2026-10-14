# Research & Architecture Decisions: Hackathon Project Submission API & Track Tagging Service

**Feature**: `043-hackathon-project-submission-api`  
**Ticket**: [VS-112](https://the-three-devsketeers.atlassian.net/browse/VS-112)  
**Date**: 2026-10-14  

---

## 1. Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed  |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                              |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)          |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`        |
| Server State  | TanStack Query — never mirror server data in Zustand                     |
| Client State  | Zustand `auth-store` for session only                                    |
| URL State     | nuqs for search params, pagination, filters                              |
| Forms         | React Hook Form + Zod (`zodResolver`)                                    |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                 |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                      |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                  |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

---

## 2. Technical Decisions & Rationale

### Decision 1: Relational Child Models vs. Unstructured JSON
- **Decision**: Model `ProjectMember`, `ProjectTrackTag`, and `ProjectSubmissionLink` as first-class relational tables linked to `ProjectSubmission` with cascade deletion, rather than embedding arbitrary JSON blobs.
- **Rationale**:
  - Hackathons require indexing by track (e.g., "AI Track", "Fintech Track") to generate track-specific leaderboards and exhibition filters.
  - First-class tables enable foreign key safety, indexing on `submissionId` and `trackName`, and strict schema validation at the database layer.
  - Querying all projects in a specific track is a single relational join/filter rather than a slow JSON containment query (`@>`).
- **Alternatives Considered**:
  - *PostgreSQL `text[]` or JSONB*: Harder to ensure foreign key validity and relational integrity, less typed in Prisma client generation.

### Decision 2: URL Pattern Enforcement in Zod
- **Decision**: Define dedicated Zod refinements for repository and media URLs:
  - Repository URL: Must be valid HTTPS URL matching `^https:\/\/(www\.)?(github\.com|gitlab\.com)\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$`
  - Media/Video URLs: Valid HTTPS URL matching YouTube (`youtube.com`, `youtu.be`) or Loom (`loom.com`).
  - Design URLs: Valid HTTPS URL matching Figma (`figma.com`).
  - General HTTPS validation: Prohibits unencrypted HTTP and non-web protocols (e.g. `ftp://`, `javascript:`).
- **Rationale**: Prevents malicious links, XSS vectors, and invalid submissions before reaching database storage.

### Decision 3: Submission Deadline & Status Lifecycle
- **Decision**: Validate that `new Date() <= event.endsAt` and `event.publicationStatus === "PUBLISHED"` during project submission.
- **Rationale**:
  - Events have strict operational windows defined by `startsAt` and `endsAt`. Submissions after `endsAt` must be rejected with `403 FORBIDDEN` (`"Submission window is closed."`).
  - Draft events cannot receive public project submissions.
- **Future Extension**: If hackathons require a separate submission deadline distinct from the voting close time, a dedicated `submissionDeadline` field can be added. For now, `endsAt` provides the canonical operational cutoff.

### Decision 4: RESTful Route Handler Structure
- **Decision**: Implement `/api/events/[slug]/submissions/route.ts` with Next.js 16 async context parameters:
  ```typescript
  interface RouteParams {
    params: Promise<{ slug: string }>;
  }
  ```
- **Rationale**: Next.js 15+ and 16 require awaiting `context.params`. All responses are wrapped in `apiSuccess()` or `apiError()` for client envelope consistency.
