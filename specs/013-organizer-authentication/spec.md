# Feature Specification: Frictionless Organizer Authentication & Role Management (LocalStack & Cognito)

**Feature Branch**: `013-organizer-authentication`

**Created**: 2026-09-28

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-50 - Frictionless Organizer Authentication & Role Management Portal. Use LocalStack for local development."

---

## Clarifications

### Session 2026-09-28

- **Q: How would you like the local authentication / LocalStack mechanism to behave during development?**
  - **A:** Environment-swappable local auth adapter: Emulates Cognito JWT tokens locally out-of-the-box, with seamless support for a running LocalStack Docker container if present.
- **Q: What authentication options should be available on the Organizer /login and /register screens?**
  - **A:** Email & Password form + 1-Click "Quick Login as Demo Organizer" button (ideal for rapid local testing and development).
- **Q: What should a newly registered organizer see when they first land on the /dashboard?**
  - **A:** Empty dashboard with a high-visibility "Create Event" CTA and quick-link to explore seeded sample events.

---

## Background & Objectives

VoteSphere serves two distinct user personas: **Pageant Voters** (public event viewers voting inline via quick modals) and **Event Organizers** (administrators managing pageants, contestants, categories, and viewing revenue in `/dashboard`).

Currently, the organizer dashboard guards rely on mock tokens. This feature implements the full, frictionless **Organizer Authentication & Role Management Portal**, enabling organizers to sign up, sign in, manage sessions securely, and auto-route to `/dashboard`. Because active AWS Cognito cloud resources are not yet connected in the development environment, the system incorporates **LocalStack / Local Cognito Mock Provider** for seamless offline and local end-to-end development without external cloud blockers.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Organizer Login & Registration Experience (Priority: P1)

As an **Event Organizer**,  
I want to log into the VoteSphere Organizer Portal via a clean `/login` screen (supporting Email/Password and 1-Click Social/Local Auth),  
So that I can access my organizer dashboard and manage my voting events.

**Why this priority**: Without real session authentication, organizers cannot securely manage events, verify ownership, or protect sensitive financial and voting data.

**Independent Test**: Can be tested by navigating to `/login`, entering organizer credentials, submitting, and confirming redirection to `/dashboard` with an active session cookie.

**Acceptance Scenarios**:

1. **Given** I am an unauthenticated organizer on `/login`, **When** I submit valid email/password credentials, **Then** a session token is issued, an `electa_auth_session` cookie is established, and I am redirected to `/dashboard`.
2. **Given** I am a new organizer, **When** I complete the sign-up form on `/register`, **Then** my account is provisioned with role `ORGANIZER`, my profile is persisted in PostgreSQL/Supabase, and I am logged in immediately.
3. **Given** invalid credentials are submitted, **When** the authentication request fails, **Then** an accessible, friendly error message ("Invalid email or password") is displayed without page reload.

---

### User Story 2 - LocalStack / Offline Local Auth Provider (Priority: P1)

As a **Developer / Tester**,  
I want the authentication service to interface transparently with **LocalStack / Local Cognito Endpoint** or an environment-driven local auth fallback,  
So that I can test full login, registration, and session token verification offline without needing live AWS credentials.

**Why this priority**: Essential to unblock local UI and API development immediately without requiring remote AWS Cognito infrastructure provisioned beforehand.

**Independent Test**: Can be verified by running the app with `NEXT_PUBLIC_AUTH_PROVIDER=localstack` or `local` and successfully authenticating test organizer accounts.

**Acceptance Scenarios**:

1. **Given** local environment variables (`LOCALSTACK_AUTH_URL` or `MOCK_COGNITO=true`), **When** an auth request is initiated, **Then** the local auth adapter fulfills signup/login with valid mock JWT tokens matching Cognito schema.
2. **Given** `getSession()` in `src/lib/auth/get-session.ts`, **When** evaluating incoming request cookies/headers, **Then** it accurately decodes the session token, verifies the `ORGANIZER` role, and populates the user context.

---

### User Story 3 - Smart Route Guards & Auto-Routing (Priority: P2)

As an **Event Organizer**,  
I want the application to automatically route me to `/dashboard` if I'm already logged in, and remember where I was going if prompted to log in,  
So that my workflow remains smooth and uninterrupted.

**Why this priority**: Prevents redundant login screens for active users and ensures organizers return directly to their intended page (e.g. `/events/[id]/settings`) after authenticating.

**Independent Test**: Navigate to `/dashboard/events/new` while logged out, log in, and verify automatic redirection to `/dashboard/events/new` via `?returnTo=...`.

**Acceptance Scenarios**:

1. **Given** an authenticated organizer visits `/login` or `/register`, **When** the page loads, **Then** they are automatically redirected to `/dashboard`.
2. **Given** an unauthenticated user attempts to visit `/dashboard/events/123/settings`, **When** redirected to `/login?returnTo=%2Fdashboard%2Fevents%2F123%2Fsettings`, **And** they log in successfully, **Then** they are redirected directly to `/dashboard/events/123/settings`.

---

### User Story 4 - Secure Sign-Out & Session Revocation (Priority: P3)

As an **Organizer**,  
I want to click "Log Out" from my user profile menu,  
So that my session is terminated securely on both client and server.

**Why this priority**: Crucial for shared workstation security and multi-account testing.

**Independent Test**: Click "Log out" in dashboard navbar, verify cookies are cleared, and subsequent `/dashboard` requests redirect back to `/login`.

**Acceptance Scenarios**:

1. **Given** an active organizer session, **When** I click "Log out", **Then** server auth cookies are cleared, client auth Zustand store is reset, and I am routed to `/login`.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide dedicated `/login` and `/register` pages with form validation (email format, minimum password length).
- **FR-002**: System MUST issue and verify JWT session cookies using Next.js Server Actions and secure HTTP cookies (`electa_auth_session`).
- **FR-003**: System MUST support a configurable LocalStack / Local mock Cognito auth provider when AWS remote credentials are not provided.
- **FR-004**: System MUST assign `role: "ORGANIZER"` to all organizers upon registration.
- **FR-005**: System MUST redirect authenticated organizers away from `/login` to `/dashboard`.
- **FR-006**: System MUST respect `?returnTo=` query parameters for post-login redirection.
- **FR-007**: System MUST provide a server action `logoutAction` that clears session cookies and invalidates query caches.

---

## Edge Cases

- **Expired Sessions**: When a token expires, the client displays a gentle session timeout notice and redirects to `/login` preserving the current URL in `returnTo`.
- **Duplicate Registration**: Attempting to register an already-existing email displays a clear "Account already exists with this email" message with a link to `/login`.
- **Network / Service Disconnection**: If LocalStack or Cognito is unreachable, the UI surfaces a graceful "Authentication service currently unavailable" state rather than crashing.
