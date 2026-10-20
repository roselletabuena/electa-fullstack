# Electa — Agent Conventions

## Workspace Context & Repository Boundaries

> [!IMPORTANT]
> **Electa is a Single-Service Monorepo containing both the web application and cloud infrastructure-as-code:**
>
> 1. **`src/` & `prisma/`** (Application Layer): Next.js 16 App Router web application, Prisma ORM (Supabase PostgreSQL), UI design system, feature slices, client-side AWS Amplify & AWS SDK integrations.
> 2. **`infra/`** (Cloud Infrastructure Layer): AWS Infrastructure as Code (IaC) powered by modular Terraform (AWS S3 storage buckets, Cognito User Pools, RDS PostgreSQL, IAM policies, and CORS configuration).
> 3. **`.agents/`** (Autonomous Agent & Tooling Layer): Skills, rules, workflows, and hook scripts enabling autonomous development and quality gates.
> 4. **`.github/workflows/`** (Path-Filtered CI): Independent workflows (`app-ci.yml` and `infra-ci.yml`) isolating validation gates by touched paths.
>
> **Rules of Engagement & Domain Boundaries:**
>
> - **Strict Cloud Provisioning Boundary**: All AWS infrastructure and Terraform configurations belong strictly inside `infra/`. Never write `.tf` files or provision cloud resources inside `src/` or at the repository root.
> - **Configuration Handoff**: Cloud resource identifiers (S3 bucket names, regions, Cognito User Pool IDs, Client IDs, RDS connection parameters) are exported from `infra/environments/<env>/outputs.tf` (`terraform output env_snippet`) and consumed by the web application as environment variables validated through `src/env.ts`.
> - **Single Git Repository & Path-Filtered CI**: Electa is a single unified git repository. CI workflows are strictly path-filtered: changes touching `src/**`, `public/**`, `prisma/**`, or `tests/**` trigger `app-ci.yml`, while changes touching `infra/**` trigger `infra-ci.yml`. Never cross domain boundaries unnecessarily.

---

## Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Framework      | Next.js 16 (App Router)              |
| Language       | TypeScript 5 (strict mode)           |
| Styling        | Tailwind CSS 4                       |
| UI Components  | Shadcn UI + Radix UI                 |
| Client State   | Zustand                              |
| Server State   | TanStack Query (React Query)         |
| Forms          | React Hook Form + Zod                |
| URL State      | nuqs                                 |
| Animation      | Framer Motion                        |
| Icons          | Lucide React                         |
| Database       | PostgreSQL via Supabase (Prisma ORM) |
| Auth           | AWS Cognito (AWS Amplify v6)         |
| Cloud IaC      | Terraform (AWS S3, Cognito, RDS)     |
| Env Validation | @t3-oss/env-nextjs                   |
| Testing        | Vitest (unit)                        |

---

## Folder Structure

```text
electa/
├── .agents/                          # Agent skills, rules, workflows, and hook scripts
│   ├── hooks.json                    # PostToolUse lint and env-validator automated hooks
│   ├── rules/                        # Behavioral rules (accessibility, branding, constitution)
│   ├── scripts/                      # Automated hook runner scripts
│   ├── skills/                       # 40+ specialized agent skills (db-migrate, pr-creator, etc.)
│   └── workflows/                    # Orchestrated slash workflows (/graphify, /speckit)
│
├── .github/
│   └── workflows/
│       ├── app-ci.yml                # Next.js typecheck, lint, and Vitest unit tests (path-filtered)
│       └── infra-ci.yml              # Terraform format & validate matrix (path-filtered)
│
├── infra/                            # AWS Terraform Infrastructure as Code (IaC)
│   ├── bootstrap/                    # S3 remote state bucket & DynamoDB lock table
│   ├── modules/                      # Reusable modules (cognito, storage/s3, database)
│   └── environments/                 # Isolated deployment tiers (dev, prod)
│
├── prisma/                           # Prisma schema and migrations (Supabase PostgreSQL)
│   ├── schema.prisma                 # Database schema — single source of truth
│   └── migrations/                   # Auto-generated migration files (do not edit)
│
├── public/                           # Static public assets (images, fonts, icons)
│
├── src/                              # Next.js 16 App Router application
│   ├── app/                          # Next.js App Router — pages and layouts ONLY
│   │   ├── (auth)/                   # Route group: unauthenticated pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Route group: authenticated pages
│   │   │   └── page.tsx
│   │   ├── api/                      # Route Handlers (internal REST API)
│   │   │   ├── polls/
│   │   │   │   └── route.ts
│   │   │   └── votes/
│   │   │       └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles and CSS custom properties
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn UI primitives (auto-generated, do not edit)
│   │   └── shared/                   # Reusable cross-feature components
│   │
│   ├── features/                     # Feature slices — colocate everything per feature
│   │   ├── polls/
│   │   │   ├── components/           # Poll-specific React components
│   │   │   ├── hooks/                # Poll-specific custom hooks (use-*)
│   │   │   └── types/                # Poll-specific TypeScript interfaces
│   │   ├── voting/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   └── auth/
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── hooks/                        # Shared custom hooks used across features
│   │
│   ├── lib/                          # Utility modules and third-party client setup
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client (createBrowserClient)
│   │   │   └── server.ts             # Server Supabase client (createServerClient)
│   │   ├── auth/
│   │   │   ├── amplify-config.ts     # Amplify.configure() call — run once in layout
│   │   │   └── get-session.ts        # Server-side Cognito session helper
│   │   ├── query/
│   │   │   └── query-provider.tsx    # TanStack Query provider wrapper
│   │   ├── api/
│   │   │   └── response.ts           # ApiResponse<T>, apiSuccess(), apiError() helpers
│   │   ├── validations/              # Shared Zod schemas
│   │   └── db.ts                     # Prisma singleton client
│   │
│   ├── stores/                       # Zustand stores (client global state ONLY)
│   │   └── auth-store.ts             # Authenticated user — populated after Cognito sign-in
│   │
│   ├── types/                        # Global TypeScript interfaces shared across features
│   │   └── index.ts
│   │
│   ├── styles/                       # Additional CSS files if needed
│   │
│   └── env.ts                        # @t3-oss/env-nextjs schema — ALL env vars defined here
│
├── tests/
│   ├── unit/                         # Vitest unit tests
│   └── e2e/                          # Playwright end-to-end tests (future)
│
├── .env.example                      # Env var template — copy to .env.local
├── .env.local                        # Local secrets — NEVER commit this file
├── .prettierrc                       # Prettier config
├── eslint.config.mjs                 # ESLint flat config
├── tsconfig.json                     # TypeScript config (strict mode)
└── vitest.config.ts                  # Vitest config
```

---

## Agent Customizations & Skill Discovery (`.agents/`)

Autonomous coding agents operating in this repository leverage the customization ecosystem under `.agents/`:

### 1. Skills (`.agents/skills/`)

Specialized on-demand workflows, tools, and quality gates:

- **Quality & Workflow**: `atomic-commit`, `pr-creator`, `constitution-check`, `code-review-and-quality`, `tdd`, `branch-cleanup`, `spec-aware-bugfix`
- **SpecKit Lifecycle**: `speckit-workflow`, `speckit-specify`, `speckit-clarify`, `speckit-checklist`, `speckit-plan`, `speckit-tasks`, `speckit-implement`, `speckit-converge`
- **Frontend & Design System**: `accessibility-colors`, `accessibility`, `anti-ui-slop`, `frontend-design`, `frontend-ui-engineering`, `vercel-react-best-practices`
- **Backend & Database**: `db-migrate`, `supabase`, `supabase-postgres-best-practices`, `env-validator`
- **Architecture & Knowledge**: `graphify`, `graphify-auto-sync`

### 2. Behavioral Rules (`.agents/rules/`)

Precedence rules enforced on every interaction:

- `constitution.md`: The 6 core principles (§I–§VI)
- `branding-and-design-system.md`: Opal light mode default, strict zero-radius geometry, Outfit/Sora/JetBrains Mono typography
- `accessibility-colors.md`: WCAG 2.1 AA dual-theme color contrast requirements and scrim overlays
- `atomic-commit.md`: Conventional Commits and bisectable single-purpose commits
- `tailwind-v4.md`: Tailwind CSS v4 syntax (`bg-linear-to-*`, fraction aspect ratios)

### 3. Workflows (`.agents/workflows/`)

Multi-step slash command orchestrations:

- `/speckit`: End-to-end spec-driven development in an isolated worktree with quality gates and automated PR creation
- `/graphify`: Codebase knowledge graph extraction and navigation
- `/bugfix`: Spec-aware bug triage and resolution (code bug vs spec drift)

### 4. Automated Hooks (`.agents/hooks.json` & `.agents/scripts/`)

- `autofix-lint`: Runs `node .agents/scripts/autofix-lint.mjs` post-tool write on modified files.
- `env-validator`: Runs `node .agents/scripts/check-env-usage.mjs` post-tool write to prevent raw `process.env` bypasses (Constitution §IV).
- `contrast-guard`: Runs `node .agents/scripts/check-accessibility-contrast.mjs` post-tool write to prevent low-contrast grays and naked dark-mode text classes (WCAG 2.1 AA).
- `constitution-guard`: Runs `node .agents/scripts/check-constitution.mjs` post-tool write to flag un-awaited Next.js 16 request APIs (`cookies()`, `headers()`, `params`), forbidden `any`, and non-null assertions (Constitution §I, §II).

### 5. Architecture Decision Records (`docs/adr/`)

Electa documents all architectural pivots, design system constraints, and infrastructure boundaries using Markdown Architecture Decision Records (MADRs) indexed into Graphify:

- `docs/adr/ADR-001`: Automated Jira Ticket Synchronization & Changelog in Spec-Kit Implement
- `docs/adr/ADR-002`: Strict Zero-Radius Brutalist-Refined Geometry & Design System
- `docs/adr/ADR-003`: Default Opal Slate-50 Light Mode with Strict Dual-Theme Parity
- `docs/adr/ADR-004`: AWS Amplify v6 Client-Side Boundary Isolation & Cognito JWT Verification
- `docs/adr/template.md`: Reusable MADR authoring template

---

## Coding Conventions

### General Rules

- **Read `node_modules/next/dist/docs/` before writing any Next.js code.** APIs differ from older versions.
- **No `any`.** Use `unknown` and narrow the type, or define a proper interface.
- **No non-null assertions (`!`).** Handle the `null`/`undefined` case explicitly.
- **Prefer `interface` over `type`** for object shapes.
- **Always use `import type`** for type-only imports: `import type { Foo } from "..."`.
- **Named exports only.** No default exports except for Next.js `page.tsx` and `layout.tsx` files.
- **No `console.log`.** Use `console.warn` or `console.error` for real issues.

### File & Folder Naming

- Directories: `kebab-case` (e.g., `auth-wizard/`)
- Component files: `PascalCase.tsx` (e.g., `PollCard.tsx`)
- Hook files: `use-kebab-case.ts` (e.g., `use-poll-results.ts`)
- Utility files: `kebab-case.ts` (e.g., `format-date.ts`)
- Store files: `kebab-case-store.ts` (e.g., `auth-store.ts`)

### Import Order

Enforced by `eslint-plugin-import`. Always in this order, separated by blank lines:

```ts
// 1. Node built-ins
import fs from "fs";

// 2. External packages
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// 3. Internal — absolute imports via @/
import { env } from "@/env";
import { db } from "@/lib/db";

// 4. Relative imports
import { PollCard } from "./poll-card";

// 5. Type imports
import type { Poll } from "@/types";
```

### Design System & Branding

- **Default to LIGHT MODE**: Base background is Opal Slate-50 `#F8FAFC` (`--background`), text is Slate-900 `#0F172A` (`--foreground`), accent is Sky Blue `#0284C7` (`--accent`).
- **NEVER default to dark mode**: Dark backgrounds and text must ALWAYS be scoped behind `dark:` variant classes (e.g. `dark:bg-slate-900 dark:text-slate-100`).
- **Strict Zero-Radius**: Sharp 0px corners (`--radius: 0px`, `rounded-none`) across all cards, buttons, dialogs, badges, and inputs.
- **Brand Typography**: Outfit (`font-heading`, `heading-font`) for headings/titles, Sora (`font-body`, `font-sans`) for body/UI text, JetBrains Mono (`font-mono`) for code and numbers.
- **Component Classes**: Use `.btn-primary` (solid flat action button, uppercase, 800 weight, sharp 0px radius) and `.card-style` (white surface with hairline border `#CBD5E1`).
- **Tailwind CSS v4**: Use `bg-linear-to-*` and native aspect ratio utilities (`aspect-4/5`, `aspect-16/9`).

### React & Next.js

- **Default to Server Components.** Only add `"use client"` when you need browser APIs, event handlers, or React hooks.
- **Wrap client components in `<Suspense>`** with a meaningful fallback.
- **Use `next/image`** for all images — never `<img>`.
- **Use `next/link`** for all internal navigation — never `<a href>`.
- **Route Handlers** go in `src/app/api/`. Always return typed `ApiResponse<T>` using the helpers in `src/lib/api/response.ts`.

### State Management

| Data type                           | Where it lives              |
| ----------------------------------- | --------------------------- |
| Server data (polls, votes, users)   | TanStack Query              |
| Authenticated user info             | Zustand `auth-store`        |
| URL filter/pagination state         | nuqs                        |
| Local UI state (open/closed, hover) | `useState` inside component |

**Do not** put server data in Zustand. **Do not** put client UI state in TanStack Query.

### Forms

Always use **React Hook Form + Zod** together:

```ts
// Define schema in src/lib/validations/ or inside the feature's types/ folder
const schema = z.object({ title: z.string().min(3) });

// Resolver bridges Zod → React Hook Form
const form = useForm({ resolver: zodResolver(schema) });
```

### Environment Variables

- **All env vars must be defined in `src/env.ts`** before use.
- Never access `process.env.XYZ` directly — always use the `env` object from `src/env.ts`.
- Server-only vars: no `NEXT_PUBLIC_` prefix, accessed only in server files.
- Public vars: must have `NEXT_PUBLIC_` prefix.
- Document every new var in `.env.example` with a comment explaining where to find it.

### Database

- Use the **Prisma singleton** from `src/lib/db.ts` — never instantiate `PrismaClient` directly.
- All schema changes go through **Prisma migrations** (`npx prisma migrate dev`).
- Never write raw SQL unless Prisma cannot express the query.

### Authentication

- Use `getSession()` from `src/lib/auth/get-session.ts` in Route Handlers and Server Components to verify the Cognito JWT.
- Client-side: use `aws-amplify` Auth APIs. Store the user in the Zustand `auth-store` after sign-in.
- **Protect routes** via `src/middleware.ts` — do not rely solely on client-side guards.

### AWS Cloud Infrastructure Integration (`infra/`)

- **Storage / S3**: Media storage buckets and CORS policies are provisioned via Terraform in `infra/modules/storage/`. Application-level presigned URL generation, upload handoffs, and S3 client calls live in `src/` using `@aws-sdk/client-s3`.
- **Auth / Cognito**: Cognito User Pools, Clients, and OAuth Identity Providers are provisioned in `infra/modules/cognito/`. Web client configuration and session management live in `src/lib/auth/`.
- **Database / RDS**: Postgres instances are provisioned in `infra/modules/database/`. Database schemas and migrations are managed in `prisma/schema.prisma`.
- **Environment Handoff**: Cloud outputs from `infra/` are documented in `infra/environments/<env>/outputs.tf`. Run `terraform output env_snippet` in `infra/environments/dev` to populate your local `.env.local`.

### Data Contracts & Schema Tooling

- **Prisma Schema Markdown Summary (`docs/schema-summary.md`)**: Compact (< 500 tokens) data model overview and Mermaid ER diagram, generated via `npm run schema:summary` or post-migration hook.
- **Machine-Readable Route Contracts (`docs/api-contracts.json`)**: Exported JSON schemas for all Next.js App Router route handlers, generated via `npm run contracts:export`.
- **Runtime Route Contract Inspector (`GET /api/contracts`)**: Real-time contract endpoint allowing agents and client features to inspect query and request schemas and validate payloads using `validateRoutePayload`.

### Code Quality Gates

- **Unified Agent Verification (`npm run agent:verify`)**: Single-command runner executing quality gates sequentially:
  1. Environment check (`node .agents/scripts/check-env-usage.mjs --scan` — §IV)
  2. Prisma schema summary & token limit check (`node scripts/generate-schema-summary.mjs --check` — Pillar 3)
  3. TypeScript strict typecheck (`tsc --noEmit` — §I)
  4. ESLint static analysis (`eslint src` — §I, §V)
  5. Vitest test suites (`vitest run` — §VI)
- **Targeted Incremental Testing (`npm run test:changed`)**: Executes Vitest only for tests covering the touched source files (`vitest related --run`), providing sub-3-second feedback.
- **Fast Quality Gate (`npm run agent:verify:fast`)**: Executes gates 1–4 plus incremental changed tests for rapid agent iteration.
- **Pre-Commit Hook**: Before every commit, `lint-staged` automatically runs:
  - `eslint --fix` on staged `.ts` / `.tsx` files
  - `prettier --write` on all staged files

**The commit will be blocked if lint errors remain after auto-fix.** Fix them before committing.

---

## Adding a New Feature

1. Create a folder under `src/features/<feature-name>/` with `components/`, `hooks/`, `types/`.
2. Add Prisma models to `prisma/schema.prisma` and run `npx prisma migrate dev`.
3. Add Route Handlers under `src/app/api/<resource>/route.ts`.
4. Add Zod validation schemas in `src/lib/validations/` or `src/features/<feature>/types/`.
5. Add env vars (if needed) to `src/env.ts` and `.env.example`.
6. Write unit tests in `tests/unit/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
