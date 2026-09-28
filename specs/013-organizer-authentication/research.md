# Research & Technical Decisions: Frictionless Organizer Authentication (LocalStack & Cognito)

## 1. Local Authentication & LocalStack Integration Strategy

### Context

VoteSphere's constitution mandates AWS Cognito User Pools as the production identity provider. However, during local development and testing, live AWS cloud credentials may not be provisioned or connectivity may be offline.

### Decision

Implement an **Environment-Swappable Auth Provider Adapter**:

- **Local / Development Mode (`AUTH_PROVIDER=local` or default)**:
  - Generates and verifies HMAC SHA-256 JWT tokens structured identically to AWS Cognito ID tokens (`sub`, `email`, `cognito:groups: ["ORGANIZER"]`, `token_use: "id"`, `iss`, `exp`).
  - Persists organizer accounts in the local PostgreSQL database via Prisma `User` / `OrganizerProfile`.
- **LocalStack Mode (`AUTH_PROVIDER=localstack`)**:
  - Connects to a local LocalStack container (`http://localhost:4566`) using AWS SDK / Cognito Identity Provider API when available.
- **Production Mode (`AUTH_PROVIDER=cognito`)**:
  - Uses standard AWS Cognito User Pools endpoint (`ap-southeast-1`).

---

## 2. Session Management & Cookie Architecture

### Context

Next.js 16 App Router requires secure server-side session handling compatible with Server Components (RSC), Server Actions, and Route Handlers.

### Decision

- **Cookie Name**: `electa_auth_session` (with fallback reading for legacy `vs_auth_session`).
- **Cookie Attributes**:
  - `httpOnly: true` (prevents XSS access)
  - `secure: process.env.NODE_ENV === "production"`
  - `sameSite: "lax"`
  - `path: "/"`
  - `maxAge: 60 * 60 * 24 * 7` (7 days rolling session)
- **Session Verification**: Handled in `src/lib/auth/get-session.ts` by reading request cookies or `Authorization: Bearer <token>` headers.

---

## 3. UI/UX Design System for Auth Screens

### Context

In accordance with VoteSphere aesthetic guidelines, the login and registration portals must look sleek, premium, and frictionless.

### Decision

- **Visual Style**: Deep slate/indigo mesh background with subtle glassmorphic container (`backdrop-blur-md border-indigo-100/20`).
- **Micro-Interactions**: Smooth hover transitions, active button states, inline loading spinners on form submission.
- **Developer & Demo Ergonomics**: Prominent **"Quick Login as Demo Organizer"** button below the standard form to allow 1-click access during development and stakeholder walkthroughs.
