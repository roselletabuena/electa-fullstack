# Feature Specification: Global Header & Footer Shell Across Pages

**Feature ID**: `035-global-header-footer-shell`  
**Jira Keys**: [VS-100](https://the-three-devsketeers.atlassian.net/browse/VS-100) (SiteHeader), [VS-101](https://the-three-devsketeers.atlassian.net/browse/VS-101) (SiteFooter)  
**Parent Epic**: [VS-86: Core Global Shell](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Status**: In Progress  
**Created**: 2026-10-13

---

## 🎯 Executive Summary

`SiteHeader` and `SiteFooter` are currently mounted only by the landing page (`src/app/page.tsx`). Event pages, leaderboards, and the organizer dashboard render without brand navigation or footer. This feature applies both across all public and application pages through shared route-group layouts, while keeping the fullscreen stage display chrome-free.

## 👥 Actors

- **Voter / Public Visitor**: needs consistent navigation back home, theme toggle, and primary actions on every page.
- **Organizer**: needs the same shell on dashboard and event management routes.
- **Stage Operator**: needs `/events/[slug]/stage-display` to remain an immersive kiosk with no header/footer.
- **Keyboard & Screen Reader User**: `banner` and `contentinfo` landmarks on every page, WCAG 2.1 AA contrast.

## 📋 Functional Requirements

1. **FR-1 Shared Shell**: A `SiteShell` server component renders `SiteHeader`, a `flex-1` content region, and `SiteFooter variant="streamlined"` inside a `flex min-h-screen flex-col` container.
2. **FR-2 Public Routes**: `src/app/(public)/layout.tsx` wraps all public routes (`/`, `/events/[slug]`, `/events/[slug]/leaderboard`) in `SiteShell`.
3. **FR-3 Dashboard Routes**: `src/app/(dashboard)/layout.tsx` wraps organizer routes in `SiteShell`.
4. **FR-4 Stage Display Exclusion**: `stage-display` moves to the `(fullscreen)` route group (same URL) whose layout adds no chrome.
5. **FR-5 No Duplication**: Pages must not mount their own `SiteHeader`/`SiteFooter` (home page updated).
6. **FR-6 Geometry & Theme**: Zero-radius, dual-theme parity, WCAG 2.1 AA (inherited from existing components).
7. **FR-7 Auth Routes**: `(auth)` keeps its own focused layout and is out of scope.

## 🧪 Acceptance Criteria (Gherkin)

### Scenario 1: Persistent header and footer across routes

- **Given** a visitor opens `/`, `/events/[slug]`, or `/events/[slug]/leaderboard`
- **When** the page renders
- **Then** a `banner` with the Electa brand, `+ Create Event`, and `Sign In` appears at the top
- **And** a `contentinfo` footer appears at the bottom, pinned even on short pages.

### Scenario 2: Dashboard receives the shell

- **Given** an authenticated organizer opens `/dashboard`
- **When** the page renders
- **Then** the same header and footer wrap the dashboard content.

### Scenario 3: Stage display stays chrome-free

- **Given** an operator opens `/events/[slug]/stage-display`
- **When** the page renders
- **Then** no `SiteHeader` or `SiteFooter` is rendered.

### Scenario 4: Theme parity and geometry

- **Given** light or dark mode is active
- **When** inspecting the shell
- **Then** all elements are zero-radius and meet WCAG 2.1 AA contrast.

## ✅ Success Criteria

- `npm run typecheck`, `npm run lint`, `npm run test:unit` pass.
- Exactly one header and one footer per rendered page (none on stage display).
