# Implementation Plan: Frictionless Voter Authentication Modal

**Feature ID**: `017-frictionless-voter-auth-modal`  
**Jira Issue**: [VS-27](https://the-three-devsketeers.atlassian.net/browse/VS-27)

---

## 1. Architecture & Component Mapping

### A. Intent Management

- Create `src/features/voting/utils/vote-intent.ts`:
  - `savePendingVoteIntent(intent: PendingVoteIntent): void`
  - `getPendingVoteIntent(): PendingVoteIntent | null`
  - `clearPendingVoteIntent(): void`
- Create `src/features/voting/hooks/use-pending-vote-intent.ts`:
  - Automatically consumes stored intent upon page load if user is authenticated and executes the vote action with toast confirmation.

### B. UI Component Refactoring & Branding

- Refactor `src/features/auth/components/OmnichannelAuthModal.tsx`:
  - Convert all elements to strict zero-radius (`rounded-none`).
  - Align with Electa Opal light theme default + dark mode scoping.
  - Integrate brand typography (`font-heading`, `font-sans`, `font-mono`).
  - Save pending vote intent prior to initiating OAuth redirect.
- Update `src/features/voting/components/AuthPromptModal.tsx`:
  - Forward `onSuccess` callback to `OmnichannelAuthModal`.
  - Accept structured `voteIntent` prop.
- Update `src/features/voting/components/FreeVoteButton.tsx`:
  - On 401 / `NOT_AUTHENTICATED`, open `AuthPromptModal` with an `onSuccess` handler that triggers `castVote` immediately upon successful verification.

---

## 2. Test Plan

- Unit tests in `tests/unit/voting/vote-intent.test.ts`:
  - Test saving, retrieving, validating, and clearing vote intent from `sessionStorage`.
- Unit tests in `tests/unit/auth/omnichannel-auth-modal.test.tsx` and `tests/unit/voting/auth-prompt-modal.test.tsx`:
  - Verify modal rendering, zero-radius styling classes, callback propagation on success.
