# Implementation Plan: Launch Readiness Checklist

**Feature ID**: `038-launch-readiness-checklist`  
**Jira Key**: [VS-106](https://the-three-devsketeers.atlassian.net/browse/VS-106)

---

## 🏛️ Architecture & Boundary Mapping

```
                                      ┌──────────────────────────────────────────────┐
                                      │   src/app/(dashboard)/events/[slug]/settings │
                                      │                    page.tsx                  │
                                      │                     (RSC)                    │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                   Queries: db.division.count, db.contestant.count,
                                            db.eventAuditLog.count
                                                             │
                                                             ▼
                                      ┌──────────────────────────────────────────────┐
                                      │   computeLaunchReadinessSnapshot(event, ...) │
                                      │       (Pure deterministic utility)           │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                              Passes LaunchReadinessSnapshot
                                                             │
                                                             ▼
                                      ┌──────────────────────────────────────────────┐
                                      │  src/features/events/components/dashboard/   │
                                      │       LaunchReadinessChecklist.tsx           │
                                      │               ("use client")                 │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                      ┌──────────────────────┴───────────────────────┐
                                      ▼                                              ▼
                        [Status === "DRAFT"]                          [Status === "PUBLISHED"]
                     Zero-Radius Brutalist Card                     Compact "Ready & Live" Banner
                     - 4 Milestones                                 - Dismiss Button
                     - Progress Bar (0..100%)                       - Stored in localStorage
                     - In-Flow Collapse/Expand Toggle
```

---

## 📦 Files to Create & Modify

1. **New Utility**:
   - `src/features/events/utils/launch-readiness.ts`: Pure function `computeLaunchReadinessSnapshot(event, counts)` returning typed `LaunchReadinessSnapshot`.
2. **New Types & Contracts**:
   - `src/features/events/types/launch-readiness.ts`: Re-export Zod types and interfaces for launch readiness.
   - Export in `src/features/events/types/index.ts`.
3. **New UI Component**:
   - `src/features/events/components/dashboard/LaunchReadinessChecklist.tsx`: Embedded zero-radius brutalist widget with in-flow collapse toggle, milestone links, progress bar, and published dismissal state.
4. **Page Integration**:
   - `src/app/(dashboard)/events/[slug]/settings/page.tsx`: Fetch division, contestant, and audit counts in parallel, compute snapshot, and render `<LaunchReadinessChecklist />` above `<SettingsTabsContainer />`.
5. **Unit Tests**:
   - `tests/unit/events/launch-readiness.test.ts`: Pure utility tests for all milestone combinations and edge cases.
   - `tests/unit/events/launch-readiness-checklist.test.tsx`: Component tests for rendering, copy link toast, and published/dismissal behavior.
