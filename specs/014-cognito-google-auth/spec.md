# Feature Specification: AWS Cognito Federated Google Identity Provider Integration

**Feature Branch**: `014-cognito-google-auth`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-51: [Auth] AWS Cognito Federated Google Identity Provider Integration for Organizer Sign-In. Infrastructure to be managed via Terraform under `infra/`."

## Clarifications

### Session 2026-09-28

- Q: When an organizer already registered via email/password attempts to sign in using Google with the same email address, how should the system handle the account? → A: Seamlessly link the Google identity to the existing account matching that email and log them in directly.
- Q: When a new organizer completes Google sign-in for the first time, how should their organization onboarding flow be handled? → A: Redirect to an onboarding setup page where organization setup is optional (can be skipped or completed to proceed to `/dashboard`).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Federated Google Sign-In & Onboarding (Priority: P1)

As an event organizer, I want to sign in or register with my Google account with a single click, so that I can access my account immediately without creating or remembering a separate password.

**Why this priority**: Core value proposition of social sign-in. Enables frictionless onboarding and organizer login while keeping authentication centralized and secure.

**Independent Test**: An organizer navigates to `/login` or `/register`, clicks "Continue with Google", authenticates with their Google account via the identity provider, and is redirected back with an active authenticated session. For first-time users, they land on the optional onboarding setup screen; for existing users, they land directly on `/dashboard`.

**Acceptance Scenarios**:

1. **Given** an unauthenticated organizer on `/login` or `/register`, **When** they click "Continue with Google", **Then** they are redirected to the federated identity authentication flow.
2. **Given** a new organizer successfully authenticates with Google for the first time, **When** they are redirected back to the application callback URL with a valid authorization code, **Then** the system exchanges the code for verified tokens, establishes a secure HTTP-only session cookie (`electa_auth_session`), provisions their organizer profile, and redirects them to the optional organization onboarding setup page (`/onboarding`).
3. **Given** a returning organizer successfully authenticates with Google, **When** their session is verified, **Then** they are redirected directly to `/dashboard`.

---

### User Story 2 - Account Linking & Profile Synchronization (Priority: P2)

As an organizer who has previously registered with email/password or registers via Google, I want my accounts to seamlessly link under my verified email address so that I have a unified profile without duplicate accounts or authentication errors.

**Why this priority**: Ensures data integrity between the federated identity claims and the application's organizer database record while avoiding login collisions.

**Independent Test**: Can be tested by creating an email/password account, then signing in via Google with the same verified email, confirming that the user is logged into the existing account and the federated identity is linked.

**Acceptance Scenarios**:

1. **Given** an existing organizer registered with email/password (`organizer@example.com`), **When** they subsequently click "Continue with Google" using `organizer@example.com`, **Then** the system seamlessly links the Google identity to the existing organizer record, updates verified profile metadata, and establishes an active session.
2. **Given** an existing organizer whose Google profile name or avatar updates, **When** they authenticate, **Then** their profile details are kept in sync with the database record.

---

### User Story 3 - Authentication Failure & Cancellation Resilience (Priority: P3)

As an organizer attempting to sign in with Google, if I cancel the prompt, decline permissions, or encounter an authentication error, I want to be returned to the sign-in page with a clear, helpful message and without being placed into an invalid session state.

**Why this priority**: Prevents dead ends, unhandled callback errors, security vulnerabilities, or orphaned session states.

**Independent Test**: Can be tested by initiating Google sign-in and either closing/cancelling the provider consent screen or simulating an expired/tampered callback code, verifying that the user lands safely on `/login` with an informative error toast/banner and no session cookie is set.

**Acceptance Scenarios**:

1. **Given** an organizer initiates Google login, **When** they cancel or deny Google authentication consent, **Then** they are redirected back to `/login` with an informative status message and no session cookie is issued.
2. **Given** an invalid, expired, or tampered authorization callback request, **When** processed by the callback handler, **Then** the request is rejected with a validation error and redirected to `/login?error=auth_failed`.

---

### Edge Cases

- **Access Denial**: What happens if the user denies required scopes (email/profile)? The system redirects back to `/login` with a clear explanation that email access is required to proceed.
- **Network / Token Exchange Timeout**: What happens if the backend cannot communicate with the identity provider token endpoint? The callback handler logs the incident safely without leaking secrets and displays a temporary service unavailable notification with a retry option.
- **State Parameter Mismatch**: How does the system protect against Cross-Site Request Forgery (CSRF) in the OAuth callback? State parameters generated during redirect initiation are validated on callback before processing any authorization code.
- **Duplicate Concurrent Callback**: How does the system handle rapid back-to-back callback hits with the same one-time authorization code? Once a code is consumed, subsequent duplicate hits gracefully handle the consumed token state without corrupting the session.
- **Optional Onboarding Skip**: What happens if a first-time user chooses to skip the onboarding setup screen? They can click "Skip for now" or navigate directly to `/dashboard`, retaining full access with default organizer privileges.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a prominent, accessible "Continue with Google" action on both the organizer Login and Register interfaces.
- **FR-002**: System MUST initiate the OAuth 2.0 / OIDC authorization code flow with the federated identity provider, requesting `openid`, `email`, and `profile` scopes with CSRF state protection.
- **FR-003**: System MUST provide a secure backend callback endpoint to receive authorization codes and exchange them securely for verified tokens.
- **FR-004**: System MUST verify the authenticity, issuer, audience, and signature of received identity tokens before granting access.
- **FR-005**: System MUST provision a new organizer account record in the database if the authenticated subject does not exist, and redirect first-time organizers to an optional onboarding setup page.
- **FR-006**: System MUST seamlessly link Google federated identities to existing organizer accounts matching the same verified email address.
- **FR-007**: System MUST issue the standard secure, HTTP-only, SameSite session cookie (`electa_auth_session`) upon successful authentication.
- **FR-008**: System MUST handle all provider error responses and callback failures gracefully, redirecting to the login screen with localized, actionable error messaging.
- **FR-009**: System MUST comply with all VoteSphere Constitution principles (strict Zod schema validation for callback search parameters, Route Handler session verification, and environment variable validation).

### Key Entities _(include if feature involves data)_

- **Organizer Profile**: Represents the authenticated event organizer; contains `id`, `email`, `name`, `avatarUrl`, and reference to identity provider subject identifier (`sub`).
- **Federated Identity Link**: Maps external identity provider identity (`Google`, external `sub`) to the internal `Organizer` entity.
- **Auth Session**: Encapsulates the verified session token payload in the HTTP-only cookie, carrying user ID, role, email, and expiration timestamp.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can complete Google sign-in or registration in under 5 seconds (excluding external Google credential typing time).
- **SC-002**: 100% of successful federated authentications correctly generate a valid `electa_auth_session` cookie and redirect appropriately (`/onboarding` for first-time or `/dashboard` for returning).
- **SC-003**: 0% unhandled exceptions or white-screen errors on cancelled, timed-out, or invalid authorization callbacks.
- **SC-004**: Zero duplicate account conflicts when signing in with Google using an existing registered email.
- **SC-005**: Zero sensitive tokens or credentials exposed to client-side scripts (Strict adherence to HTTP-only cookie session model).

---

## Assumptions

- AWS Cognito User Pool with Google Identity Provider federation will be used as the central identity broker.
- All AWS cloud infrastructure (Cognito User Pool, App Client, Domain, Google Identity Provider, IAM, and SSM/Secrets) will be provisioned and managed via Terraform within `infra/` (`c:\Users\Roselle Tabuena\workspace\vote-sphere-workspace\infra`).
- The application callback URL (`/api/auth/callback/cognito` or configured route) will be configured as an allowed callback URL in the Cognito App Client Terraform resource.
- Google OAuth credentials (Client ID and Client Secret) are supplied via secure Terraform input variables into the AWS Cognito Google Identity Provider module.
- Client-side routes continue to utilize the existing `electa_auth_session` cookie and `src/lib/auth/get-session.ts` verification logic for uniform authorization across email/password and social login flows.
