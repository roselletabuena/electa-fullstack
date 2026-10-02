# Implementation Plan: Electa Unified Authentication & Universal Event Creation (LocalStack & Cognito)

**Branch**: `013-unified-authentication` | **Date**: 2026-10-02 | **Spec**: [`specs/013-unified-authentication/spec.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-unified-authentication/spec.md)

**Input**: Feature specification from [`specs/013-unified-authentication/spec.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-unified-authentication/spec.md) (Jira [VS-52](https://the-three-devsketeers.atlassian.net/browse/VS-52) / Epic [VS-55](https://the-three-devsketeers.atlassian.net/browse/VS-55))

---

## Summary

Implement a unified, multi-channel authentication and identity architecture for **Electa** (`/login`, `/register`, `OmnichannelAuthModal`) using Next.js 16 Server Actions, secure HTTP session cookies (`electa_auth_session`), and an environment-swappable LocalStack / Local Cognito adapter. Every authenticated user holds a single universal identity granting full rights to vote across live pageants and to create and manage their own pageant events on `/dashboard`. All authentication interfaces strictly adhere to Electa's zero-radius brutalist design tokens (`rounded-none`, `--radius: 0px`) and WCAG 2.1 AA dual-theme color contrast.

---

## Technical Context

**Language/Version**: TypeScript 5 Strict Mode | Node.js 20+  
**Framework**: Next.js 16.3.2 (App Router, Turbopack, React Server Components, Server Actions)  
**Primary Dependencies**: `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `zustand`, `@tanstack/react-query`, `aws-amplify`  
**Storage**: Supabase / PostgreSQL via Prisma 7 client  
**Testing**: Vitest 4 (`tests/unit/auth/`)  
**Target Platform**: Modern desktop & mobile browsers (Responsive SSR/RSC)  
**Design System**: Electa Zero-Radius (`rounded-none`, `--radius: 0px`), Outfit headings, Sora sans-serif body, JetBrains Mono data, Opal Slate-50 default background (`#F8FAFC`).  
**Security & Constraints**: HTTP-only session cookies (`electa_auth_session`), strict Zod schema validation on all boundaries, sub-200ms login response, no raw `process.env`.

---

## Constitution Check

- **§I. Strict Type Safety & Validation**: All inputs/outputs strictly validated via Zod (`loginSchema`, `registerSchema`, `createEventSchema`). No `any`, `as any`, or non-null assertions (`!`).
- **§II. Server-First & Boundary Isolation**: Layouts default to React Server Components (RSC); dynamic client components wrapped in `<Suspense>`; forms use Server Actions; asynchronous Next.js request APIs (`cookies()`, `headers()`, `params`) strictly awaited.
- **§III. State Separation & Single Source of Truth**: Database managed via Prisma client (`src/lib/db.ts`); server session in HTTP-only cookie; client session state in Zustand `auth-store`; server data in TanStack Query.
- **§IV. Secure-by-Design & Auth Integrity**: `getSession()` in `src/lib/auth/get-session.ts` verifies tokens on all protected routes and actions. Environment secrets accessed strictly via `@/env` (`src/env.ts`).
- **§V. Vertical Slice Architecture**: Auth logic colocated in `src/features/auth/` (actions, components, hooks, stores, types, utils) with named exports.
- **§VI. Test-First Quality Gates**: Automated unit tests for validation schemas, token generation/verification, and login/register actions in `tests/unit/auth/`. Pass `npm run typecheck`, `npm run lint`, and `npm run test:unit`.

---

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Centered branding card layout with Electa zero-radius styling
│   │   ├── login/
│   │   │   └── page.tsx            # Electa unified sign-in route
│   │   └── register/
│   │       └── page.tsx            # Electa unified registration route
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx            # Multi-tenant dashboard querying events where organizerId == session.userId
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   │   ├── login-action.ts     # Server action for credentials / 1-click demo login
│   │   │   ├── register-action.ts  # Server action for universal user account creation
│   │   │   ├── logout-action.ts    # Server action for session revocation
│   │   │   └── passwordless-actions.ts # Server actions for email magic link / OTP
│   │   ├── components/
│   │   │   ├── LoginForm.tsx       # Interactive Electa login form (zero-radius, dual-theme)
│   │   │   ├── RegisterForm.tsx    # Interactive Electa registration form
│   │   │   ├── GoogleSignInButton.tsx # Federated Google OAuth button
│   │   │   └── OmnichannelAuthModal.tsx # Inline auth modal for voting & quick sign-in
│   │   ├── hooks/
│   │   │   └── use-auth.ts         # React hook for client session state
│   │   ├── stores/
│   │   │   └── auth-store.ts       # Zustand client auth store
│   │   ├── types/
│   │   │   └── index.ts            # UserSessionDto, LoginCredentialsDto, RegisterUserDto
│   │   ├── utils/
│   │   │   ├── token-adapter.ts    # Cognito/LocalStack JWT generator & verifier
│   │   │   ├── validation.ts       # Zod schemas for auth forms
│   │   │   └── oauth-client.ts     # Cognito Hosted UI & Google OAuth URL helpers
│   │   └── index.ts                # Public feature barrel export
│   └── events/
│       ├── actions/
│       │   └── create-event.ts     # Server action for event creation
│       └── services/
│           └── create-event.ts     # Atomic event creation service (binds organizerId: session.userId)
└── lib/
    └── auth/
        └── get-session.ts          # Central session verification utility

tests/
└── unit/
    └── auth/
        ├── auth-validation.test.ts # Zod schema tests
        ├── token-adapter.test.ts   # JWT token creation & verification tests
        └── login-action.test.ts    # Server action tests
```
