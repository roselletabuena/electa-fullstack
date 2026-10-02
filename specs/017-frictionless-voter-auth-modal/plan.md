# Implementation Plan: Frictionless Voter Authentication Modal

**Feature ID**: `017-frictionless-voter-auth-modal`  
**Jira Issue**: [VS-27](https://the-three-devsketeers.atlassian.net/browse/VS-27)

---

## 1. Architecture & Component Mapping

### A. Intent Management & Resumption

- `src/features/voting/utils/vote-intent.ts`:
  - `savePendingVoteIntent(intent: PendingVoteIntent): void`
  - `getPendingVoteIntent(): PendingVoteIntent | null`
  - `clearPendingVoteIntent(): void`
- `src/features/voting/hooks/use-pending-vote-intent.ts`:
  - Automatically consumes stored intent upon page load if user is authenticated and executes the vote action with toast confirmation.
- Mount `usePendingVoteIntent` in `src/features/events/components/EventPageClient.tsx`.

### B. Google OAuth Route Handler

- `src/app/api/auth/cognito/initiate/route.ts`:
  - Handles `/api/auth/cognito/initiate?provider=Google&returnTo=...`
  - Generates CSRF state, stores `returnTo` in state cookie, and redirects to Cognito / Google IdP.

### C. UI Component Styling & Branding

- `src/features/auth/components/OmnichannelAuthModal.tsx` & `src/features/voting/components/AuthPromptModal.tsx`:
  - Focused, single-purpose Google Sign-In interface with zero-radius geometry (`rounded-none`).
  - Strict Electa Opal light theme default + dark mode scoping.
  - Brand typography (`font-heading`, `font-sans`).
  - Buffers `voteIntent` prior to initiating Google OAuth redirect.
- `src/features/voting/components/FreeVoteButton.tsx`:
  - On 401 / `NOT_AUTHENTICATED`, open `AuthPromptModal` passing the candidate's `voteIntent`.

---

## 2. Test Plan

- Unit tests in `tests/unit/voting/vote-intent.test.ts`:
  - Test saving, retrieving, validating, and clearing vote intent from `sessionStorage`.
- Unit tests in `tests/unit/auth/omnichannel-auth-modal.test.tsx` and `tests/unit/voting/auth-prompt-modal.test.tsx`:
  - Verify modal rendering, Google Sign-In trigger, zero-radius styling classes, and intent preservation.
- Unit tests in `tests/unit/features/auth/oauth-initiate.test.ts`:
  - Verify `/api/auth/cognito/initiate` route handler response and cookie creation.
