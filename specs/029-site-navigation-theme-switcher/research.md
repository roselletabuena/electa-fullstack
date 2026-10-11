# Research & Architecture Decisions: Responsive Site Navigation Bar with Electa Brand Mark & Theme Switcher

**Feature ID**: `029-site-navigation-theme-switcher`  
**Jira Key**: [VS-87](https://the-three-devsketeers.atlassian.net/browse/VS-87)  
**Date**: 2026-10-11  

---

## 🏛️ Stack Context (Pre-established Electa Conventions)

| Concern | Architectural Decision | Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 App Router | Default to Server Component shell (`SiteHeader`) with small client interactive islands (`ThemeToggle`, mobile nav hooks) |
| **Language** | TypeScript 5 Strict Mode | Zero `any`, zero non-null assertions (`!`), explicit component props interfaces |
| **Styling** | Tailwind CSS v4 (`@theme`) | Uses native tokens: `font-heading` (Outfit), `font-sans` (Sora), `font-mono` (JetBrains Mono) |
| **Design Language** | Brutalist-Refined Zero-Radius | `--radius: 0px`, `rounded-none`, hairline borders (`border-slate-300 dark:border-slate-800`) |
| **Theme System** | Opal Light (Default) + Obsidian Dark | Root `<html>` class toggle (`light` / `dark`), persistent via `localStorage` (`electa-theme`) |
| **Accessibility** | WCAG 2.1 AA | Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for graphical UI elements, touch targets ≥ 44px |

---

## 🔬 Architectural Decisions & Trade-Off Analysis

### 1. RSC Navigation Container vs. Client Header Component
- **Decision**: Implement `SiteHeader` as a Server Component for the structural container and layout grid, delegating the theme toggle to the client component `ThemeToggle`.
- **Rationale**:
  - Maximizes initial HTML delivery and avoids client hydration delay for branding and navigation links (`/events/new`, `/login`).
  - Search engine crawlers receive full brand anchor links and hierarchy without JavaScript execution.
  - Zero Cumulative Layout Shift (CLS) on initial paint.

### 2. Branding Asset Rendering Strategy
- **Decision**: Utilize the existing `ElectaSymbol` SVG component (`src/components/shared/electa-symbol.tsx`) alongside semantic `next/link` and image fallback (`/electa-logo.svg`).
- **Rationale**:
  - `ElectaSymbol` uses pure SVG paths with theme-adaptive classes (`fill-slate-900 dark:fill-slate-100`, `stroke-sky-600 dark:stroke-sky-400`), completely eliminating raster image scaling artifacts or dark-mode inversion filters.
  - Guarantees 0ms logo rendering without network roundtrips.

### 3. Theme Toggle Interaction & State Persistence
- **Decision**: Integrate with the existing `ThemeProvider` (`src/components/shared/theme-provider.tsx`) and extend `ThemeToggle` to support both standard button and compact icon-only navigation variants (`variant="icon" | "pill"`).
- **Rationale**:
  - Root layout (`src/app/layout.tsx`) already contains the zero-flash initialization script and `ThemeProvider` wrapper.
  - Supports `showLabel={false}` for compact header layouts matching `public/mockup-realistic.html` (`btn-theme`).

### 4. Responsive Viewport Breakpoint Behavior
- **Decision**:
  - On desktop (`md:` / `lg:`): Brand mark shows both `ELECTA` title and `VOTE · ENGAGE · CELEBRATE` tagline. Both `+ Create Event` and `Sign In` are fully spelled out.
  - On mobile (`< 640px`): Tagline is hidden via `hidden sm:block`. The `+ Create Event` button displays compact text (`+ Event` or icon on extra narrow screens) while preserving full touch target hit areas (`min-h-[40px] sm:min-h-[36px]`).
- **Alternatives Considered**: Full flyout hamburger drawer.
  - *Discarded for Milestone 1.1*: The header currently has only 2 navigation actions (`+ Create Event`, `Sign In`). A full drawer adds unnecessary complexity and taps for a 2-button header. Responsive inline compaction matches `mockup-realistic.html` exactly.
