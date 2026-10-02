# Implementation Tasks: Frictionless Voter Authentication Modal (VS-27)

- [x] **Task 1: Vote Intent Storage & Auto-Resumption** `feat(voting): add vote intent storage helpers, hook, and test suite`
  - Create `src/features/voting/utils/vote-intent.ts`
  - Create `src/features/voting/hooks/use-pending-vote-intent.ts`
  - Mount `usePendingVoteIntent` in `src/features/events/components/EventPageClient.tsx`
  - Create `tests/unit/voting/vote-intent.test.ts`

- [x] **Task 2: Google OAuth Route Handler & Tests** `feat(auth): add /api/auth/cognito/initiate route handler`
  - Create `src/app/api/auth/cognito/initiate/route.ts`
  - Add route test in `tests/unit/features/auth/oauth-initiate.test.ts`

- [x] **Task 3: Electa Zero-Radius Google Voter Auth Modal** `refactor(auth): streamline voter auth modal for Google OAuth with Electa Opal design`
  - Streamline `src/features/auth/components/OmnichannelAuthModal.tsx` to zero-radius Google authentication
  - Update `src/features/voting/components/AuthPromptModal.tsx`
  - Update `src/features/voting/components/FreeVoteButton.tsx`
  - Update unit tests in `tests/unit/auth/omnichannel-auth-modal.test.tsx` and `tests/unit/voting/auth-prompt-modal.test.tsx`

- [x] **Task 4: Quality Gate & Verification** `chore(qa): verify test suite, lint, and typecheck`
  - Run `npm run typecheck` (0 errors)
  - Run `npm run test:unit`
  - Run `npm run lint` (0 errors)
