# Data Model: Trending Events Grid & Lifecycle Status Filters

**Feature**: `033-trending-events-grid-filters`  
**Date**: 2026-10-12

---

## 1. Entities & Data Structures

### A. Lifecycle Filter Status

```typescript
export const EVENT_LIFECYCLE_FILTERS = ["all", "active", "scheduled", "closed"] as const;
export type EventLifecycleFilter = (typeof EVENT_LIFECYCLE_FILTERS)[number];
```

### B. Public Trending Event Item DTO

```typescript
export interface TrendingEventItemDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  operationalState: "Scheduled" | "Active" | "Closed";
  contestantCount: number;
  serverTime: string;
}
```

### C. Filter Tab Descriptor

```typescript
export interface LifecycleTabOption {
  key: EventLifecycleFilter;
  label: string;
  count?: number;
}
```

### D. Countdown Snapshot

```typescript
export interface EventCountdownSnapshot {
  pillLabel: string;
  pillVariant: "active" | "scheduled" | "closed";
  actionLabel: string;
  isUrgent?: boolean;
}
```

---

## 2. Invariants & Validation Rules

1. **State Isolation**:
   - `all`: Matches any published event (`Active`, `Scheduled`, or `Closed`).
   - `active`: Matches events where `operationalState === "Active"`.
   - `scheduled`: Matches events where `operationalState === "Scheduled"`.
   - `closed`: Matches events where `operationalState === "Closed"`.
2. **Action Label Mapping**:
   - `Active` -> `"VIEW EVENT →"`
   - `Scheduled` -> `"PREVIEW EVENT →"`
   - `Closed` -> `"VIEW FINAL TALLIES →"`
3. **Pill Text Mapping**:
   - `Active`: `"⏳ Xd Yh LEFT"` or `"⏳ CLOSING SOON"`
   - `Scheduled`: `"OPENS IN Xd Yh"` or `"SCHEDULED"`
   - `Closed`: `"FINAL TALLIES"`
4. **Draft Safety**:
   - Events with `publicationStatus !== "PUBLISHED"` are strictly excluded from all public discovery grids.
