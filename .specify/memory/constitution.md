<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - Section VI (Test-First & Zero-Regression Quality Gates): Formally added Atomic Commits Enforcement and Conventional Commits standards.
  - Section "Performance, UX & Accessibility Standards": Formally integrated Electa Brand Design System (Opal light mode default, strict zero-radius geometry, Outfit/Sora/JetBrains Mono typography), Dual-Theme WCAG 2.1 AA parity with high-opacity image scrims, and Tailwind CSS v4 syntax conformance (bg-linear-to-*, fraction aspect ratios).
  - Section "Development Workflow & Quality Gates": Added Single-Command Agent Verification (agent:verify) and environment integrity guardrails.
- Added sections: None
- Removed sections: None
- Follow-up TODOs: None
-->

# Electa Constitution

## Core Principles

### I. Strict Type Safety & Boundary Validation

- TypeScript 5 strict mode is non-negotiable across the entire codebase.
- The use of `any` and non-null assertions (`!`) is strictly prohibited; narrow `unknown` or declare explicit interfaces instead.
- All system boundaries (Route Handlers, Server Actions, forms via React Hook Form, and environment variables via `@t3-oss/env-nextjs`) MUST be strictly validated against Zod schemas.

### II. Server-First & Boundary Isolation (Next.js 16 App Router)

- Components MUST default to React Server Components (RSC).
- Use `"use client"` exclusively when client state, browser events, or browser APIs are required.
- All client components consuming dynamic search parameters or dynamic data MUST be wrapped inside explicit `<Suspense>` boundaries.
- Asynchronous Next.js request APIs (`cookies()`, `headers()`, `params`, `searchParams`) MUST always be awaited.
- Route Handlers (`src/app/api/`) MUST return standard typed `ApiResponse<T>` envelopes. Direct UI form submissions MUST use Server Actions.

### III. Strict State Separation & Single Source of Truth

- **Database**: The Prisma schema (`prisma/schema.prisma`) is the single source of truth for database models and relationships. All database queries must use the Prisma singleton (`src/lib/db.ts`).
- **Server Data**: Server state (polls, votes, query cache) MUST be managed solely by TanStack Query. Never mirror server data into client global stores.
- **Client Session**: Authenticated user session state is stored in the Zustand `auth-store`.
- **URL State**: Search parameters, pagination, and filter criteria MUST be synchronized via `nuqs`.

### IV. Secure-by-Design & Auth Integrity

- All protected Route Handlers and Server Actions MUST authenticate and authorize requests by verifying the AWS Cognito JWT via `getSession()` from `src/lib/auth/get-session.ts`.
- Defense-in-depth is required: middleware route guards (`src/middleware.ts`) MUST be paired with server-side handler-level session verification.
- Environment secrets MUST NEVER be accessed via `process.env` directly; access MUST go through `src/env.ts`.

### V. Feature Colocation & Modular Architecture

- Code MUST follow a vertical slice architecture under `src/features/<feature-name>/`, colocating `components/`, `hooks/`, and `types/`.
- Reusable UI primitives MUST reside in `src/components/ui/` (Shadcn / Radix) and shared components in `src/components/shared/`.
- Named exports MUST be used for all internal modules, utilities, and components. Default exports are reserved exclusively for Next.js routing conventions (`page.tsx`, `layout.tsx`, etc.).

### VI. Test-First & Zero-Regression Quality Gates

- Business logic, voting aggregation algorithms, authorization checks, and validation schemas MUST have automated unit tests written in Vitest (`tests/unit/`).
- Bug fixes and core feature modifications MUST include accompanying test assertions confirming expected behavior.
- All staged files MUST pass automated linting (`eslint --fix`) and formatting (`prettier --write`) through `lint-staged` and Husky before committing.
- **Atomic Commits Enforcement**: Git commits MUST be atomic, bisectable, single-purpose units adhering to Conventional Commits format (`feat`, `fix`, `refactor`, `chore`, `test`, `docs`). Bundled multi-concern commits ("mega-commits", e.g. `git add .` mixing schema, api, ui, and docs) are strictly prohibited.

## Performance, UX & Accessibility Standards

- **Brand Design System (Opal Theme)**:
  - **Default Theme**: Default theme MUST be Light Mode (Opal Slate-50 `#F8FAFC`, foreground Slate-900 `#0F172A`, primary accent Sky Blue `#0284C7`). Pages MUST NOT default to dark backgrounds (`bg-slate-900`, `bg-black`) or naked white text without `dark:` scoping.
  - **Zero-Radius Geometry**: All buttons, inputs, cards, dialogs, dropdowns, badges, and containers MUST adhere to strict 0px corner geometry (`--radius: 0px`, `rounded-none`). Rounded corner utilities (`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`) are strictly prohibited, except for circular avatar photographs.
  - **Brand Identity & Tagline**: Official brand tagline is "Vote. Engage. Celebrate." Headings MUST use Outfit (`font-heading`), body and UI copy MUST use Sora (`font-sans`), and data/numeric displays MUST use JetBrains Mono (`font-mono`).
- **Dual-Theme Parity & WCAG 2.1 AA Compliance**:
  - Every UI component MUST maintain WCAG 2.1 AA color contrast (minimum 4.5:1 for body text, 3:1 for large text and interactive components) in BOTH Light Mode and Dark Mode.
  - Low-contrast grays on light backgrounds (`text-slate-300`, `text-slate-400`) are prohibited; use `text-slate-900` for headings, `text-slate-700` for body copy and interactive pills, and `text-slate-600` for secondary text.
  - Text placed over photos or images MUST include a high-opacity dark gradient scrim (`bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent`) to guarantee readability.
- **Tailwind CSS v4 Conformance**:
  - All gradient styles MUST use canonical Tailwind CSS v4 `bg-linear-to-*` syntax (e.g. `bg-linear-to-r`, `bg-linear-to-t`), never legacy `bg-gradient-to-*`.
  - Aspect ratio utilities MUST use native fraction syntax (`aspect-4/5`, `aspect-9/16`, `aspect-16/9`, `aspect-square`), never arbitrary bracket syntax (`aspect-[4/5]`).
- **Optimistic Interactions**: Polling and vote actions SHOULD leverage optimistic updates for immediate user feedback.
- **Accessibility Primitives**: Interactive UI components MUST utilize Radix UI primitives to ensure full keyboard navigation, screen reader accessibility, and focus management.
- **Optimized Media Assets**: All raster images MUST use Next.js `<Image>` for responsive sizing and automatic format optimization.

## Development Workflow & Quality Gates

- **Static Analysis & Verification**: Code MUST pass type checking (`npm run typecheck`), linting (`npm run lint`), format validation (`npm run format:check`), and unit tests (`npm run test:unit`) with zero warnings or errors.
- **Single-Command Agent Verification**: Unified verification CLI commands (`npm run agent:verify`) SHOULD be utilized for rapid agent feedback loops to prevent constitutional drift.
- **Database Migrations**: All schema modifications MUST be accompanied by a generated Prisma migration (`npx prisma migrate dev`). Raw SQL queries are prohibited unless Prisma lacks the expressive capability.
- **Environment Integrity**: All new environment variables MUST be declared in `src/env.ts` and documented in `.env.example`. Raw `process.env` access is detected and blocked.

## Governance

- The Constitution supersedes all informal conventions and ad-hoc practices.
- Every Spec Kit specification (`/speckit-specify`), implementation plan (`/speckit-plan`), and task list (`/speckit-tasks`) MUST verify compliance against this Constitution.
- **Versioning Policy**:
  - **MAJOR (X.0.0)**: Breaking redefinitions or removals of architectural principles or governance rules.
  - **MINOR (1.X.0)**: Introduction of new principles, design system standards, or significant expansions.
  - **PATCH (1.0.X)**: Non-breaking clarifications, formatting, or typo fixes.
- **Amendment Process**: Amendments require updating `.specify/memory/constitution.md`, recording the change in the Sync Impact Report, and bumping the constitution version accordingly.

**Version**: 1.1.0 | **Ratified**: 2026-08-26 | **Last Amended**: 2026-10-11
