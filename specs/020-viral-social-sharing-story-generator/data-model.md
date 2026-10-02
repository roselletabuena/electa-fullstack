# Data Model & Contracts: Viral Social Sharing Story Generator

**Feature**: `020-viral-social-sharing-story-generator`  
**Jira Key**: `VS-25`

---

## 1. Story Card Configuration Model

```typescript
export type StoryTheme = "midnight" | "coronation" | "opal";

export interface StoryCardPayload {
  eventSlug: string;
  eventTitle: string;
  candidateId: string;
  candidateNumber: number;
  candidateName: string;
  candidateAvatarUrl: string;
  divisionName?: string | null;
  categoryName?: string | null;
  votingUrl: string;
  theme?: StoryTheme;
}
```

---

## 2. Story Generator Output

```typescript
export interface StoryGeneratorResult {
  dataUrl: string;
  blob: Blob;
  fileName: string;
}
```
