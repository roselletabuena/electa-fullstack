# Implementation Plan: Dedicated Event Creation Page & Real-Time Slug Validation UI

**Branch**: `011-event-creation-form` | **Date**: 2026-09-27 | **Spec**: [specs/011-event-creation-form/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/011-event-creation-form/spec.md)

**Input**: Feature specification from `specs/011-event-creation-form/spec.md`

---

## Summary

Deliver a modern, accessible, and responsive dedicated event creation page at `/events/new` ([VS-49](https://the-three-devsketeers.atlassian.net/browse/VS-49)). Key capabilities include:

1. Route protection and redirection for unauthenticated visitors.
2. React Hook Form + Zod schema validation using `createEventSchema`.
3. Auto-slug derivation from Event Title with 300ms debounced live query against `/api/events/check-slug` and visual status badge.
4. Banner image URL configuration with live 16:9 / 21:9 aspect ratio preview and broken image fallback (with direct S3 binary upload explicitly out of scope for this phase).
5. Date & time scheduling inputs with 1-hour minimum duration guardrails.
6. Submission flow using `createEventAction` Server Action with loading states, error alerts, success toast, and post-creation navigation to `/events/[slug]/settings`.

---

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode enabled)  
**Primary Dependencies**: Next.js 16 (App Router), React Hook Form, `@hookform/resolvers/zod`, Lucide React, Radix UI Primitives, Sonner / Toast  
**Storage**: PostgreSQL via existing `createEventAction` Server Action  
**Testing**: Vitest + React Testing Library (`tests/unit/events/`)  
**Target Platform**: Web Browsers (Responsive Desktop & Mobile Viewports)  
**Project Type**: Next.js App Router (RSC + Client Components)  
**Performance Goals**: Auto-slug debounced query < 150ms roundtrip; Client-side form validation < 16ms  
**Constraints**: Zero `any` types; 100% WCAG 2.1 AA accessible forms; Strict Session verification; S3 upload out of scope  
**Scale/Scope**: Single creation page route with modular client components under `src/features/events/components/`

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                        | Check / Constraint                                                                                                                   |  Status  |
| :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------: |
| **I. Strict Type Safety & Boundary Validation**  | React Hook Form strictly typed with `CreateEventInput` & `createEventSchema`. Zero `any`.                                            | **PASS** |
| **II. Server-First & Boundary Isolation**        | Server Component page at `src/app/(dashboard)/events/new/page.tsx` with `<Suspense>` wrapping client form; Server Action invocation. | **PASS** |
| **III. Strict State Separation**                 | Server data managed through actions; Form local state strictly within React Hook Form.                                               | **PASS** |
| **IV. Secure-by-Design & Auth Integrity**        | Page-level `getSession()` guard with redirect to `/login?redirect=%2Fevents%2Fnew`.                                                  | **PASS** |
| **V. Feature Colocation & Modular Architecture** | Components colocated in `src/features/events/components/`, hooks in `src/features/events/hooks/`.                                    | **PASS** |
| **VI. Test-First Quality Gates**                 | Component and unit tests in `tests/unit/events/` using Vitest + RTL.                                                                 | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/011-event-creation-form/
├── plan.md              # This file
├── research.md          # Phase 0 architectural decisions
├── data-model.md        # Form state & validation definitions
├── quickstart.md        # Manual and automated verification guide
├── contracts/
│   └── event-creation-form-ui.md # UI & status badge contract
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/
├── app/
│   └── (dashboard)/
│       └── events/
│           └── new/
│               └── page.tsx          # Protected Server Component route (/events/new)
└── features/
    └── events/
        ├── components/
        │   ├── CreateEventForm.tsx   # Core creation form component
        │   └── SlugAvailabilityBadge.tsx # Visual slug status indicator
        └── hooks/
            └── useDebouncedSlugCheck.ts # Debounced slug verification hook

tests/
└── unit/
    └── events/
        ├── create-event-form.test.tsx # Form rendering, interaction & submission tests
        └── slug-availability-badge.test.tsx # Status badge rendering tests
```

**Structure Decision**: Colocate form components and hooks within `src/features/events/`, reuse existing `BannerAspectPreview.tsx` and `createEventAction`, and wire the protected route in `src/app/(dashboard)/events/new/page.tsx`.

---

## Complexity Tracking

> Direct S3 file upload is deferred/out of scope to avoid premature complexity and dependencies. Banner configuration uses URL inputs with live preview.
