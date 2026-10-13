# Implementation Tasks: Smart Operational Timeline & Quick Duration Presets with Draft Recovery

**Feature ID**: `036-smart-operational-timeline`  
**Jira Key**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## Task Matrix

- [ ] **Task 1: Core Timeline Calculation Helpers & Unit Tests**
  - **File(s)**: `src/features/events/utils/timeline-presets.ts`, `tests/unit/events/timeline-presets.test.ts`
  - Implement `TIMELINE_PRESETS`, `formatLocalDateTime`, `calculateEndsAtFromDuration`, `getActivePreset`, `isTemporalWindowValid`.
  - Add unit tests verifying edge cases (leap years, month rollovers, exactly 1 hour, < 1 hour).
  - Commit: `test(events): add unit tests for timeline duration presets and date calculations` & `feat(events): implement timeline presets and date calculation utilities`

- [ ] **Task 2: Draft Recovery Storage Hook & Session Synchronization**
  - **File(s)**: `src/features/events/hooks/useCreateEventDraft.ts` (or integrated helper), `tests/unit/events/create-event-draft.test.ts`
  - Implement safe `sessionStorage` persistence with key `electa:create_event_draft`.
  - Expose draft restoration, draft clearing, and auto-cleanup triggers.
  - Commit: `feat(events): add sessionStorage draft recovery hook for create event form`

- [ ] **Task 3: Integrate Quick Duration Presets & Draft Recovery in CreateEventForm**
  - **File(s)**: `src/features/events/components/CreateEventForm.tsx`
  - Mount duration preset chips (`+7 Days`, `+14 Days`, `+30 Days`) with zero-radius styling (`rounded-none`).
  - Active styling: `bg-sky-600 text-white font-bold dark:bg-sky-500 dark:text-slate-950 rounded-none`.
  - Unselected styling: `bg-white text-slate-700 border border-slate-300 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 rounded-none`.
  - Add Draft Restored alert with "Clear Draft" action.
  - Remove draft on successful submission.
  - Align form container, inputs, alerts, and buttons to Electa zero-radius standards (`rounded-none`).
  - Commit: `feat(events): integrate quick duration chips and draft restoration into CreateEventForm`

- [ ] **Task 4: Comprehensive Integration Tests & Verification**
  - **File(s)**: `tests/unit/events/create-event-form.test.tsx`
  - Add tests for chip clicks updating `endsAt`.
  - Add tests for temporal warning and disabled submit button.
  - Add tests for `sessionStorage` draft recovery on mount, "Clear Draft" button, and draft cleanup on successful submission.
  - Commit: `test(events): cover duration chips, temporal warning, and draft recovery in CreateEventForm`

- [ ] **Task 5: Convergence, Quality Gates & Auto PR**
  - Run `npm run typecheck`, `npm run lint`, `npm run test:unit`.
  - Verify Electa Constitution §I–§VI compliance.
  - Prepare PR description in `.specify/pr-body.md` and trigger auto PR.
  - Transition Jira issue `VS-105` to `Done`.
