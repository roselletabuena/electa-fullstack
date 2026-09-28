# Implementation Plan: Frictionless Organizer Authentication & Role Management (LocalStack & Cognito)

**Branch**: `013-organizer-authentication` | **Date**: 2026-09-28 | **Spec**: [`specs/013-organizer-authentication/spec.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-organizer-authentication/spec.md)

**Input**: Feature specification from [`specs/013-organizer-authentication/spec.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-organizer-authentication/spec.md)

---

## Summary

Implement a full, production-ready yet offline-friendly **Organizer Authentication Portal** (`/login`, `/register`) using Next.js 16 Server Actions, secure HTTP session cookies, and an environment-swappable LocalStack / Local Cognito adapter. Organizers can authenticate with email/password or 1-click demo login, receive secure tokens, and automatically navigate to `/dashboard`.

---

## Technical Context

**Language/Version**: TypeScript 5 Strict Mode | Node.js 20+  
**Framework**: Next.js 16.3.2 (App Router, Turbopack, Server Actions)  
**Primary Dependencies**: `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `zustand`, `@tanstack/react-query`, `aws-amplify`  
**Storage**: Supabase / PostgreSQL via Prisma 7 client  
**Testing**: Vitest 4 (`tests/unit/auth/`)  
**Target Platform**: Modern desktop & mobile browsers (Responsive SSR/RSC)  
**Security & Constraints**: HTTP-only session cookies, Zod schema validation, sub-200ms login response, no raw `process.env`.

---

## Constitution Check

- **§I. Type Safety & Validation**: All inputs/outputs strictly validated via Zod (`loginSchema`, `registerSchema`). No `any` or non-null assertions.
- **§II. Server-First**: Forms use Server Actions with `useActionState` / React Hook Form; layouts default to React Server Components (RSC).
- **§III. State Separation**: Server session in HTTP cookie, client session cache in Zustand `auth-store`, queries in TanStack Query.
- **§IV. Secure-by-Design**: `getSession()` verifies tokens on all protected routes. Secrets accessed via `src/env.ts`.
- **§V. Vertical Slice**: All auth logic colocated in `src/features/auth/` (actions, components, hooks, types, utils).
- **§VI. Test-First**: Unit tests covering validation, token generation/verification, and login/register actions in `tests/unit/auth/`.

---

## Project Structure

```text
src/
├── app/
│   └── (auth)/
│       ├── layout.tsx              # Centered branding card layout
│       ├── login/
│       │   └── page.tsx            # Login route
│       └── register/
│           └── page.tsx            # Register route
├── features/
│   └── auth/
│       ├── actions/
│       │   ├── login-action.ts     # Server action for credentials / demo login
│       │   ├── register-action.ts  # Server action for organizer account creation
│       │   └── logout-action.ts    # Server action for session revocation
│       ├── components/
│       │   ├── LoginForm.tsx       # Interactive login form component
│       │   └── RegisterForm.tsx    # Interactive registration form component
│       ├── hooks/
│       │   └── use-auth.ts         # React hook for client session access
│       ├── stores/
│       │   └── auth-store.ts       # Zustand client auth store
│       ├── types/
│       │   └── index.ts            # UserSessionDto, LoginCredentialsDto, etc.
│       ├── utils/
│       │   ├── token-adapter.ts    # Cognito/LocalStack JWT generator & verifier
│       │   └── validation.ts       # Zod schemas for auth forms
│       └── index.ts                # Public feature barrel export
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
