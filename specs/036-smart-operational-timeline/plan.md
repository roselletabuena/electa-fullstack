# Implementation Plan: Smart Operational Timeline & Quick Duration Presets with Draft Recovery

**Feature ID**: `036-smart-operational-timeline`  
**Jira Key**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## 1. Architectural Strategy & Boundary Mapping

This feature touches frontend form state, timeline calculation logic, and client session persistence:

1. **Utility & Preset Helper (`src/features/events/utils/timeline-presets.ts`)**:
   - Extract pure, unit-testable helpers:
     - `TIMELINE_PRESETS`: `[{ id: "7d", label: "+7 Days", days: 7 }, { id: "14d", label: "+14 Days", days: 14 }, { id: "30d", label: "+30 Days", days: 30 }]`
     - `formatLocalDateTime(date: Date): string`
     - `calculateEndsAtFromDuration(startsAtStr: string, days: number): string`
     - `getActivePreset(startsAtStr: string, endsAtStr: string): TimelineDurationPresetId | null`
     - `isTemporalWindowValid(startsAtStr: string, endsAtStr: string): boolean`
2. **Draft Storage Hook / Utility (`src/features/events/hooks/useCreateEventDraft.ts` or helper)**:
   - Save to `sessionStorage` (`electa:create_event_draft`) with debounce or on form change.
   - Restore draft on component mount.
   - Expose `clearDraft()` and `isDraftRestored` flag.
3. **Form Component Updates (`src/features/events/components/CreateEventForm.tsx`)**:
   - Incorporate quick duration preset chips with zero-radius styling (`rounded-none`).
   - Active preset chip: `bg-sky-600 text-white font-bold dark:bg-sky-500 dark:text-slate-950 rounded-none`.
   - Restored draft banner with `"Clear Draft"` action button.
   - Clear draft from `sessionStorage` upon successful submission.
   - Adhere strictly to Electa zero-radius geometry (`rounded-none` on container, inputs, alerts, buttons).
4. **Unit Tests (`tests/unit/events/create-event-form.test.tsx` & `tests/unit/events/timeline-presets.test.ts`)**:
   - Test preset calculations and active matching.
   - Test preset chip click updating form inputs.
   - Test temporal boundary warning (< 1 hour) and submit button disable.
   - Test draft persistence, restoration alert, and clear draft functionality.

---

## 2. Test Plan & Gates

- **Unit Testing (Vitest)**:
  - `tests/unit/events/timeline-presets.test.ts`: Pure date logic.
  - `tests/unit/events/create-event-form.test.tsx`: Integration of chips, warnings, and sessionStorage draft.
- **Verification Commands**:
  - `npm run test:unit`
  - `npm run typecheck`
  - `npm run lint`
- **Constitutional Principles**:
  - §I: Strict TypeScript 5, no `any`, no non-null assertions `!`.
  - §II: Controlled client component with clean boundaries.
  - §V: Vertical slice colocation in `src/features/events/`.
