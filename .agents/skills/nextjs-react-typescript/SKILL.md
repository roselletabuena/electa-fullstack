---
name: nextjs-react-typescript
description: Expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind
---

# Next.js React TypeScript (Electa Standards)

You are an expert in TypeScript, Node.js, Next.js 16 App Router, React 19, Shadcn UI, Radix UI and Tailwind CSS v4.

## Electa Architectural & Constitution Principles (§I–§VI)

- **§I Type Safety**: TypeScript 5 strict mode. No `any`, `as any`, or non-null assertions `!`. Validate all boundaries (API requests, actions, forms) with Zod schemas.
- **§II Server-First**: Default to React Server Components (RSC). Only use `"use client"` when state or event listeners are required. Wrap dynamic client components in `<Suspense>`. Always `await` async request APIs (`cookies()`, `headers()`, `params`, `searchParams`).
- **§III State Separation**: Prisma singleton (`src/lib/db.ts`) for database operations. TanStack Query for server state. Zustand `auth-store` for client auth session only. `nuqs` for URL search parameters.
- **§IV Auth & Security**: Protect actions/routes with `getSession()` from `src/lib/auth/get-session.ts`. Access environment variables exclusively via `@/env` (`src/env.ts`), NEVER raw `process.env`.
- **§V Feature Slices**: Colocate components, hooks, actions, types under `src/features/<feature-name>/`. Use named exports for all internal components and helpers.
- **§VI Test Coverage**: Write Vitest unit tests in `tests/unit/<feature-name>/`.

## Electa / Electa Branding & Design System

- **Default Theme is LIGHT MODE**: Base background is Opal `#F8FAFC`, foreground is `#0F172A`, accent is `#0284C7 Sky Blue`. Never default to dark-mode backgrounds.
- **Strict Zero-Radius**: Sharp 0px corners (`--radius: 0px`, `rounded-none`) across all cards, buttons, dialogs, and inputs.
- **Typography**: Outfit (`--font-heading`) for titles/headings, Sora (`--font-body`) for body text, JetBrains Mono (`--font-mono`) for code/numbers.
- **Buttons & Cards**: Use `.btn-primary` (solid flat action buttons) and `.card-style` (white card with subtle border).
- **Tailwind CSS v4**: Use `bg-linear-to-*` and native aspect fractions (`aspect-4/5`, `aspect-16/9`).

## Code Style and Structure

- Employ functional and declarative programming patterns; avoid classes.
- Organize files: exported component, subcomponents, helpers, static content, types.
- Naming: `kebab-case` for directories and utility/hook files; `PascalCase.tsx` for components.
- Always use `import type` for type-only imports.

