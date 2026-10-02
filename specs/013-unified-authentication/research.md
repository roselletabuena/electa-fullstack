# Research & Technical Decisions: Electa Unified Authentication & Universal Event Creation

## 1. Unified Single-Account Identity Model

### Context

Previously, organizer authentication and voter authentication were treated as separate personas and distinct auth flows. In the Electa architecture, any authenticated user must be able to vote on pageants as well as create and administer their own pageant events on `/dashboard`.

### Decision

- **Universal User Session**: Every authenticated user possesses a standard `UserSession` (`userId`, `email`, `name`, `avatarUrl`, `expiresAt`).
- **No Artificial Role Gate on Event Creation**: Any authenticated user with a valid `userId` can invoke `createEventAction` and access `/dashboard`. The created event stores `organizerId: session.userId`.
- **Multi-Tenant Scoping**: The `/dashboard` queries filter strictly by `where: { organizerId: session.userId }`, allowing any user to manage their own events without interfering with others.
- **Alternatives Considered**:
  - _Explicit Role Promotion (VOTER -> ORGANIZER)_: Rejected because it adds unnecessary onboarding friction when a user simply wants to organize a pageant.
  - _Separate databases for voters and organizers_: Rejected because it fragments user data and prevents voters from using their existing credentials to organize events.

---

## 2. Authentication Provider & Token Architecture

### Context

Electa requires robust authentication that supports cloud AWS Cognito with Google Federated IdP while remaining 100% functional offline for local development and CI testing.

### Decision

- **Environment-Swappable Auth Provider**:
  - **Local / Mock Mode (`AUTH_PROVIDER=local` or default)**:
    - Generates and verifies HMAC SHA-256 JWT tokens structured identically to AWS Cognito ID tokens (`sub`, `email`, `name`, `token_use: "id"`, `iss`, `exp`).
  - **LocalStack Mode (`AUTH_PROVIDER=localstack`)**:
    - Interfaces with LocalStack Cognito container (`http://localhost:4566`).
  - **Production Mode (`AUTH_PROVIDER=cognito`)**:
    - AWS Cognito User Pools with Hosted UI and Federated Google Identity Provider.
- **Session Cookie Architecture**:
  - Cookie name: `electa_auth_session` (with backward compatibility for `vs_auth_session`).
  - Security attributes: `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, `maxAge: 7 days`.
  - Session verification: `getSession()` in `src/lib/auth/get-session.ts` validates tokens from cookies or `Authorization: Bearer <token>` headers.

---

## 3. Electa Zero-Radius Design System Compliance

### Context

Electa design standards enforce strict brutalist-refined zero-radius geometry and dual-theme WCAG 2.1 AA accessibility.

### Decision

- **Geometry**: Strict zero-radius (`rounded-none`, `--radius: 0px`) across all auth cards, buttons, inputs, alerts, and modal dialogs.
- **Typography**: Outfit (`font-heading`, `font-extrabold`) for titles and modal headers; Sora (`font-sans`) for body and form labels; JetBrains Mono (`font-mono`) for verification codes/OTP.
- **Color Palette & Contrast**:
  - Light mode (default): Opal Slate-50 `#F8FAFC` background, Slate-900 `#0F172A` text (17:1 contrast), Pure White surfaces `#FFFFFF` with hairline `#CBD5E1` border.
  - Dark mode: Scoped strictly under `dark:` classes (`dark:bg-slate-950`, `dark:bg-[#0d1424]`, `dark:border-slate-800`).
  - WCAG 2.1 AA verified: All body text >= 4.5:1, UI components and large text >= 3:1.
