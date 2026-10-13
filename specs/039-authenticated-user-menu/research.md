# Research & Technical Analysis: Authenticated User Account Menu & Dropdown

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)  

---

## 1. Existing Navigation Architecture

### Current Header Implementation (`src/features/navigation/components/site-header.tsx`)
- Renders `BrandMark` on the left.
- When `showActions` is true, renders:
  - Optional `ThemeToggle`
  - `+ Create Event` link (`/events/new`)
  - Static `Sign In` button (`/login`)
- Currently does not inspect auth state (`useAuth` or session).

### Existing Auth Subsystem (`src/features/auth/`)
- `useAuth()` hook (`src/features/auth/hooks/use-auth.ts`):
  - Returns `{ user, isAuthenticated, setUser, logout }`.
  - Backed by Zustand `useAuthStore` (`src/features/auth/stores/auth-store.ts`).
  - `logout()` invokes `clearStore()` then `await logoutAction()`.
- `logoutAction()` (`src/features/auth/actions/logout-action.ts`):
  - Server action that deletes `electa_auth_session` and `vs_auth_session` cookies.
  - Redirects to `/login`.
- `UserSessionDto` (`src/features/auth/types/index.ts`):
  - `userId: string`
  - `email: string`
  - `name: string`
  - `role?: UserRole | undefined` ("USER" | "ORGANIZER" | "VOTER" | "ADMIN")
  - `avatarUrl?: string | null | undefined`
  - `organizationName?: string | null | undefined`
  - `expiresAt: string`

---

## 2. Avatar Design & Fallback Strategy

Per Electa Design System guidelines:
- Strict zero-radius applies to all containers, buttons, cards, menus, and badges.
- **Explicit exception**: Circular avatars (`rounded-full aspect-square`) for user photos and initial badges.
- Initial calculation:
  - If `name` is provided (e.g., "John Doe"), extract uppercase initials ("JD").
  - If single name or email (e.g., "jane@example.com"), extract "J".
  - If neither, default to "U".
- Contrast requirement: Initials container should use accessible high-contrast palette:
  - Light mode: `bg-slate-100 text-slate-900 border border-slate-300 font-bold font-mono`
  - Dark mode: `dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700`

---

## 3. Dropdown Menu Mechanics & Accessibility

1. **State & Ref Management**:
   - `isOpen` boolean state.
   - Ref attached to container for outside-click detection via `pointerdown`/`click` event listener.
   - `Escape` key listener on container/trigger closes menu and restores trigger focus.
   - Arrow keys (`ArrowDown`, `ArrowUp`) allow cycling focus through menu items.
2. **Keyboard Navigation & ARIA**:
   - Trigger: `button` with `type="button"`, `aria-haspopup="menu"`, `aria-expanded={isOpen}`, `aria-controls="user-account-dropdown"`.
   - Menu: `id="user-account-dropdown"`, `role="menu"`, `aria-label="User account actions"`.
   - Items: `role="menuitem"`, `tabIndex={0}`, with hover & focus visual styles matching brutalist zero-radius guidelines (`hover:bg-slate-100 dark:hover:bg-slate-800/80`).
3. **Hydration & SSR Compatibility**:
   - `useAuthStore` runs on client. To prevent hydration mismatches, ensure graceful fallback or client-mounted check so server render matches initial unauthenticated or suspended state smoothly.

---

## 4. Verification Strategy

- Unit tests in `tests/unit/navigation/user-account-nav.test.tsx` and updated `site-header.test.tsx`:
  1. Renders "Sign In" when `isAuthenticated === false`.
  2. Renders user avatar and name trigger when `isAuthenticated === true`.
  3. Displays circular avatar image when `avatarUrl` is provided.
  4. Displays initials fallback when `avatarUrl` is null/undefined.
  5. Opens dropdown menu on click or Enter key.
  6. Displays user email and navigation links in dropdown.
  7. Invokes `logout` when "Sign Out" button is clicked.
  8. Closes menu when `Escape` key is pressed or click happens outside.
  9. Strict compliance with `rounded-none` for menu panel and items.
