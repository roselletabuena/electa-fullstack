<!--
Sync Impact Report:
- Version change: Unversioned draft -> 1.0.0
- Modified principles: Replaced template placeholders with 6 project-specific core principles
- Added sections: Core Principles, Performance, UX & Accessibility Standards, Development Workflow & Quality Gates, Governance
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

## Performance, UX & Accessibility Standards

- **Optimistic Interactions**: Polling and vote actions SHOULD leverage optimistic updates for immediate user feedback.
- **Accessibility (a11y)**: Interactive UI components MUST utilize Radix UI primitives to ensure full keyboard navigation, screen reader accessibility, and WCAG compliance.
- **Design System & Assets**: Use Tailwind CSS 4 `@theme` design tokens in `src/app/globals.css`. All images MUST use Next.js `<Image>` for automatic optimization.

## Development Workflow & Quality Gates

- **Static Analysis & Type Checking**: Code MUST pass `npm run typecheck`, `npm run lint`, and `npm run format:check` with zero warnings or errors.
- **Database Migrations**: All schema modifications MUST be accompanied by a generated Prisma migration (`npx prisma migrate dev`). Raw SQL queries are prohibited unless Prisma lacks the expressive capability.
- **Documentation**: All new environment variables MUST be declared in `src/env.ts` and documented in `.env.example`.

## Governance

- The Constitution supersedes all informal conventions and ad-hoc practices.
- Every Spec Kit specification (`/speckit-specify`), implementation plan (`/speckit-plan`), and task list (`/speckit-tasks`) MUST verify compliance against this Constitution.
- **Versioning Policy**:
  - **MAJOR (X.0.0)**: Breaking redefinitions or removals of architectural principles or governance rules.
  - **MINOR (1.X.0)**: Introduction of new principles, standards, or significant additions.
  - **PATCH (1.0.X)**: Non-breaking clarifications, formatting, or typo fixes.
- **Amendment Process**: Amendments require updating `.specify/memory/constitution.md`, recording the change in the Sync Impact Report, and bumping the constitution version accordingly.

**Version**: 1.0.0 | **Ratified**: 2026-08-26 | **Last Amended**: 2026-08-26
