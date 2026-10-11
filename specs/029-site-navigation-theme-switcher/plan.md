# Implementation Plan: Responsive Site Navigation Bar with Electa Brand Mark & Theme Switcher

**Feature ID**: `029-site-navigation-theme-switcher`  
**Jira Key**: [VS-87](https://the-three-devsketeers.atlassian.net/browse/VS-87)  
**Parent Epic**: [VS-90: Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Execution Order**: Milestone 1.1 (Foundational Global Shell)  
**Date**: 2026-10-11  

---

## 1. Summary & Architecture Strategy

Build the foundational, responsive top navigation header (`SiteHeader`) for Electa:
1. Colocate the feature slice in `src/features/navigation/` (`components/`, `types/`, `utils/`).
2. Implement `SiteHeader` with:
   - Sticky top container (`sticky top-0 z-50 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-xs border-b border-slate-300 dark:border-slate-800`).
   - Brand mark using `ElectaSymbol` or `electa-logo.svg`, wordmark `ELECTA`, and tagline `VOTE · ENGAGE · CELEBRATE`.
   - Actions group: `ThemeToggle`, `+ CREATE EVENT` (`/events/new`), and `SIGN IN` (`/login`).
   - Responsive breakpoints (hides tagline on mobile, compact actions).
3. Enhance `ThemeToggle` to support an icon-only square button variant (`variant="icon"`, 36x36px / 40x40px) matching the brutalist design in `public/mockup-realistic.html` (`btn-theme`).
4. Integrate `SiteHeader` into the root public homepage (`src/app/page.tsx`).
5. Provide standard `ApiResponse<T>` route handler at `src/app/api/navigation/route.ts` for navigation items and platform status.
6. Write comprehensive unit tests in `tests/unit/navigation/site-header.test.tsx` verifying brand rendering, navigation links, theme toggle interactions, zero-radius classes, and accessibility.

---

## 2. Technical Context & Constraints

- **Framework**: Next.js 16 App Router (RSC container with client islands).
- **TypeScript**: 5.8 Strict Mode (no `any`, no `!`, explicit interfaces).
- **Styling**: Tailwind CSS v4 (`bg-linear-to-*`, `rounded-none`, `@theme` typography).
- **Design Rules**: Default to Light Mode (Opal `#F8FAFC`), Obsidian Dark Mode (`#090D16`). Zero radius on all components (`rounded-none`).
- **Accessibility**: WCAG 2.1 AA color contrast and keyboard accessibility.

---

## 3. Constitution Check

| Principle | Check / Rule | Status | Notes |
| :--- | :--- | :--- | :--- |
| **§I. Strict Type Safety** | Zero `any`, zero `!`, explicit TypeScript interfaces | **PASS** | Validated via Zod schemas and TypeScript strict compiler |
| **§II. Server-First & Boundary Isolation** | Server Components default; client components isolated | **PASS** | `SiteHeader` is an RSC; `ThemeToggle` is client island |
| **§III. Single Source of Truth** | Server state via TanStack Query / RSC; Client theme via `ThemeProvider` | **PASS** | No unnecessary global store duplication |
| **§IV. Secure-by-Design** | Safe relative URLs, no injection vectors | **PASS** | Strict enum routes (`/events/new`, `/login`, `/`) |
| **§V. Feature Colocation** | Vertical slice in `src/features/navigation/` | **PASS** | All components and types colocated |
| **§VI. Test-First Quality Gates** | Unit tests in `tests/unit/navigation/` | **PASS** | Vitest testing component rendering, themes, and links |

---

## 4. Component Mapping & File Structure

```text
src/
├── features/
│   └── navigation/
│       ├── components/
│       │   ├── site-header.tsx         # Main responsive header component
│       │   └── brand-mark.tsx          # Brand mark with logo, title, and tagline
│       ├── types/
│       │   └── index.ts                # TypeScript interfaces & Zod schemas
│       ├── utils/
│       │   └── nav-config.ts           # Navigation items and default config
│       └── index.ts                    # Feature barrel export
├── components/
│   └── shared/
│       └── theme-toggle.tsx            # Updated to support icon-only variant
└── app/
    ├── api/
    │   └── navigation/
    │       └── route.ts                # Navigation API endpoint
    └── page.tsx                        # Integrated landing page shell
```

---

## 5. Test Plan

- **`tests/unit/navigation/site-header.test.tsx`**:
  - Test 1: Renders Electa brand emblem, title "ELECTA", and tagline "VOTE · ENGAGE · CELEBRATE".
  - Test 2: Renders `+ CREATE EVENT` linking to `/events/new` and `SIGN IN` linking to `/login`.
  - Test 3: Enforces `rounded-none` zero-radius class across all header buttons and links.
  - Test 4: Contains accessible theme toggle button with proper `aria-label`.
  - Test 5: Adapts responsively with proper visibility classes for mobile viewports.
- **`tests/unit/navigation/navigation-route.test.ts`**:
  - Test 1: `GET /api/navigation` returns standard `ApiResponse<SiteHeaderConfig>` with 200 OK.
