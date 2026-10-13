# Implementation Plan: Authenticated User Account Menu & Dropdown

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)  
**Parent Epic**: [VS-55](https://the-three-devsketeers.atlassian.net/browse/VS-55)  
**Status**: Ready for Implementation  

---

## 1. Architectural Strategy

We will introduce `UserAccountNav` inside `src/features/navigation/components/user-account-nav.tsx` and integrate it into `SiteHeader` (`src/features/navigation/components/site-header.tsx`).

### Core Component Breakdown:
1. **`UserAvatar`** (`src/features/navigation/components/user-avatar.tsx` or internal helper):
   - Renders `rounded-full aspect-square` circular image if `avatarUrl` exists, with `onError` fallback.
   - If no image, renders circular initials badge (`rounded-full aspect-square font-mono text-xs font-bold`) using `getInitials(name, email)`.
2. **`UserAccountNav`** (`src/features/navigation/components/user-account-nav.tsx`):
   - `"use client"` component.
   - Consumes `useAuth()`.
   - If `!isAuthenticated` or `!user`: returns standard "Sign In" link (or null if header handles guest branch).
   - If `isAuthenticated`: renders interactive trigger button with circular avatar, display name, chevron icon, `aria-expanded`, and zero-radius dropdown panel.
   - Dropdown panel contains:
     - Header: user display name, email, role badge.
     - Divider (`border-slate-200 dark:border-slate-800`).
     - Quick links: Dashboard (`/dashboard`), Create Event (`/events/new`).
     - Divider.
     - Sign Out button: calls `logout()`.
   - Keyboard accessibility: `Escape` key closes dropdown and focuses trigger; clicking outside closes dropdown.
3. **`SiteHeader` Integration** (`src/features/navigation/components/site-header.tsx`):
   - Delegates the account action area to `UserAccountNav`.
   - Allows passing `user` prop to `SiteHeader` if desired or let `UserAccountNav` connect to `useAuth()`.
   - Preserves existing `showActions`, `showThemeToggle`, and `+ Create Event` link.
4. **Export & Types**:
   - Add types to `src/features/navigation/types/index.ts`.
   - Export `UserAccountNav` from `src/features/navigation/index.ts`.
5. **Testing**:
   - Comprehensive unit tests in `tests/unit/navigation/user-account-nav.test.tsx` and updated `tests/unit/navigation/site-header.test.tsx`.

---

## 2. Design System & Accessibility Guardrails

- **Zero-Radius Rule**: Menu panel, menu items, dividers, and action buttons must be `rounded-none`.
- **Avatar Exception**: Avatar image and initials circle are `rounded-full aspect-square`.
- **Dual-Theme Contrast**: WCAG 2.1 AA compliant across both light mode and dark mode.
- **Font Stack**: `font-heading` (`Outfit`), `font-sans` (`Sora`), and `font-mono` (`JetBrains Mono`).

---

## 3. Phased Implementation Roadmap

- **Phase 1**: Types & Contracts (`src/features/navigation/types/index.ts`).
- **Phase 2**: Avatar & Initials Helper (`src/features/navigation/utils/avatar-helper.ts`).
- **Phase 3**: User Account Nav Component (`src/features/navigation/components/user-account-nav.tsx`).
- **Phase 4**: SiteHeader Integration (`src/features/navigation/components/site-header.tsx`).
- **Phase 5**: Unit Tests (`tests/unit/navigation/user-account-nav.test.tsx`, `tests/unit/navigation/site-header.test.tsx`).
- **Phase 6**: Verification Gates (`test:unit`, `typecheck`, `lint`).
