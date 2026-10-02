# Feature Specification: Electa Unified Authentication & Universal Event Creation (Cognito & LocalStack)

**Feature Branch**: `013-electa-unified-authentication`

**Created**: 2026-10-02

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-52 - [Auth] Universal Electa Single-Account Sign-In & Unified Session for Voting and Event Management. Single account login for both voting and organizers; voters can create events."

---

## Clarifications

### Session 2026-10-02

- **Q: How are user roles and permissions structured between voters and organizers?**
  - **A:** Unified single user identity: Every authenticated user on Electa has full capability to vote on pageant events (using daily free votes or boost votes) and create/manage their own events on `/dashboard` without requiring separate accounts or explicit role promotions.
- **Q: What authentication methods are supported across Electa?**
  - **A:** Google OAuth 2.0 (Cognito Hosted UI / Federated IdP), Email & Password, Passwordless Magic Link / Phone OTP, and 1-Click Quick Demo Login for local testing.
- **Q: How is event ownership and multi-tenancy enforced?**
  - **A:** Every event record stores `organizerId: session.userId`. The organizer dashboard displays only events where `organizerId` matches the authenticated user's ID.

---

## Background & Objectives

Electa serves pageant viewers, voters, and pageant organizers through a seamless, unified web platform. Previously, organizer authentication was conceived as a separate silo from voter authentication.

In this unified model, **Electa uses a Single Universal User Identity**:

1. **One Login Everywhere**: Signing in via `/login`, `/register`, or the inline voting modal on an event page issues the universal `electa_auth_session` cookie.
2. **Dual Capability**: Any authenticated user can cast votes on contestants and seamlessly access `/dashboard` or `/dashboard/events/new` to create and administer their own pageants.
3. **Electa Brutalist-Refined Design**: All authentication interfaces adhere strictly to Electa's zero-radius geometry (`rounded-none`, `--radius: 0px`), Outfit heading typography, Sora body font, and Opal Slate-50 default theme with WCAG 2.1 AA dual-theme contrast.
4. **Offline & Cloud Ready**: Supports local offline mock token adapter / LocalStack alongside remote AWS Cognito Hosted UI with Federated Google IdP.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Universal Single-Account Sign-In & Registration (Priority: P1)

As an **Electa user**,  
I want to sign in and register through a single unified authentication flow,  
So that I can use one account to vote on pageants, support contestants, and manage or create my own events.

**Why this priority**: Core identity foundation across the entire Electa platform. Unifies voting and event management under a single persistent session.

**Independent Test**: Can be tested by navigating to `/login` or `/register`, creating an account or logging in, and verifying the `electa_auth_session` cookie permits both voting actions and event creation without re-authenticating.

**Acceptance Scenarios**:

1. **Given** I am an unauthenticated visitor on `/login` or `/register`, **When** I submit valid email/password credentials or register a new account, **Then** an `electa_auth_session` cookie is issued and I am redirected to my intended destination or `/dashboard`.
2. **Given** I am an unauthenticated user on a pageant page attempting to vote, **When** I log in via the inline authentication modal, **Then** my vote is recorded and my session remains active for subsequent visits to `/dashboard`.
3. **Given** I submit invalid credentials, **When** the authentication request fails, **Then** an accessible, friendly error message ("Invalid email or password") is displayed without page reload.

---

### User Story 2 - Voter-to-Organizer Event Creation & Dashboard Access (Priority: P1)

As an **authenticated Electa voter**,  
I want to navigate directly to the event creation portal and launch new pageant events,  
So that I can become an event organizer without needing administrative approval or a separate organizer profile.

**Why this priority**: Empowers every member of the Electa community to organize and host their own pageants freely.

**Independent Test**: Can be tested by logging in as a voter, navigating to `/dashboard/events/new`, submitting an event form, and verifying the new event appears in `/dashboard` under the user's `organizerId`.

**Acceptance Scenarios**:

1. **Given** I am logged in with a standard Electa account, **When** I navigate to `/dashboard/events/new` and submit valid event details, **Then** the event is created with `organizerId: session.userId`, an initial audit log is recorded, and I am redirected to the event overview.
2. **Given** I visit `/dashboard`, **When** the page loads, **Then** the system queries and displays only the events created by my user account (`organizerId == session.userId`).
3. **Given** an unauthenticated visitor attempts to access `/dashboard` or `/dashboard/events/new`, **When** the page loads, **Then** they are redirected to `/login?returnTo=...` preserving their intended route.

---

### User Story 3 - Electa Branding & Zero-Radius UI Harmony (Priority: P2)

As an **Electa user**,  
I want to interact with authentication screens and modals that embody Electa's design system with sharp zero-radius geometry and clear copy,  
So that the interface feels cohesive, modern, and clearly communicates universal account capabilities.

**Why this priority**: Guarantees visual polish, accessibility compliance (WCAG 2.1 AA), and consistent brand messaging across the platform.

**Independent Test**: Can be tested by inspecting `/login`, `/register`, and `OmnichannelAuthModal` in both light mode and dark mode to verify zero border-radius (`rounded-none`), typography, and contrast ratios.

**Acceptance Scenarios**:

1. **Given** I am on `/login` or `/register`, **When** the page renders, **Then** the headings display "Sign in to Electa" / "Join Electa" with copy explaining universal voting and event creation access.
2. **Given** any authentication form or dialog, **When** viewed in light or dark mode, **Then** all inputs, buttons, and cards feature sharp 0px corners (`rounded-none`) and compliant contrast ratios (>= 4.5:1 for body text).

---

### User Story 4 - Secure Sign-Out & Session Revocation (Priority: P3)

As an **authenticated user**,  
I want to click "Log Out" from the navigation menu,  
So that my session is terminated securely on both client and server.

**Why this priority**: Vital for shared device security and clean state management.

**Independent Test**: Click "Log out" in navbar, verify cookies are cleared, and subsequent `/dashboard` visits require re-authentication.

**Acceptance Scenarios**:

1. **Given** an active user session, **When** I click "Log out", **Then** the `electa_auth_session` cookie is cleared, client Zustand auth store is reset, and I am redirected to `/login`.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide unified `/login` and `/register` pages with client and server-side Zod validation.
- **FR-002**: System MUST issue and verify secure HTTP-only session cookies (`electa_auth_session`) containing verified user claims (`userId`, `email`, `name`, `avatarUrl`).
- **FR-003**: System MUST allow any authenticated user with a valid `userId` to create events and access `/dashboard`.
- **FR-004**: System MUST isolate organizer dashboard queries so users only view and manage events where `organizerId == session.userId`.
- **FR-005**: System MUST support local offline mock token adapter and LocalStack for offline development without remote AWS dependencies.
- **FR-006**: System MUST support AWS Cognito Hosted UI with Google Identity Provider federation.
- **FR-007**: System MUST preserve `?returnTo=` query parameters when redirecting unauthenticated users from protected routes.
- **FR-008**: System MUST adhere to Electa zero-radius brutalist design tokens (`rounded-none`) and WCAG 2.1 AA dual-theme contrast.

### Key Entities

- **UserAccount / UserSession**: Represents the authenticated identity. Key attributes: `userId` (UUID/sub), `email`, `name`, `avatarUrl`, `expiresAt`.
- **Event**: Pageant event created by a user. Key attributes: `id`, `slug`, `title`, `description`, `bannerUrl`, `startsAt`, `endsAt`, `publicationStatus`, `organizerId` (foreign key to `UserSession.userId`).
- **Vote**: Record of a free or boost vote cast by a user. Key attributes: `id`, `eventId`, `contestantId`, `voterId` (foreign key to `UserSession.userId`), `voteType`, `voteWeight`, `createdAt`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Single-account workflow: 100% of users registered via voting flows can immediately create an event without secondary registration.
- **SC-002**: Authentication speed: Form submissions and OAuth redirects establish a verified session in under 1.5 seconds.
- **SC-003**: Multi-tenant isolation: Zero cross-account event visibility on `/dashboard` across automated multi-user test suites.
- **SC-004**: Design compliance: 100% compliance with zero-radius geometry (`rounded-none`) and WCAG 2.1 AA color contrast across all auth screens in light and dark modes.

---

## Assumptions

- PostgreSQL / Prisma is the authoritative datastore for events, votes, and contestants.
- AWS Cognito is the primary identity provider in cloud staging/production environments.
- Local mock token adapter enables full offline development without active internet or AWS credentials.
