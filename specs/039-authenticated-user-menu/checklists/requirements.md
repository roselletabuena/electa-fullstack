# Requirements & Quality Checklist: Authenticated User Account Menu

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)

---

## 1. Functional Requirements

- [ ] Header shows standard "Sign In" link when visitor is unauthenticated (`isAuthenticated === false`).
- [ ] Header replaces "Sign In" with interactive Account Profile trigger when authenticated (`isAuthenticated === true`).
- [ ] Circular avatar (`rounded-full aspect-square`) displays user's avatar image if `avatarUrl` is provided.
- [ ] Circular initials fallback badge displays user initials if `avatarUrl` is omitted or null.
- [x] Header displays circular avatar only (`rounded-full aspect-square`) for the account trigger, vertically centered with header action items (no name or chevron in header bar).
- [x] Minimum 36px touch target (`h-9 w-9`) for account trigger button.
- [x] Clicking or keyboard-activating trigger toggles dropdown menu.
- [x] Dropdown displays user info header: full name, email, and role badge (if present).
- [x] Dropdown displays quick navigation item:
  - Link to "Dashboard" (`/dashboard`)
- [x] Dropdown displays dedicated "Sign Out" / "Log Out" button.
- [x] Clicking "Sign Out" clears user session in auth store and invokes `logoutAction()`.

---

## 2. Branding & Design System Compliance

- [ ] Strict zero-radius (`rounded-none`, `--radius: 0px`) applied to dropdown container, dividers, and menu items.
- [ ] Circular geometry (`rounded-full`) is restricted only to the avatar photo and fallback initials container.
- [ ] Headings and prominent UI labels use `font-heading` (`Outfit`), UI text uses `font-sans` (`Sora`), and tabular data/initials use `font-mono` (`JetBrains Mono`).
- [ ] Light mode default background: `#FFFFFF` surface on `#F8FAFC` background with `#CBD5E1` border.
- [ ] Dark mode surface: `#0d1424` / `#090D16` with `#1e293b` / `dark:border-slate-800`.
- [ ] Focus outlines use `focus-visible:outline-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400`.

---

## 3. WCAG 2.1 AA Accessibility Requirements

- [ ] Minimum 4.5:1 text color contrast on light mode and dark mode backgrounds.
- [ ] Trigger button includes proper ARIA attributes: `aria-expanded`, `aria-haspopup="menu"`, and accessible label.
- [ ] Dropdown container uses `role="menu"` with `aria-label`.
- [ ] Menu items use `role="menuitem"`.
- [ ] Supports `Escape` key to close dropdown and restore trigger focus.
- [ ] Supports outside click dismissal.
- [ ] Supports keyboard navigation via arrow keys (`ArrowDown`, `ArrowUp`).

---

## 4. Technical Architecture & Electa Constitution (§I–§VI)

- [ ] Strict TypeScript 5 with zero `any`, zero `as any`, and zero non-null assertions (`!`).
- [ ] Colocated in `src/features/navigation/` under vertical slice architecture.
- [ ] Component re-exports maintained in `src/features/navigation/index.ts`.
- [ ] Server/client boundaries cleanly maintained (`"use client"` on interactive components).
- [ ] 100% test passing in Vitest with unit tests for guest state, authenticated state, keyboard interaction, and logout.
- [ ] Passes `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
