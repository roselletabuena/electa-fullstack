# Implementation Plan: Organizer Dashboard "Categories & Awards" Settings Management UI

**Branch**: `009-category-awards-settings` | **Date**: 2026-09-27 | **Spec**: [specs/009-category-awards-settings/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/009-category-awards-settings/spec.md)

**Input**: Feature specification from `specs/009-category-awards-settings/spec.md` (VS-37)

---

## Summary

Deliver an intuitive, accessible "Categories & Awards" settings management interface at `/events/[slug]/settings?tab=categories`. The feature enables event organizers to configure custom competition divisions and award tracks with 1-click taxonomy presets (Beauty Pageant, Talent Contest, Dance Championship, Academic/Hackathon), inline tag badge management, optimistic voting availability toggles (`isVotingOpen`), and safe deletion blocker dialogs safeguarding contestant assignments.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ (strict mode enabled)  
**Primary Dependencies**: Next.js 16 (App Router), React 19, `@tanstack/react-query`, `nuqs`, `lucide-react`, `@radix-ui/react-dialog`, `@radix-ui/react-switch`, `sonner` (toasts), `zod`  
**Storage**: PostgreSQL (Prisma ORM models: `Division`, `AwardCategory`, `Contestant`, `Event`)  
**Testing**: Vitest + React Testing Library (`tests/unit/`)  
**Target Platform**: Responsive Web (Desktop & Mobile, WCAG 2.1 AA compliant)  
**Project Type**: Full-stack Next.js web application (Dashboard UI slice)  
**Performance Goals**: Optimistic UI mutations in < 50ms, initial taxonomy load in < 250ms  
**Constraints**: Zero `any` types, strict Zod boundary validation, Radix UI accessibility compliance  
**Scale/Scope**: Organizers managing up to 20 divisions and 30 award tracks per event

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                        | Requirement                                                             | Status   | Evidence / Notes                                                                                               |
| :------------------------------- | :---------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------- |
| **I. Strict Type Safety**        | Zero `any`, explicit interfaces, Zod boundary validation                | **PASS** | Strong typing for `DivisionDto`, `AwardCategoryDto`, `TaxonomyPreset`; validated with existing Zod schemas.    |
| **II. Server-First & Isolation** | RSC default, `"use client"` for interactive forms, `<Suspense>` wrapper | **PASS** | `CategoryAwardsSettingsForm` is client-isolated; wrapped in `<Suspense>` in `settings/page.tsx`.               |
| **III. State Separation**        | Server data managed via TanStack Query; URL state in `nuqs`             | **PASS** | Uses TanStack Query for taxonomy cache & mutations; `nuqs` manages `?tab=categories`.                          |
| **IV. Secure-by-Design**         | Session verification via `getSession()` and `requireEventOwnership()`   | **PASS** | Protected by `requireEventOwnership(slug)` in `settings/page.tsx` and Route Handlers.                          |
| **V. Feature Colocation**        | Vertical slice in `src/features/events/`                                | **PASS** | Components colocated in `src/features/events/components/dashboard/` and types in `src/features/events/types/`. |
| **VI. Test-First Quality**       | Vitest unit tests for UI components & mutations                         | **PASS** | Unit tests planned for preset application, inline additions, voting toggle, and delete guard modal.            |

---

## Project Structure

### Documentation (this feature)

```text
specs/009-category-awards-settings/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical decisions and findings
├── data-model.md        # Data models and preset catalog
├── quickstart.md        # Validation guide and test scenarios
├── contracts/           # UI and API contracts
│   └── category-awards-ui-contracts.md
└── checklists/
    └── requirements.md  # Quality verification checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       └── events/
│           └── [slug]/
│               └── settings/
│                   └── page.tsx                         # Integrates tab query parsing
├── features/
│   └── events/
│       ├── components/
│       │   └── dashboard/
│       │       ├── CategoryAwardsSettingsForm.tsx       # Main tab management component
│       │       ├── TaxonomyPresetsCard.tsx              # 1-click preset selector
│       │       ├── DivisionsSection.tsx                 # Division badges & creation
│       │       ├── AwardCategoriesSection.tsx           # Award cards & voting toggles
│       │       ├── TaxonomyDeleteDialog.tsx             # Referential integrity guard modal
│       │       ├── SettingsTabNav.tsx                   # Add "categories" tab button & icon
│       │       └── SettingsTabsContainer.tsx            # Mount CategoryAwardsSettingsForm
│       ├── constants/
│       │   └── taxonomy-presets.ts                      # 4 curated preset templates
│       ├── hooks/
│       │   └── useEventTaxonomy.ts                      # TanStack Query & mutation hooks
│       └── types/
│           └── index.ts                                 # SETTINGS_TABS updated to include "categories"
└── tests/
    └── unit/
        └── events/
            ├── category-awards-settings-form.test.tsx   # Form integration & interaction tests
            ├── taxonomy-presets.test.ts                 # Preset definitions & mapping tests
            └── taxonomy-delete-dialog.test.tsx          # Blocker & confirmation dialog tests
```

---

## Complexity Tracking

> **No violations identified.** Full adherence to VoteSphere Constitution.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :-------- | :--------- | :----------------------------------- |
| _None_    | N/A        | N/A                                  |
