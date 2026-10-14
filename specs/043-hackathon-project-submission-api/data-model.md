# Data Model: Hackathon Project Submission API & Track Tagging Service

**Feature**: `043-hackathon-project-submission-api`  
**Ticket**: [VS-112](https://the-three-devsketeers.atlassian.net/browse/VS-112)  
**Date**: 2026-10-14  

---

## 1. Entities & Storage Schemas (Prisma)

### Enumerations
```prisma
enum ProjectSubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  ACCEPTED
  REJECTED
}
```

### Models

```prisma
model ProjectSubmission {
  id              String                  @id @default(uuid())
  eventId         String
  teamLeadId      String
  title           String
  tagline         String?
  description     String                  @db.Text
  repositoryUrl   String
  demoUrl         String?
  videoUrl        String?
  status          ProjectSubmissionStatus @default(SUBMITTED)
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt

  event           Event                   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  members         ProjectMember[]
  trackTags       ProjectTrackTag[]
  links           ProjectSubmissionLink[]

  @@unique([eventId, teamLeadId, title])
  @@index([eventId])
  @@index([teamLeadId])
  @@index([eventId, status])
  @@index([createdAt])
}

model ProjectMember {
  id           String            @id @default(uuid())
  submissionId String
  name         String
  email        String
  role         String?           @default("Contributor")
  createdAt    DateTime          @default(now())

  submission   ProjectSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@index([submissionId])
}

model ProjectTrackTag {
  id           String            @id @default(uuid())
  submissionId String
  trackName    String
  createdAt    DateTime          @default(now())

  submission   ProjectSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@unique([submissionId, trackName])
  @@index([submissionId])
  @@index([trackName])
}

model ProjectSubmissionLink {
  id           String            @id @default(uuid())
  submissionId String
  label        String
  url          String
  createdAt    DateTime          @default(now())

  submission   ProjectSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@index([submissionId])
}
```

### Updates to `Event` Model
Add relation:
```prisma
model Event {
  // ... existing fields ...
  projectSubmissions ProjectSubmission[]
}
```

---

## 2. Invariants & Validation Rules

1. **Foreign Key Integrity**:
   - `ProjectSubmission.eventId` must reference an existing `Event` with `archetype == "HACKATHON"`.
   - All child tables (`ProjectMember`, `ProjectTrackTag`, `ProjectSubmissionLink`) cascade delete when `ProjectSubmission` is deleted.
2. **Repository URL Constraint**:
   - Must be valid HTTPS URL pointing to `github.com` or `gitlab.com`.
3. **Track Tag Uniqueness**:
   - `@@unique([submissionId, trackName])` prevents duplicate track tags on the same submission.
4. **Submission Deadline Constraint**:
   - Submission attempts where `event.endsAt < current_timestamp` are forbidden (`403 Forbidden`).
5. **Team Lead Association**:
   - `teamLeadId` is derived from the authenticated session (`session.id`) and cannot be spoofed.
