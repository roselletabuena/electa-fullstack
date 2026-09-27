# Implementation Plan: Organizer Voting Rules & Daily Free Vote Quota Configuration

**Branch**: `005-organizer-voting-rules` | **Date**: 2026-09-27 | **Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/005-organizer-voting-rules/spec.md)

**Input**: Feature specification from `/specs/005-organizer-voting-rules/spec.md`

## Summary

Deliver full organizer control over event voting rules by replacing the placeholder Voting Rules card with an interactive management form (`VotingRulesForm`). Organizers can configure the daily free vote quota (1–5 votes per 24-hour cycle) and toggle free daily voting on or off. Updates are validated via Zod schemas, persisted to the database via authenticated Server Actions, audited in immutable `EventAuditLog` records with before/after state snapshots, and enforced across public voting interfaces.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, zero `any`, zero non-null assertions `!`)  
**Primary Dependencies**: Next.js 16 (App Router RSC & Server Actions), React 19, Tailwind CSS 4, Radix UI (Switch, Slider/Select), React Hook Form, `@hookform/resolvers/zod`, Zod schemas, Sonner / Toast  
**Storage**: PostgreSQL via Supabase with Prisma ORM (`prisma/schema.prisma`, `src/lib/db.ts`)  
**Testing**: Vitest (`tests/unit/`)  
**Target Platform**: Node.js 20+ Server (Next.js 16 App Router)  
**Project Type**: Next.js 16 Web Application  
**Performance Goals**: UI toggle and quota adjustments update < 50ms; form submission and audit log creation < 800ms  
**Constraints**: Quota strictly constrained to integers 1–5; server-side ownership verification enforced on mutations; strict WCAG 2.1 AA accessibility compliance; immutable audit records  
**Scale/Scope**: Multi-tenant event organizer configuration with complete audit trail history

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                                 | Compliance Check                                                                                                                                                                  | Status |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| **I. Strict Type Safety & Boundary Validation**           | Input payload validated using Zod schemas (`src/lib/validations/event-voting-rules.ts`). Form managed with React Hook Form + Zod resolver. Zero `any` or `!`.                     | Passed |
| **II. Server-First & Boundary Isolation (Next.js 16)**    | Settings page remains RSC; form interactivity is encapsulated in `"use client"` components (`VotingRulesForm`). Mutations use authenticated Server Actions.                       | Passed |
| **III. Strict State Separation & Single Source of Truth** | Prisma database model `Event` and `EventAuditLog` are the single source of truth. Server Action updates DB and calls `revalidatePath`.                                            | Passed |
| **IV. Secure-by-Design & Auth Integrity**                 | Server Action enforces `requireEventOwnership(slug)` checking Cognito session `userId === event.organizerId` before executing DB mutation.                                        | Passed |
| **V. Feature Colocation & Modular Architecture**          | Colocated in `src/features/events/` (`components/dashboard/`, `actions/`, `types/`). UI primitives from `src/components/ui/`. Named exports used.                                 | Passed |
| **VI. Test-First Quality Gates**                          | Vitest unit tests in `tests/unit/events/voting-rules-validation.test.ts` and `tests/unit/events/update-voting-rules-action.test.ts`. Pre-commit linter/formatting gates enforced. | Passed |

## Project Structure

### Documentation (this feature)

```text
specs/005-organizer-voting-rules/
├── plan.md                       # Implementation Plan (/speckit-plan output)
├── research.md                   # Phase 0 Architecture decisions & schema findings
├── data-model.md                 # Phase 1 Prisma schema, Zod validation & domain types
├── quickstart.md                 # Phase 1 Test execution & manual validation guide
├── contracts/
│   └── voting-rules-settings.md  # Phase 1 Server action & UI contract
└── checklists/
    └── requirements.md           # Specification quality checklist
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                                      # Added isFreeVotingEnabled & dailyFreeVoteLimit to Event model

src/
├── features/events/
│   ├── actions/
│   │   └── update-voting-rules.ts                     # Server Action for updating voting rules + audit log
│   ├── components/
│   │   └── dashboard/
│   │       ├── VotingRulesForm.tsx                    # Interactive React Hook Form for Voting Rules tab
│   │       └── VotingRulesSettingsSummaryCard.tsx     # Replaced or integrated with VotingRulesForm
│   └── types/
│       └── index.ts                                   # Extended VotingRulesSnapshot & response types
│
├── lib/
│   └── validations/
│       └── event-voting-rules.ts                      # Zod schemas for voting rules validation
│
└── tests/
    └── unit/
        └── events/
            ├── voting-rules-validation.test.ts        # Zod validation schema unit tests
            └── update-voting-rules-action.test.ts     # Server action & audit logging unit tests
```

**Structure Decision**: Vertical slice under `src/features/events/` integrating Server Actions (`actions/update-voting-rules.ts`), UI components (`components/dashboard/VotingRulesForm.tsx`), validation schemas (`lib/validations/event-voting-rules.ts`), and unit tests (`tests/unit/events/`).

## Complexity Tracking

> No constitutional violations or unwarranted complexity introduced.
