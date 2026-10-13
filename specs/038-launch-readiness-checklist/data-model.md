# Data Model: Launch Readiness Checklist

**Feature ID**: `038-launch-readiness-checklist`  
**Jira Key**: [VS-106](https://the-three-devsketeers.atlassian.net/browse/VS-106)  

---

## 🏛️ Domain Types & Entities

### 1. Launch Readiness Milestone Definition
```typescript
export type LaunchMilestoneId =
  | "event-profile"
  | "divisions"
  | "contestants"
  | "voting-rules";

export interface LaunchReadinessItem {
  id: LaunchMilestoneId;
  title: string;
  description: string;
  isCompleted: boolean;
  actionLabel: string;
  actionHref: string;
}
```

### 2. Launch Readiness Snapshot (Server DTO)
```typescript
export interface LaunchReadinessSnapshot {
  eventId: string;
  slug: string;
  publicationStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  divisionsCount: number;
  contestantsCount: number;
  hasVotingRulesConfigured: boolean;
  totalMilestones: number;
  completedMilestones: number;
  percentageComplete: number;
  isAllCompleted: boolean;
  items: LaunchReadinessItem[];
}
```

### 3. Server Query Aggregator
```typescript
export interface EventReadinessCounts {
  divisionsCount: number;
  contestantsCount: number;
  votingRulesAuditCount: number;
}
```

### 4. Dismissal State Machine
```
[Event in DRAFT] ───────────────> Render Full 4-Step Checklist Card
       │
[Status -> PUBLISHED] ─────────> Render Compact "Ready & Live" Banner
       │
[User clicks "Dismiss"] ───────> Set localStorage: `electa_dismissed_readiness_${eventId}` = "true"
       │
[Next Page Render] ────────────> Render nothing (null)
```
