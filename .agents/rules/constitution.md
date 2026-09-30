---
trigger: always_on
description: Always enforce the 6 core principles of the VoteSphere Constitution across all implementation, planning, and review tasks.
---

# VoteSphere Constitutional Rules (§I–§VI)

All code written or modified in this repository MUST strictly follow the 6 Core Principles of the VoteSphere Constitution (`.specify/memory/constitution.md`):

## §I. Strict Type Safety & Boundary Validation
- TypeScript 5 strict mode is non-negotiable.
- ❌ Prohibited: `any`, `as any`, `<any>`, non-null assertions (`!`).
- ✅ Handle `unknown` and narrow types or define explicit TypeScript interfaces (prefer `interface` over `type`).
- All boundaries (Route Handlers, Server Actions, React Hook Form forms, environment variables) MUST be validated with Zod schemas.

## §II. Server-First & Boundary Isolation (Next.js 16 App Router)
- **Default to React Server Components (RSC)**.
- Use `"use client"` ONLY when client state, browser events, or browser APIs are required.
- Dynamic client components consuming search params or dynamic data MUST be wrapped inside explicit `<Suspense>` boundaries.
- **Asynchronous Next.js request APIs (`cookies()`, `headers()`, `params`, `searchParams`) MUST ALWAYS be awaited**.
- Route Handlers (`src/app/api/`) MUST return standard typed `ApiResponse<T>` envelopes (`apiSuccess()`, `apiError()`). Direct UI form submissions MUST use Server Actions.

## §III. Strict State Separation & Single Source of Truth
- **Database**: Prisma schema (`prisma/schema.prisma`) is the single source of truth. All queries MUST use the Prisma singleton (`src/lib/db.ts`).
- **Server Data**: Managed solely by TanStack Query. NEVER mirror server data into client global stores (Zustand).
- **Client Session**: Authenticated user session state is stored in Zustand `auth-store`.
- **URL State**: Search params, pagination, and filters MUST use `nuqs` (not local `useState`).

## §IV. Secure-by-Design & Auth Integrity
- Protected Route Handlers and Server Actions MUST authenticate and authorize requests via `getSession()` from `src/lib/auth/get-session.ts`.
- Environment secrets MUST NEVER be accessed via raw `process.env.*` directly; access MUST go through `@/env` (`src/env.ts`).

## §V. Feature Colocation & Modular Architecture
- Vertical slice architecture under `src/features/<feature-name>/` (`components/`, `hooks/`, `types/`, `actions/`, `utils/`).
- Reusable UI primitives in `src/components/ui/` (Shadcn/Radix) and shared components in `src/components/shared/`.
- Named exports MUST be used for all internal modules, utilities, and components (default exports reserved only for Next.js routing files: `page.tsx`, `layout.tsx`).

## §VI. Test-First & Quality Gates
- Business logic, voting aggregation, auth checks, and validation schemas MUST have automated unit tests in Vitest (`tests/unit/`).
- All code must pass `npm run typecheck`, `npm run lint`, and `npm run test:unit` before committing.
