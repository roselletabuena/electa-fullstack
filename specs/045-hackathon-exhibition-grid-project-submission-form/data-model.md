# Data Model & Component State: Hackathon Exhibition Grid & Project Submission Form

**Feature ID**: `045-hackathon-exhibition-grid-project-submission-form`  
**Ticket**: [VS-113](https://the-three-devsketeers.atlassian.net/browse/VS-113)  

---

## 1. Domain Entities & DTOs

Referenced from `src/features/hackathons/types/submission.ts`:

```typescript
export interface ProjectMemberDto {
  id: string;
  submissionId: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
}

export interface ProjectTrackTagDto {
  id: string;
  submissionId: string;
  trackName: string;
  createdAt: string;
}

export interface ProjectSubmissionLinkDto {
  id: string;
  submissionId: string;
  label: string;
  url: string;
  createdAt: string;
}

export interface ProjectSubmissionDto {
  id: string;
  eventId: string;
  teamLeadId: string;
  title: string;
  tagline: string | null;
  description: string;
  repositoryUrl: string;
  demoUrl: string | null;
  videoUrl: string | null;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  members: ProjectMemberDto[];
  trackTags: ProjectTrackTagDto[];
  links: ProjectSubmissionLinkDto[];
}
```

---

## 2. Component State Interfaces

### Exhibition Grid State
- `track`: URL state managed by `nuqs` (defaults to `"all"`).
- `searchQuery`: local search state filtering by title, description, or tech stack.
- `submissions`: initial array of `ProjectSubmissionDto` loaded from RSC page.
- `isSubmitModalOpen`: boolean state controlling the submission dialog.

### Submission Form State
- Form fields:
  - `title`: string (min 3, max 120)
  - `tagline`: string (optional, max 200)
  - `description`: string (min 10, max 5000)
  - `repositoryUrl`: string (valid GitHub or GitLab HTTPS URL)
  - `demoUrl`: string (optional HTTPS URL)
  - `videoUrl`: string (optional YouTube or Loom HTTPS URL)
  - `trackTags`: string[] (min 1, max 5, case-insensitive unique)
  - `members`: Array<{ name: string; email: string; role?: string }>
  - `links`: Array<{ label: string; url: string }>
- Submission state:
  - `isSubmitting`: boolean
  - `fieldErrors`: Record<string, string>
  - `formError`: string | null
  - `isSuccess`: boolean
