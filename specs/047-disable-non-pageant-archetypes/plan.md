# Implementation Plan: Disable Non-Pageant Archetypes in Event Creation Wizard

**Feature ID**: `047-disable-non-pageant-archetypes`  
**Jira Key**: `VS-117`  
**Date**: 2026-10-17  

---

## 1. Architectural Boundaries & Files

```text
src/
├── features/events/
│   ├── types/
│   │   └── archetype.ts                     # ArchetypeConfig update: isComingSoon, ACTIVE_ARCHETYPES, isArchetypeAvailable
│   ├── components/
│   │   ├── archetype-selector.tsx           # Disabled visual state, COMING SOON pill badge, click/key suppression
│   │   └── event-creation-wizard.tsx        # Wizard archetype defaults and validation guard
│   ├── services/
│   │   └── create-event.ts                  # Boundary rejection for non-pageant archetypes
│   └── actions/
│       └── create-event.ts                  # Server action error propagation
└── lib/validations/
    ├── event.ts                             # createEventSchema archetype refinement
    └── archetype-wizard.ts                  # createEventWizardSchema archetype refinement
```

---

## 2. Step-by-Step Implementation Strategy

### Step 1: Type & Configuration Augmentation (`archetype.ts`)
- Add `isComingSoon?: boolean` to `ArchetypeConfig`.
- Set `isComingSoon: true` for `STUDENT_COUNCIL`, `HACKATHON`, and `CUSTOM`.
- Set `isComingSoon: false` for `PAGEANT`.
- Export `ACTIVE_ARCHETYPES`, `COMING_SOON_ARCHETYPES`, `isArchetypeAvailable()`, and `isArchetypeComingSoon()`.

### Step 2: Component Refactor (`archetype-selector.tsx`)
- Check `config.isComingSoon`.
- For coming soon cards:
  - Add `aria-disabled="true"`.
  - Style with `opacity-60 cursor-not-allowed`.
  - Suppress selection in `onClick` and `onKeyDown`.
  - Render a high-contrast zero-radius "COMING SOON" badge in the upper right corner where the "Selected" badge would otherwise appear.
  - Colors:
    - Light: `border border-amber-300 bg-amber-100 text-amber-900 font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-none`
    - Dark: `dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-200`
- Keep `PAGEANT` fully enabled and selected by default.

### Step 3: Schema & Boundary Validation (`event.ts`, `archetype-wizard.ts`, `create-event.ts`)
- In `createEventSchema` and `createEventWizardSchema`, add a refinement:
  `refine((val) => isArchetypeAvailable(val), { message: "This event archetype is coming soon and currently disabled." })`
- In `createEvent` service, add explicit guard returning `{ success: false, error: "This event archetype is coming soon and currently disabled.", fieldErrors: { archetype: [...] } }`.

### Step 4: Unit Testing & Verification
- Update and extend `tests/unit/events/archetype-selector.test.tsx` to verify:
  1. All 4 archetypes render.
  2. "Beauty Pageant" is active and selectable.
  3. "Student Council Election", "Hackathon / Competition", and "Custom Contest" display "COMING SOON" badges.
  4. Disabled cards have `aria-disabled="true"` and `opacity-60 cursor-not-allowed`.
  5. Clicks and Enter/Space key presses on disabled cards do not invoke `onChange`.
- Update `tests/unit/events/archetype-validation.test.ts` and `tests/unit/events/create-event-service.test.ts` to verify rejection of non-pageant archetypes with 400 Bad Request.

---

## 3. Verification Commands

```bash
npm run typecheck
npm run lint
npm run test:unit
```
