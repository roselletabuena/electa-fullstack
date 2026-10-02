# Implementation Tasks: Frictionless Voter Authentication Modal (VS-27)

- [x] **Task 1: Vote Intent Utilities & Unit Tests** `feat(voting): add vote intent storage helpers and test suite`
  - Create `src/features/voting/utils/vote-intent.ts`
  - Create `tests/unit/voting/vote-intent.test.ts`
  - Run unit tests to verify storage and serialization invariants

- [x] **Task 2: Electa Branding & Zero-Radius Refactor of OmnichannelAuthModal** `refactor(auth): align OmnichannelAuthModal with Electa zero-radius Opal design system`
  - Refactor `src/features/auth/components/OmnichannelAuthModal.tsx` to `rounded-none`, brand typography, accessible colors, and intent preservation on social redirects
  - Create/update unit tests in `tests/unit/auth/omnichannel-auth-modal.test.tsx`

- [x] **Task 3: AuthPromptModal & FreeVoteButton Seamless Continuation** `feat(voting): integrate automatic post-auth vote execution into FreeVoteButton and AuthPromptModal`
  - Update `src/features/voting/components/AuthPromptModal.tsx`
  - Update `src/features/voting/components/FreeVoteButton.tsx` to pass `onSuccess` callback that immediately triggers `castVote`
  - Create `src/features/voting/hooks/use-pending-vote-intent.ts`

- [x] **Task 4: Quality Gate & Verification** `chore(qa): verify test suite, lint, and typecheck`
  - Run `npm run typecheck` (0 errors)
  - Run `npm run test:unit` (59/59 test files, 275/275 tests passed)
  - Run `npm run lint` (0 errors)
