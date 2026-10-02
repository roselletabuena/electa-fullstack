# Tasks: Electa Unified Authentication & Universal Event Creation

**Branch**: `013-unified-authentication` | **Spec**: [`specs/013-unified-authentication/spec.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-unified-authentication/spec.md) | **Plan**: [`specs/013-unified-authentication/plan.md`](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/013-unified-authentication/plan.md)  
**Jira References**: Epic [VS-55](https://the-three-devsketeers.atlassian.net/browse/VS-55) | Stories: [VS-52](https://the-three-devsketeers.atlassian.net/browse/VS-52), [VS-53](https://the-three-devsketeers.atlassian.net/browse/VS-53), [VS-54](https://the-three-devsketeers.atlassian.net/browse/VS-54)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration

- [x] T001 Configure auth environment variables and mock settings in `src/env.ts` and `.env.local`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Update auth DTOs and TypeScript interfaces in `src/features/auth/types/index.ts`
- [x] T003 [P] Update Zod validation schemas for login and registration in `src/features/auth/utils/validation.ts`
- [x] T004 [P] Standardize JWT token adapter and LocalStack token generator in `src/features/auth/utils/token-adapter.ts`
- [x] T005 Standardize central session resolver in `src/lib/auth/get-session.ts` for unified `electa_auth_session` cookie verification

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 (VS-52) - Universal Single-Account Sign-In & Registration (Priority: P1) 🎯 MVP

**Goal**: Enable any user to register and log in via a single account, establishing `electa_auth_session` for both voting and organizer operations.

**Independent Test**: Navigate to `/login`, register or sign in with credentials / 1-click demo, verify session cookie is issued, and confirm ability to vote on pageants without re-authenticating.

### Tests for User Story 1 🧪

- [x] T006 [P] [US1] Unit test suite for validation schemas and credentials parsing in `tests/unit/auth/auth-validation.test.ts`
- [x] T007 [P] [US1] Unit test suite for token creation, verification, and session resolution in `tests/unit/auth/token-adapter.test.ts`

### Implementation for User Story 1

- [x] T008 [US1] Implement unified `loginAction` with credentials and 1-click demo support in `src/features/auth/actions/login-action.ts`
- [x] T009 [US1] Implement unified `registerAction` supporting direct account provisioning in `src/features/auth/actions/register-action.ts`
- [x] T010 [US1] Align `OmnichannelAuthModal` in `src/features/auth/components/OmnichannelAuthModal.tsx` to issue the universal `electa_auth_session` cookie

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 (VS-53) - Voter-to-Organizer Event Creation & Dashboard Access (Priority: P1)

**Goal**: Allow any authenticated user (including voters) to create events from `/dashboard/events/new` and view their owned events on `/dashboard`.

**Independent Test**: Log in as a voter, navigate to `/dashboard/events/new`, submit the event creation form, and verify the event is created with `organizerId == session.userId` and listed on `/dashboard`.

### Tests for User Story 2 🧪

- [x] T011 [P] [US2] Unit test verifying event creation binds to authenticated user's ID in `tests/unit/events/create-event-unified-auth.test.ts`

### Implementation for User Story 2

- [x] T012 [US2] Ensure atomic event creation service in `src/features/events/services/create-event.ts` accepts any authenticated `session.userId`
- [x] T013 [US2] Verify multi-tenant event filtering by `organizerId: session.userId` in `src/app/(dashboard)/dashboard/page.tsx`
- [x] T014 [US2] Configure route protection and `?returnTo=` preservation on `/dashboard/events/new`

**Checkpoint**: User Stories 1 AND 2 work independently and in combination

---

## Phase 5: User Story 3 (VS-54) - Electa Rebranding & Zero-Radius UI Harmony (Priority: P2)

**Goal**: Modernize all authentication interfaces and navigation menus to reflect Electa branding, brutalist-refined zero-radius geometry (`rounded-none`), and dual-theme WCAG 2.1 AA contrast.

**Independent Test**: Visual and automated inspection of `/login`, `/register`, and `OmnichannelAuthModal` in light mode (Opal Slate-50) and dark mode verifying zero border-radius and accessible colors.

### Implementation for User Story 3

- [x] T015 [P] [US3] Refactor `src/features/auth/components/LoginForm.tsx` with Electa branding, zero-radius geometry (`rounded-none`), and dual-theme styling
- [x] T016 [P] [US3] Refactor `src/features/auth/components/RegisterForm.tsx` with Electa branding, zero-radius geometry, and dual-theme styling
- [x] T017 [P] [US3] Update auth layout container and card styling in `src/app/(auth)/layout.tsx`
- [x] T018 [US3] Update header navigation and profile dropdowns to show universal "Dashboard / My Events" and "Create Event" links for authenticated users

**Checkpoint**: All authentication screens comply with Electa design system and WCAG 2.1 AA

---

## Phase 6: User Story 4 - Secure Sign-Out & Session Revocation (Priority: P3)

**Goal**: Provide secure sign-out functionality that clears the session cookie and redirects cleanly to `/login`.

**Independent Test**: Click "Log out", verify `electa_auth_session` cookie is deleted, and confirm subsequent `/dashboard` visits require re-login.

### Implementation for User Story 4

- [x] T019 [US4] Implement `logoutAction` in `src/features/auth/actions/logout-action.ts` to clear `electa_auth_session` and reset Zustand store

---

## Phase 7: Polish & Quality Gates

**Purpose**: Full automated verification across all layers

- [x] T020 [P] Execute TypeScript validation (`npm run typecheck`)
- [x] T021 [P] Execute Lint checks (`npm run lint`)
- [x] T022 Run complete unit test suite (`npm run test:unit`)
- [x] T023 Run end-to-end quickstart validation per `quickstart.md`
