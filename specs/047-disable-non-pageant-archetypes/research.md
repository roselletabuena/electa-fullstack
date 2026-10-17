# Research & Architectural Decisions: Disable Non-Pageant Archetypes

**Feature ID**: `047-disable-non-pageant-archetypes`  
**Jira Key**: `VS-117`  
**Date**: 2026-10-17  

---

## 1. Problem Statement & Motivation

Electa is designed with a multi-archetype taxonomy foundation (`PAGEANT`, `STUDENT_COUNCIL`, `HACKATHON`, `CUSTOM`). While the database schema and preliminary taxonomy models support these archetypes, the end-to-end production features (e.g. multi-seat election tallies, hackathon rubric judging, custom contest management) are still being stabilized behind product milestones.

Allowing organizers to create non-pageant events results in incomplete event dashboards, unconfigured voting rules, and potential confusion. However, completely hiding the archetypes from Step 2 of the Event Creation Wizard:
1. Causes unexpected visual empty space in the 4-column desktop grid.
2. Diminishes visibility into Electa's forward product roadmap for institutional organizers.

**The optimal UX pattern**: Keep the archetypes visible, badge them prominently with **"COMING SOON"**, disable selection, and reject unauthorized submissions at the server boundary.

---

## 2. Component Design & Interaction Architecture

### 2.1 Archetype Configuration Data Model
In `src/features/events/types/archetype.ts`, we enhance `ArchetypeConfig`:
```typescript
export interface ArchetypeConfig {
  id: EventArchetype;
  label: string;
  description: string;
  groupingTerm: string;
  candidateTerm: string;
  allowMultipleSelections: boolean;
  defaultMaxSelections: number;
  isComingSoon?: boolean;
}
```
And declare active vs coming soon constants:
```typescript
export const ACTIVE_ARCHETYPES: readonly EventArchetype[] = ["PAGEANT"] as const;
export const COMING_SOON_ARCHETYPES: readonly EventArchetype[] = [
  "STUDENT_COUNCIL",
  "HACKATHON",
  "CUSTOM",
] as const;

export function isArchetypeAvailable(archetype: EventArchetype): boolean {
  return archetype === "PAGEANT";
}
```

### 2.2 Accessible Disabled State
In HTML/WAI-ARIA, `role="radio"` inside a `role="radiogroup"` should convey disabled states properly:
- `aria-disabled="true"` explicitly informs assistive technologies that the option cannot be activated.
- `aria-checked="false"` indicates it is not selected.
- In `onClick` and `onKeyDown`: If `config.isComingSoon || disabled`, prevent execution:
  ```typescript
  if (config.isComingSoon || disabled) {
    return;
  }
  ```
- Visual cues: `opacity-60 cursor-not-allowed` prevents hover focus cues associated with actionable buttons.

### 2.3 Color Contrast & Dual-Theme Compliance (WCAG 2.1 AA / AAA)
We verified the "COMING SOON" badge colors using the WCAG 2.1 color contrast script:
- **Light Theme**:
  - Background: Amber-100 `#fef3c7`
  - Text: Amber-900 `#78350f`
  - Border: Amber-300 `#fcd34d`
  - Contrast Ratio: **8.15:1** (Exceeds WCAG AAA 7.0:1)
- **Dark Theme**:
  - Background: Amber-950/60 (with `#451a03` base)
  - Text: Amber-200 `#fde68a`
  - Border: Amber-700/60
  - Contrast Ratio: **12.03:1** (Exceeds WCAG AAA 7.0:1)
- **Zero-Radius Geometry**: `rounded-none`, `--radius: 0px` strictly adhered to.

---

## 3. Boundary Enforcement Strategy

### 3.1 Zod Validation Schemas
In `src/lib/validations/event.ts` and `src/lib/validations/archetype-wizard.ts`:
```typescript
export const eventArchetypeCreationSchema = z
  .enum(EVENT_ARCHETYPES)
  .default("PAGEANT")
  .refine(
    (arch) => isArchetypeAvailable(arch),
    {
      message: "This event archetype is coming soon and currently disabled.",
    }
  );
```
When `safeParse` is called on an input containing `archetype: "STUDENT_COUNCIL"`, it fails with 400 Bad Request error.

### 3.2 Service Layer Guardrail
In `src/features/events/services/create-event.ts`, after schema validation, we also add an explicit check:
```typescript
if (!isArchetypeAvailable(archetype)) {
  return {
    success: false,
    error: "This event archetype is coming soon and currently disabled.",
    fieldErrors: {
      archetype: ["This event archetype is coming soon and currently disabled."],
    },
  };
}
```
This guarantees defense-in-depth even if callers bypass intermediate schemas.
