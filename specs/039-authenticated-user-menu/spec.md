# Feature Specification: Authenticated User Account Menu & Dropdown

**Feature ID**: `039-authenticated-user-menu`  
**Ticket**: [VS-107](https://the-three-devsketeers.atlassian.net/browse/VS-107)  
**Parent Epic**: [VS-55 (Authentication)](https://the-three-devsketeers.atlassian.net/browse/VS-55)  
**Status**: Draft  

---

## 1. Overview & Business Value

Currently, `src/features/navigation/components/site-header.tsx` unconditionally displays a static **"Sign In"** button linking to `/login`, regardless of user authentication status. Authenticated users (organizers and voters) have no visual confirmation of their session, cannot see their user profile or avatar in the header, and have no way to access account management or trigger a logout from the top-level navigation.

This specification defines the replacement of the static "Sign In" button with a dynamic, accessible **User Account Navigation** component (`UserAccountNav`). When unauthenticated, visitors see the classic "Sign In" button. When authenticated, users see an interactive Account Profile trigger featuring a circular avatar (or initials badge) and their name, which opens a brutalist zero-radius dropdown menu providing user details, dashboard navigation, and a sign-out action.

---

## 2. User Stories & Acceptance Criteria

### User Story
> **As an** authenticated user (organizer or voter),  
> **I want to** see my circular account avatar and profile trigger in the site header instead of the generic "Sign In" button,  
> **so that** I have immediate visibility of my logged-in status, can access my account settings/dashboard, and can easily log out from any page.

---

### Gherkin Acceptance Scenarios

#### Scenario 1: Unauthenticated Visitor Header (Guest State)
- **Given** a user is not authenticated (`isAuthenticated === false` or `user === null`),
- **When** they view the site header on any page,
- **Then** the existing **"Sign In"** button is displayed linking to `/login`,
- **And** no account dropdown trigger is rendered.

#### Scenario 2: Authenticated User Header (Circular Avatar Trigger)
- **Given** a user is logged in (`isAuthenticated === true` and valid `user` object in `useAuth`),
- **When** they view the site header,
- **Then** the "Sign In" button is replaced by an **Account Profile** trigger button,
- **And** the trigger displays a **circular avatar photo** (`rounded-full aspect-square`) or circular initials fallback when no photo exists,
- **And** on desktop screens, the user's name is displayed alongside a subtle chevron icon.

#### Scenario 3: Account Menu Dropdown Interaction & Accessibility
- **Given** an authenticated user is viewing the header,
- **When** they click or activate the Account Profile trigger with keyboard (`Enter` / `Space`),
- **Then** an accessible zero-radius dropdown menu opens displaying:
  1. User info header (name, email address, and optional role badge),
  2. Quick navigation links (e.g., _Dashboard_, _Create Event_, _Account Settings_),
  3. A distinct **"Sign Out"** / **"Log Out"** action button,
- **And** the dropdown container and menu items strictly follow brutalist zero-radius styling (`rounded-none`),
- **And** pressing `Escape` closes the menu and returns focus to the trigger button,
- **And** clicking outside closes the dropdown menu.

#### Scenario 4: User Logout Flow
- **Given** the account dropdown menu is open,
- **When** the user clicks or activates the **"Sign Out"** button,
- **Then** `logout()` from `useAuth()` is executed,
- **And** client-side session state in Zustand is cleared,
- **And** server session cookies are removed via `logoutAction()`,
- **And** the user is redirected and the header reverts to the "Sign In" button.

---

## 3. Design & Architecture Constraints

1. **Brutalist Zero-Radius Geometry**:
   - In accordance with Electa Design System Rule 2, all dropdown panels, borders, buttons, and menu items must use `rounded-none` and `--radius: 0px`.
   - **Avatar Exception**: Circular user photos and initials badges (`rounded-full aspect-square`) are explicitly permitted per design system rules.

2. **Dual-Theme Parity & WCAG 2.1 AA**:
   - Backgrounds, borders, text, and hover states must have >= 4.5:1 contrast in both Opal Light Mode and Dark Mode.
   - Light mode panel: `bg-white border-slate-300 text-slate-900 shadow-md`.
   - Dark mode panel: `dark:bg-[#0d1424] dark:border-slate-800 dark:text-slate-100`.

3. **Accessibility**:
   - Trigger has `aria-haspopup="menu"`, `aria-expanded={isOpen}`, and descriptive `aria-label`.
   - Menu container has `role="menu"`, items have `role="menuitem"`.
   - Keyboard navigation supports `Escape` to close, `ArrowDown`/`ArrowUp` to cycle focus, and outside click dismissal.

4. **Component Isolation**:
   - Header stays responsive and clean.
   - `UserAccountNav` is a clean client component colocated in `src/features/navigation/components/user-account-nav.tsx`.
