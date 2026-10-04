# Electa — Agent Conventions

## Workspace Context & Repository Boundaries

> [!IMPORTANT]
> **Electa is structured as two independent sibling repositories within the parent workspace (`electa-workspace/`):**
> 1. **`electa-fullstack/`** (this repository): Next.js 16 App Router web application, Prisma ORM, UI components, feature slices, client-side AWS Amplify & AWS SDK integrations.
> 2. **`electa-infra/`** (`../electa-infra/` outside this directory): AWS Infrastructure as Code (IaC) powered by Terraform (AWS S3 storage buckets, Cognito User Pools, RDS PostgreSQL, IAM policies, and CORS configuration).
>
> **Rules of Engagement:**
> - **No Cloud Provisioning in Fullstack**: Never write Terraform files or provision cloud resources inside `electa-fullstack/`. All AWS infrastructure belongs in `../electa-infra/`.
> - **Configuration Handoff**: Cloud resource identifiers (S3 bucket names, regions, Cognito User Pool IDs, Client IDs) are defined in `electa-infra`, exported via `environments/<env>/outputs.tf`, and consumed here as environment variables validated through `src/env.ts`.
> - **Independent Git Repositories**: `electa-fullstack` and `electa-infra` are distinct git repositories with separate remotes and commit histories. Never execute git commands or commits across both repositories simultaneously.

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
| Env Validation | @t3-oss/env-nextjs                   |
| Testing        | Vitest (unit)                        |

---

## Folder Structure

```text
electa-workspace/
├── electa-infra/                      # SIBLING REPO (outside fullstack): AWS Terraform IaC
│   ├── bootstrap/                     # S3 remote state & DynamoDB lock table
│   ├── modules/                       # Reusable modules (cognito, storage/s3, database/rds)
│   └── environments/                  # dev / prod environments and outputs
│
└── electa-fullstack/                  # THIS REPOSITORY: Next.js 16 Web App
    ├── prisma/                        # Prisma schema and migrations
    │   ├── schema.prisma              # Database schema — single source of truth
    │   └── migrations/                # Auto-generated migration files (do not edit)
│
├── public/                        # Static assets (images, fonts, icons)
│
├── src/
│   ├── app/                       # Next.js App Router — pages and layouts ONLY
│   │   ├── (auth)/                # Route group: unauthenticated pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/           # Route group: authenticated pages
│   │   │   └── page.tsx
│   │   ├── api/                   # Route Handlers (internal REST API)
│   │   │   ├── polls/
│   │   │   │   └── route.ts
│   │   │   └── votes/
│   │   │       └── route.ts
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles and CSS custom properties
│   │
│   ├── components/
│   │   ├── ui/                    # Shadcn UI primitives (auto-generated, do not edit)
│   │   └── shared/                # Reusable cross-feature components
│   │
│   ├── features/                  # Feature slices — colocate everything per feature
│   │   ├── polls/
│   │   │   ├── components/        # Poll-specific React components
│   │   │   ├── hooks/             # Poll-specific custom hooks (use-*)
│   │   │   └── types/             # Poll-specific TypeScript interfaces
│   │   ├── voting/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   └── auth/
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── hooks/                     # Shared custom hooks used across features
│   │
│   ├── lib/                       # Utility modules and third-party client setup
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client (createBrowserClient)
│   │   │   └── server.ts          # Server Supabase client (createServerClient)
│   │   ├── auth/
│   │   │   ├── amplify-config.ts  # Amplify.configure() call — run once in layout
│   │   │   └── get-session.ts     # Server-side Cognito session helper
│   │   ├── query/
│   │   │   └── query-provider.tsx # TanStack Query provider wrapper
│   │   ├── api/
│   │   │   └── response.ts        # ApiResponse<T>, apiSuccess(), apiError() helpers
│   │   ├── validations/           # Shared Zod schemas
│   │   └── db.ts                  # Prisma singleton client
│   │
│   ├── stores/                    # Zustand stores (client global state ONLY)
│   │   └── auth-store.ts          # Authenticated user — populated after Cognito sign-in
│   │
│   ├── types/                     # Global TypeScript interfaces shared across features
│   │   └── index.ts
│   │
│   ├── styles/                    # Additional CSS files if needed
│   │
│   └── env.ts                     # @t3-oss/env-nextjs schema — ALL env vars defined here
│
├── tests/
│   ├── unit/                      # Vitest unit tests
│   └── e2e/                       # Playwright end-to-end tests (future)
│
├── .env.example                   # Env var template — copy to .env.local
├── .env.local                     # Local secrets — NEVER commit this file
├── .prettierrc                    # Prettier config
├── eslint.config.mjs              # ESLint flat config
├── tsconfig.json                  # TypeScript config (strict mode)
└── vitest.config.ts               # Vitest config
```

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

### AWS Cloud Infrastructure Integration (`electa-infra`)

- **Storage / S3**: Media storage buckets and CORS policies are provisioned via Terraform in `../electa-infra/modules/storage/`. Application-level presigned URL generation, upload handoffs, and S3 client calls live here in `electa-fullstack/` using `@aws-sdk/client-s3`.
- **Auth / Cognito**: Cognito User Pools, Clients, and OAuth Identity Providers are provisioned in `../electa-infra/modules/cognito/`. Web client configuration and session management live here in `src/lib/auth/`.
- **Database / RDS**: Postgres instances are provisioned in `../electa-infra/modules/database/`. Database schemas and migrations are managed here in `prisma/schema.prisma`.
- **Environment Handoff**: Cloud outputs from `electa-infra` are documented in `environments/<env>/outputs.tf`. Run `terraform output env_snippet` in `../electa-infra/environments/dev` to populate your local `electa-fullstack/.env.local`.

### Code Quality Gates

Before every commit, `lint-staged` will automatically run:

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
