# Tasks: Frictionless Organizer Authentication & Role Management (LocalStack & Cognito)

**Feature Branch**: `013-organizer-authentication`  
**Spec**: [`specs/013-organizer-authentication/spec.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-organizer-authentication/spec.md)  
**Plan**: [`specs/013-organizer-authentication/plan.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-organizer-authentication/plan.md)  
**Jira Ticket**: [**VS-50**](https://the-three-devsketeers.atlassian.net/browse/VS-50)

---

## Phase 1: Setup & Foundational Types & Token Adapter

- [x] **Task 1.1**: Define TypeScript auth DTOs and Session models
  - **File**: `src/features/auth/types/index.ts`
  - **Details**: Export `UserRole`, `UserSessionDto`, `LoginCredentialsDto`, `RegisterOrganizerDto`, `AuthResponseDto`, `AuthErrorDto`.

- [x] **Task 1.2**: Implement Zod validation schemas for Login & Registration
  - **File**: `src/features/auth/utils/validation.ts`
  - **Details**: Define `loginSchema` (email, optional password/demo flag) and `registerOrganizerSchema` (name, email, password min 8 chars).

- [x] **Task 1.3**: Create LocalStack / Local Cognito Token Adapter
  - **File**: `src/features/auth/utils/token-adapter.ts`
  - **Details**: Implement `generateLocalCognitoToken()` and `verifyLocalCognitoToken()` emulating AWS Cognito ID token JWT structure (`sub`, `email`, `cognito:groups: ["ORGANIZER"]`).

- [x] **Task 1.4**: Add Unit Tests for Auth Validation & Token Adapter
  - **Files**: `tests/unit/auth/auth-validation.test.ts`, `tests/unit/auth/token-adapter.test.ts`
  - **Details**: Test valid/invalid login and register inputs, token signature creation, decoding, and expiration checks.

---

## Phase 2: User Story 1 (P1) - Organizer Server Actions & Session Management

- [x] **Task 2.1**: Implement `loginAction` Server Action
  - **File**: `src/features/auth/actions/login-action.ts`
  - **Details**: Authenticate credentials or demo organizer trigger, generate token via token adapter, set `httpOnly` secure `electa_auth_session` cookie, return redirect URL.

- [x] **Task 2.2**: Implement `registerOrganizerAction` Server Action
  - **File**: `src/features/auth/actions/register-action.ts`
  - **Details**: Validate registration payload, provision organizer in database/mock store, set session cookie, return success response.

- [x] **Task 2.3**: Update `getSession()` to verify LocalStack & Cognito tokens
  - **File**: `src/lib/auth/get-session.ts`
  - **Details**: Update session resolution to decode and verify `electa_auth_session` cookie or `Authorization: Bearer` header against the token adapter, extracting `userId`, `email`, and `role: "ORGANIZER"`.

---

## Phase 3: User Story 2 & 3 (P1/P2) - UI Components, Forms & Auth Routes

- [x] **Task 3.1**: Create Auth Layout Component
  - **File**: `src/app/(auth)/layout.tsx`
  - **Details**: Centered glassmorphic card layout with Electa branding, background gradients, and accessible structure.

- [x] **Task 3.2**: Build `LoginForm` Component with 1-Click Demo Shortcut
  - **File**: `src/features/auth/components/LoginForm.tsx`
  - **Details**: React Hook Form with Zod resolver, email/password inputs, loading spinner, error banners, and prominent "Quick Login as Demo Organizer" button.

- [x] **Task 3.3**: Build `RegisterForm` Component
  - **File**: `src/features/auth/components/RegisterForm.tsx`
  - **Details**: Name, email, and password registration form with instant inline validation and redirection.

- [x] **Task 3.4**: Create `/login` and `/register` App Pages
  - **Files**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
  - **Details**: Render `LoginForm` and `RegisterForm`, handle `?returnTo=` search params, and auto-redirect authenticated users to `/dashboard`.

- [x] **Task 3.5**: Configure Smart Route Guards in Dashboard Layout
  - **File**: `src/app/(dashboard)/layout.tsx`
  - **Details**: Check `getSession()` on dashboard layout; if unauthenticated, redirect to `/login?returnTo=${pathname}`.

---

## Phase 4: User Story 4 (P3) - Logout Action & User Menu Integration

- [x] **Task 4.1**: Implement `logoutAction` Server Action
  - **File**: `src/features/auth/actions/logout-action.ts`
  - **Details**: Clear `electa_auth_session` and `vs_auth_session` cookies and redirect to `/login`.

- [x] **Task 4.2**: Add Client Zustand Auth Store & `useAuth` Hook
  - **Files**: `src/features/auth/stores/auth-store.ts`, `src/features/auth/hooks/use-auth.ts`
  - **Details**: Provide reactive user session state and sign-out trigger for client components.

- [x] **Task 4.3**: Integrate User Profile & Log Out Button in Dashboard Navbar
  - **File**: `src/features/events/components/dashboard-overview/DashboardGreetingBanner.tsx`
  - **Details**: Display logged-in organizer's name/avatar with a functional "Sign Out" button calling `logoutAction`.

---

## Phase 5: Verification, Quality Gates & Barrel Exports

- [x] **Task 5.1**: Create Feature Barrel Export
  - **File**: `src/features/auth/index.ts`
  - **Details**: Export public actions, components, hooks, and types.

- [x] **Task 5.2**: Add End-to-End Server Action Unit Tests
  - **File**: `tests/unit/auth/login-action.test.ts`
  - **Details**: Unit tests for `loginAction`, `registerOrganizerAction`, and `logoutAction`.

- [x] **Task 5.3**: Run Full Test Suite & Lint Quality Gate
  - **Commands**: `npm run test:unit`, `npm run typecheck`, `npm run lint`
  - **Details**: Ensure all unit tests pass with zero errors and strict TypeScript compliance.
