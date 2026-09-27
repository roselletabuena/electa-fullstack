# Implementation Plan: Organizer Event Branding & Public Profile Management

**Branch**: `004-organizer-branding-settings` | **Date**: 2026-09-27 | **Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/004-organizer-branding-settings/spec.md)

**Input**: Feature specification from `/specs/004-organizer-branding-settings/spec.md`

## Summary

Transform the organizer dashboard General Settings panel into an interactive branding management form (`GeneralBrandingForm`). Organizers can configure public competition metadata (Title, Description, Banner Image URL) with real-time responsive aspect-ratio previews (16:9 and 21:9), copy the canonical event URL with a 1-click clipboard utility, and submit updates via a secure, server-validated action that records an immutable `EventAuditLog` entry.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, zero `any`, zero non-null assertions `!`)  
**Primary Dependencies**: Next.js 16 (App Router RSC & Server Actions), React 19, Tailwind CSS 4, Radix UI / Lucide React, React Hook Form, `@hookform/resolvers/zod`, Zod schemas, Sonner / Toast  
**Storage**: PostgreSQL via Supabase with Prisma ORM (`prisma/schema.prisma`, `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/`)  
**Target Platform**: Node.js 20+ Server (Next.js 16 App Router)  
**Project Type**: Next.js 16 Web Application  
**Performance Goals**: Live aspect-ratio preview updates < 100ms; form submission and audit log persistence < 1.0s; 1-click link copy response < 300ms  
**Constraints**: Slug is strictly immutable in branding settings; server-side ownership verification enforced on mutations; strict WCAG AA contrast and image error resilience  
**Scale/Scope**: Multi-tenant event organizer configuration with complete audit trail history

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Compliance Check                                                                                                                                                                                         | Status |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **I. Strict Type Safety & Boundary Validation**           | Input payload validated using Zod schema (`src/lib/validations/event-branding.ts`). Form managed with React Hook Form + Zod resolver. Zero `any` or `!`.                                                 | Passed |
| **II. Server-First & Boundary Isolation (Next.js 16)**    | Settings page remains RSC; form interactivity is encapsulated in `"use client"` components (`GeneralBrandingForm`, `BannerAspectPreview`, `CopySlugButton`). Mutations use authenticated Server Actions. | Passed |
| **III. Strict State Separation & Single Source of Truth** | Prisma database model `Event` and `EventAuditLog` are the single source of truth. Server Action updates DB and calls `revalidatePath`.                                                                   | Passed |
| **IV. Secure-by-Design & Auth Integrity**                 | Server Action enforces `requireEventOwnership(slug)` checking session `userId === event.organizerId` before executing DB mutation.                                                                       | Passed |
| **V. Feature Colocation & Modular Architecture**          | Colocated in `src/features/events/` (`components/dashboard/`, `actions/`, `types/`). UI primitives from `src/components/ui/`. Named exports used.                                                        | Passed |
| **VI. Test-First Quality Gates**                          | Vitest unit tests in `tests/unit/events/branding-validation.test.ts` and `tests/unit/events/update-branding-action.test.ts`. Pre-commit linter/formatting gates enforced.                                | Passed |

## Project Structure

### Documentation (this feature)

```text
specs/004-organizer-branding-settings/
├── plan.md              # Implementation Plan
├── research.md          # Architecture decisions, preview patterns & audit schema
├── data-model.md        # Entities, Zod schemas, and audit payload types
├── quickstart.md        # Validation scenarios & test commands
├── contracts/
│   └── branding-settings.md # Server action mutation & UI contract
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

```text
src/
├── features/events/
│   ├── actions/
│   │   └── update-event-branding.ts                   # Server action for updating branding + audit log
│   ├── components/
│   │   └── dashboard/
│   │       ├── GeneralBrandingForm.tsx                # Interactive React Hook Form for General tab
│   │       ├── BannerAspectPreview.tsx                # Live 16:9 / 21:9 image preview widget
│   │       ├── CopySlugButton.tsx                     # 1-click public link clipboard button
│   │       ├── GeneralSettingsSummaryCard.tsx         # Updated or replaced by GeneralBrandingForm
│   │       └── OrganizerDashboardHeader.tsx           # Reflects dynamic title updates
│   ├── types/
│   │   └── index.ts                                   # Extended branding input and audit log types
│
├── lib/
│   └── validations/
│       └── event-branding.ts                          # Zod schema for title, description, banner, reason
│
└── tests/
    └── unit/
        └── events/
            ├── branding-validation.test.ts            # Zod validation schema unit tests
            └── update-branding-action.test.ts         # Server action & audit logging unit tests
```

**Structure Decision**: Vertical slice under `src/features/events/` integrating Server Actions (`actions/update-event-branding.ts`), validation schemas (`lib/validations/event-branding.ts`), and unit tests (`tests/unit/events/`).

## Complexity Tracking

> No constitutional violations or unwarranted complexity introduced.
