# Implementation Tasks: AWS Cognito Federated Google Identity Provider Integration

**Feature**: AWS Cognito Federated Google Identity Provider Integration (`014-cognito-google-auth`)
**Plan**: [specs/014-cognito-google-auth/plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/014-cognito-google-auth/plan.md)
**Spec**: [specs/014-cognito-google-auth/spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/014-cognito-google-auth/spec.md)

---

## Phase 1: Setup (Infrastructure & Configuration)

**Purpose**: Initialize Terraform configuration in `infra/` to manage AWS Cognito and Google Identity Provider resources.

- [x] T001 [P] Initialize Terraform configuration structure and AWS provider setup in `infra/main.tf`
- [x] T002 [P] Define input variables and defaults (region, app name, Google credentials, callback URLs) in `infra/variables.tf`
- [x] T003 [P] Configure Terraform outputs (User Pool ID, Client ID, Cognito Domain, Issuer URL) in `infra/outputs.tf`
- [x] T004 [P] Create sample variable template in `infra/terraform.tfvars.example`
- [x] T005 Define AWS Cognito User Pool, Google Identity Provider, Hosted UI Domain, and App Client resources in `infra/cognito.tf`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schemas, token adapter extensions, and OAuth utilities that block all user stories.

- [x] T006 [P] Add and export OAuth, session, and callback Zod validation schemas in `vote-sphere/src/features/auth/types/index.ts`
- [x] T007 [P] Implement Cognito OAuth utility & authorization URL generator in `vote-sphere/src/features/auth/utils/oauth-client.ts`
- [x] T008 [P] Extend token adapter to support Google federated identity payload claims in `vote-sphere/src/features/auth/utils/token-adapter.ts`

**Checkpoint**: Foundation ready - user story implementation complete.

---

## Phase 3: User Story 1 - Federated Google Sign-In & Onboarding (Priority: P1) 🎯 MVP

**Goal**: Allow organizers to sign in or register with Google via AWS Cognito, establish a secure `electa_auth_session` cookie, and route new users through an optional onboarding screen.

### Tests for User Story 1

- [x] T009 [P] [US1] Unit test for OAuth initiation and state generation in `vote-sphere/tests/unit/features/auth/oauth-initiate.test.ts`
- [x] T010 [P] [US1] Unit test for Cognito callback code exchange and session establishment in `vote-sphere/tests/unit/features/auth/cognito-callback.test.ts`

### Implementation for User Story 1

- [x] T011 [US1] Implement `/api/auth/google` Route Handler to generate CSRF state and redirect to Cognito in `vote-sphere/src/app/api/auth/google/route.ts`
- [x] T012 [US1] Implement `/api/auth/callback/cognito` Route Handler to exchange code, verify token, and set session cookie in `vote-sphere/src/app/api/auth/callback/cognito/route.ts`
- [x] T013 [P] [US1] Create reusable `GoogleSignInButton` component with Google branding in `vote-sphere/src/features/auth/components/GoogleSignInButton.tsx`
- [x] T014 [US1] Integrate `GoogleSignInButton` and divider into `vote-sphere/src/features/auth/components/LoginForm.tsx` and `vote-sphere/src/features/auth/components/RegisterForm.tsx`
- [x] T015 [US1] Create optional organizer onboarding page and form with "Skip for now" in `vote-sphere/src/app/(auth)/onboarding/page.tsx` and `vote-sphere/src/features/auth/components/OnboardingForm.tsx`
- [x] T016 [US1] Implement `completeOnboardingAction` in `vote-sphere/src/features/auth/actions/onboarding-action.ts`

**Checkpoint**: User Story 1 is functional and verified.

---

## Phase 4: User Story 2 - Account Linking & Profile Synchronization (Priority: P2)

**Goal**: Automatically link Google sign-in to existing organizer accounts registered with the same verified email address, preventing duplicates.

### Tests for User Story 2

- [x] T017 [P] [US2] Unit test for seamless account linking by verified email in `vote-sphere/tests/unit/features/auth/account-linking.test.ts`

### Implementation for User Story 2

- [x] T018 [US2] Implement user lookup and email-based identity linking in `vote-sphere/src/app/api/auth/callback/cognito/route.ts` and `vote-sphere/src/features/auth/actions/login-action.ts`
- [x] T019 [US2] Update `getSession()` and `auth-store` to handle linked provider attributes and avatar in `vote-sphere/src/lib/auth/get-session.ts` and `vote-sphere/src/features/auth/stores/auth-store.ts`

**Checkpoint**: User Stories 1 AND 2 are functional and verified.

---

## Phase 5: User Story 3 - Authentication Failure & Cancellation Resilience (Priority: P3)

**Goal**: Handle OAuth cancellations, denied scopes, state mismatches, and timeouts gracefully with helpful feedback.

### Tests for User Story 3

- [x] T020 [P] [US3] Unit test for callback error handling (cancellation, invalid state, token timeout) in `vote-sphere/tests/unit/features/auth/callback-errors.test.ts`

### Implementation for User Story 3

- [x] T021 [US3] Add robust error translation and query parameter sanitization in `vote-sphere/src/app/api/auth/callback/cognito/route.ts`
- [x] T022 [US3] Add dismissible error alerts with descriptive messaging on `/login` in `vote-sphere/src/features/auth/components/LoginForm.tsx`

**Checkpoint**: All user stories are complete and resilient.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, static analysis, documentation, and end-to-end verification.

- [x] T023 [P] Update environment variable definitions and documentation in `vote-sphere/.env.example` and `vote-sphere/docs/aws-cognito-setup.md`
- [x] T024 [P] Run static analysis and linting (`npm run typecheck`, `npm run lint`)
- [x] T025 Run full unit test suite (`npm run test:unit`) to confirm all auth tests pass
- [x] T026 Validate end-to-end flow using quickstart guide in `vote-sphere/specs/014-cognito-google-auth/quickstart.md`
