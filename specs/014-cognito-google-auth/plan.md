# Implementation Plan: AWS Cognito Federated Google Identity Provider Integration

**Branch**: `014-cognito-google-auth` | **Date**: 2026-09-28 | **Spec**: [specs/014-cognito-google-auth/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/014-cognito-google-auth/spec.md)

**Input**: Feature specification from `/specs/014-cognito-google-auth/spec.md`

## Summary

Implement AWS Cognito Federated Google Identity Provider integration for 1-click organizer sign-in and registration, unified session management via `electa_auth_session` HTTP-only cookies, seamless account linking by verified email, and comprehensive Infrastructure as Code (Terraform) in `infra/` to provision all required AWS Cognito resources.

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode), Node.js 20+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Zod 3.25, Tailwind CSS 4, Radix UI Primitives, Lucide Icons
**Storage**: PostgreSQL via Prisma ORM (`prisma/schema.prisma`)
**Testing**: Vitest (`tests/unit/`)
**Target Platform**: Next.js on Node.js / Vercel + AWS Cognito (`ap-southeast-1`)
**Project Type**: Full-stack Web Application (Next.js App Router) + Terraform IaC (`infra/`)
**Performance Goals**: <5s end-to-end federated login, <50ms token validation & session generation
**Constraints**: Zero sensitive tokens exposed to client-side scripts, strict Zod validation at all boundaries, standard `electa_auth_session` HTTP-only cookie
**Scale/Scope**: Unified authentication for all organizer accounts across password and social Google logins

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                 | Check                                                                       | Status   | Notes                                                                      |
| :---------------------------------------- | :-------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------- |
| **I. Strict Type Safety & Validation**    | All OAuth query parameters & payloads validated via Zod                     | **PASS** | `cognitoCallbackSchema` & `oauthStateSchema` in `src/features/auth/types/` |
| **II. Server-First & Boundary Isolation** | OAuth callback handled in Route Handler, UI interactions in RSC/Actions     | **PASS** | `/api/auth/callback/cognito` route handler + `completeOnboardingAction`    |
| **III. Strict State Separation**          | Authenticated session in `electa_auth_session` & Zustand `auth-store`       | **PASS** | Centralized session state                                                  |
| **IV. Secure-by-Design & Auth Integrity** | `getSession()` verified via `src/lib/auth/get-session.ts`, HTTP-only cookie | **PASS** | Defense-in-depth, zero raw `process.env` bypass                            |
| **V. Feature Colocation**                 | Colocated in `src/features/auth/` and `infra/`                              | **PASS** | Vertical slice modular structure                                           |
| **VI. Test-First Quality Gates**          | Vitest unit tests in `tests/unit/features/auth/`                            | **PASS** | Unit tests for callback validation, token exchange, and account linking    |

## Project Structure

### Documentation (this feature)

```text
specs/014-cognito-google-auth/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: AWS Cognito Google IdP & Terraform strategy
├── data-model.md        # Phase 1 output: Session schemas, identity mapping & lifecycle
├── quickstart.md        # Phase 1 output: Local and Terraform verification guide
├── contracts/           # Phase 1 output: API contracts & Terraform resource specs
│   ├── oauth-callback.md
│   └── terraform-spec.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code & Infrastructure Layout

```text
# Root Workspace Layout:
infra/                                  # Terraform Infrastructure as Code
├── main.tf                             # AWS Provider & general setup
├── variables.tf                        # Region, Google OAuth Credentials, Callback URLs
├── cognito.tf                          # Cognito User Pool, Google IdP, Domain, App Client
├── outputs.tf                          # Pool ID, Client ID, Cognito Domain, Issuer URL
└── terraform.tfvars.example

vote-sphere/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login page with "Continue with Google"
│   │   │   ├── register/page.tsx       # Register page with "Continue with Google"
│   │   │   └── onboarding/page.tsx     # Optional organization onboarding setup
│   │   └── api/
│   │       └── auth/
│   │           ├── google/route.ts     # Initiates Google OAuth redirect with CSRF state
│   │           └── callback/
│   │               └── cognito/route.ts # Exchanges code, links user, sets session cookie
│   └── features/
│       └── auth/
│           ├── actions/
│           │   ├── login-action.ts
│           │   ├── register-action.ts
│           │   └── onboarding-action.ts # Handles organization setup / skip
│           ├── components/
│           │   ├── GoogleSignInButton.tsx # Reusable Google OAuth button
│           │   ├── LoginForm.tsx        # Updated with Google button & error banner
│           │   ├── RegisterForm.tsx     # Updated with Google button & error banner
│           │   └── OnboardingForm.tsx   # Optional org setup form
│           ├── types/
│           │   └── index.ts            # Auth, OAuth, and session DTO schemas
│           └── utils/
│               ├── token-adapter.ts    # Token generation & verification
│               └── oauth-client.ts     # Cognito OAuth URL generator & code exchange
└── tests/
    └── unit/
        └── features/
            └── auth/
                ├── cognito-callback.test.ts # Callback & token exchange unit tests
                └── account-linking.test.ts  # Account linking & collision unit tests
```

**Structure Decision**: Colocate all application code in `src/features/auth/` and route handlers in `src/app/api/auth/`, while housing all AWS cloud infrastructure in `infra/` at the workspace root as requested by the user.

## Complexity Tracking

> No constitutional violations or unwarranted complexity. All gates pass.
