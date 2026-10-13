# Implementation Tasks: Authenticated User Account Menu & Dropdown

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)  
**Parent Epic**: [VS-55](https://the-three-devsketeers.atlassian.net/browse/VS-55)  
**Branch**: `feature/VS-107-authenticated-user-menu`  

---

## Phase 1: Setup & Contracts

**Purpose**: Define the types and utility helpers for avatar initials and account menu.

- [x] T001 Define `UserAccountNavProps` and related navigation types in `src/features/navigation/types/index.ts`
- [x] T002 Implement `getInitials` helper in `src/features/navigation/utils/avatar-helper.ts`
- [x] T003 Implement unit test for `getInitials` helper in `tests/unit/navigation/avatar-helper.test.ts`

---

## Phase 2: Foundational Components

**Purpose**: Build the user avatar component and interactive account menu dropdown.

- [x] T004 Implement `UserAvatar` component in `src/features/navigation/components/user-avatar.tsx` with circular geometry (`rounded-full aspect-square`) and fallback initials
- [x] T005 Implement `UserAccountNav` component in `src/features/navigation/components/user-account-nav.tsx` supporting guest state ("Sign In" link) and authenticated state (circular avatar trigger, zero-radius dropdown, user info header, navigation links, and logout action)
- [x] T006 Export `UserAvatar` and `UserAccountNav` in `src/features/navigation/index.ts`

---

## Phase 3: SiteHeader Integration

**Purpose**: Integrate `UserAccountNav` into `SiteHeader`.

- [x] T007 Update `src/features/navigation/components/site-header.tsx` to conditionally render `UserAccountNav` replacing the static "Sign In" button
- [x] T008 Support optional `user` prop in `SiteHeader` for SSR/testing flexibility while defaulting to `useAuth()` state

---

## Phase 4: Unit Testing & Accessibility Verification

**Purpose**: Write comprehensive unit tests covering all acceptance criteria and edge cases.

- [x] T009 Implement unit tests in `tests/unit/navigation/user-account-nav.test.tsx` verifying:
  - Guest state renders "Sign In" button linking to `/login`
  - Authenticated state renders Account Profile trigger with circular avatar
  - Circular initials fallback rendered when `avatarUrl` is absent
  - Dropdown menu toggles open and closed on click and keyboard interaction (`Escape` key closes)
  - User name, email, and role badge rendered in menu header
  - Logout action invoked on "Sign Out" click
  - Strict zero-radius styling (`rounded-none`) on dropdown panel and items
- [x] T010 Update `tests/unit/navigation/site-header.test.tsx` to verify integration with both guest and authenticated user states

---

## Phase 5: Verification & Quality Gates

**Purpose**: Execute verification suite, formatting, linting, typechecking, and prepare commit.

- [x] T011 Run unit tests: `npm run test:unit tests/unit/navigation/`
- [x] T012 Run full test suite: `npm run test:unit`
- [x] T013 Run strict typecheck: `npm run typecheck`
- [x] T014 Run linter: `npm run lint`
