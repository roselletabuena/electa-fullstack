# Data Model: Dedicated Judge Portal & Weighted Rubric Scorecard UI

**Feature ID**: `045-judge-portal-rubric-scorecard`  
**Ticket**: [VS-115](https://the-three-devsketeers.atlassian.net/browse/VS-115)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  

---

## 1. Entity Relationships & Schemas

The frontend components interface directly with the Prisma models introduced in VS-114 (`RubricCriterion`, `JudgeEvaluation`, `JudgeScore`, `ProjectSubmission`).

```mermaid
erDiagram
    EVENT ||--o{ RUBRIC_CRITERION : "configures"
    EVENT ||--o{ PROJECT_SUBMISSION : "hosts"
    EVENT ||--o{ JUDGE_EVALUATION : "receives"
    PROJECT_SUBMISSION ||--o{ JUDGE_EVALUATION : "evaluated in"
    JUDGE_EVALUATION ||--|{ JUDGE_SCORE : "contains"
    RUBRIC_CRITERION ||--o{ JUDGE_SCORE : "scored in"

    RUBRIC_CRITERION {
        string id PK
        string eventId FK
        string title
        string description
        decimal weight
        int maxScore
        int displayOrder
    }

    JUDGE_EVALUATION {
        string id PK
        string eventId FK
        string judgeId
        string submissionId FK
        boolean isDraft
        string notes
        decimal compositeScore
        datetime createdAt
        datetime updatedAt
    }

    JUDGE_SCORE {
        string id PK
        string evaluationId FK
        string criterionId FK
        decimal score
    }

    PROJECT_SUBMISSION {
        string id PK
        string eventId FK
        string teamLeadId
        string title
        string tagline
        string description
        string repositoryUrl
        string demoUrl
        string videoUrl
        string status
    }
```

---

## 2. Frontend State Machine: Judge Portal & Scorecard

```mermaid
stateDiagram-v2
    [*] --> Idle: Load Event & Submissions
    Idle --> Filtering: Select Filter Pill (All | Pending | Completed)
    Filtering --> Idle
    Idle --> ModalOpen: Click Project Card / Evaluate Button
    
    state ModalOpen {
        [*] --> Initialized: Preload Existing Scores or Draft
        Initialized --> ScoringCriterion: Select 1-10 (Mouse or Keys 1-9, 0)
        ScoringCriterion --> UpdatingComposite: Live Weighted Recalculation
        UpdatingComposite --> ScoringCriterion
        ScoringCriterion --> EditingNotes: Enter Feedback
        EditingNotes --> ScoringCriterion
        ScoringCriterion --> SubmittingDraft: Click "Save Draft"
        ScoringCriterion --> ValidatingFinal: Click "Submit Final Evaluation"
        
        ValidatingFinal --> ValidationError: Missing Criterion
        ValidationError --> ScoringCriterion: Highlight & Scroll to Error
        
        ValidatingFinal --> SubmittingFinal: All Criteria Scored
    }

    SubmittingDraft --> Idle: Optimistic Toast & Update Card State
    SubmittingFinal --> Idle: Toast Success & Mark Card "Completed"
```

---

## 3. UI Data Transfer Objects (DTOs)

### `JudgePortalProjectItem`
```typescript
export interface JudgePortalProjectItem {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  repositoryUrl: string;
  demoUrl: string | null;
  videoUrl: string | null;
  status: "SUBMITTED" | "ACCEPTED" | "REJECTED" | "WINNER";
  trackTags: string[];
  evaluationStatus: "PENDING" | "DRAFT" | "COMPLETED";
  existingEvaluation?: {
    compositeScore: number;
    notes: string | null;
    isDraft: boolean;
    scores: Array<{
      criterionId: string;
      score: number;
    }>;
  };
}
```

### `RubricCriterionViewDto`
```typescript
export interface RubricCriterionViewDto {
  id: string;
  title: string;
  description: string | null;
  weight: number;
  maxScore: number;
  displayOrder: number;
}
```
