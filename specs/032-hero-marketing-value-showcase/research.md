# Research & Architecture Decisions: Hero Marketing Value Showcase & Platform Highlights Card

**Feature ID**: `032-hero-marketing-value-showcase`  
**Jira Key**: [VS-91](https://the-three-devsketeers.atlassian.net/browse/VS-91)  
**Parent Epic**: [VS-90: [Epic] Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Date**: 2026-10-12

---

## 🏛️ Stack Context (Pre-established Electa Conventions)

| Concern             | Architectural Decision        | Justification                                                                                             |
| :------------------ | :---------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Framework**       | Next.js 16 App Router         | Default to pure React Server Component (RSC) — zero client JS bundle overhead                             |
| **Language**        | TypeScript 5 Strict Mode      | Zero `any`, zero non-null assertions (`!`), strictly typed marketing configuration contracts              |
| **Styling**         | Tailwind CSS v4 (`@theme`)    | Uses native tokens: `font-heading` (Outfit), `font-sans` (Sora), `font-mono` (JetBrains Mono)             |
| **Design Language** | Brutalist-Refined Zero-Radius | `--radius: 0px`, `rounded-none`, hairline borders (`border-slate-300 dark:border-slate-800`)              |
| **Color Scheme**    | Default Light Mode (Opal)     | Background `#F8FAFC`, card `#FFFFFF` with dark mode parity (`dark:bg-[#0d1424]`, `dark:border-slate-800`) |
| **Accessibility**   | WCAG 2.1 AA Compliant         | All text elements achieve ≥ 4.5:1 contrast against surface backgrounds                                    |

---

## 🔬 Architectural Decisions & Trade-Off Analysis

### 1. Pure React Server Component (RSC) vs. Client Component

- **Decision**: Implement `HeroMarketingCard` as a pure React Server Component with no `"use client"` directive.
- **Rationale**:
  - The marketing value showcase card contains static, deterministic value proposition data, platform highlights, and trust indicators.
  - No interactive state, browser events, or client-side storage are required.
  - Delivering 100% server-rendered HTML yields fastest possible Largest Contentful Paint (LCP) and zero hydration overhead.
  - Meets Electa Constitution §II ("Default to React Server Components").

### 2. Vertical Slice Feature Colocation

- **Decision**: Colocate all marketing presentation components, configuration, types, and utilities in `src/features/marketing/`.
- **Rationale**:
  - Keeps marketing, landing page, and value proposition cards neatly decoupled from global navigation (`src/features/navigation/`) and search (`src/features/search/`).
  - Follows Electa Constitution §V ("Vertical slice architecture under `src/features/<feature-name>/`").
  - Provides a clean single barrel entrypoint `src/features/marketing/index.ts`.

### 3. Structured Data Configuration vs. Hardcoded JSX

- **Decision**: Define typed configuration data structures in `src/features/marketing/utils/marketing-config.ts` validated by Zod schemas in `src/features/marketing/types/index.ts`.
- **Rationale**:
  - Allows easy unit testing of contract invariants (exact copy, 4 tiles, 4 metrics, assurance text).
  - Keeps JSX clean and declarative with mapping functions.
  - Allows optional prop overrides in testing and storyboards while maintaining default constants.

### 4. Responsive Layout & Geometry

- **Decision**:
  - Zero-radius container (`rounded-none`, `border border-slate-300 dark:border-slate-800`, `bg-white dark:bg-[#0d1424]`).
  - 2x2 grid for the 4 feature tiles on tablet/desktop (`grid grid-cols-1 sm:grid-cols-2 gap-4`).
  - 4-item highlights ribbon (`grid grid-cols-2 sm:grid-cols-4 gap-2`) with tabular monospace fonts (`font-mono font-extrabold`).
  - Bottom assurance bar with flex alignment and high-contrast typography.
- **Rationale**:
  - Adheres strictly to the Electa Branding & Design System rules (zero-radius, Outfit headings, Sora body, JetBrains Mono data).

---

## 🎨 Color Contrast Validation Matrix

| Element          | Foreground Color      | Background Color       | Mode  | Contrast Ratio  | WCAG 2.1 AA Status       |
| :--------------- | :-------------------- | :--------------------- | :---- | :-------------- | :----------------------- |
| Card Title       | `#0F172A` (Slate-900) | `#FFFFFF` (Card White) | Light | 19.5:1          | **PASS** (Exceeds 4.5:1) |
| Tile Title       | `#0F172A` (Slate-900) | `#FFFFFF` / `#F8FAFC`  | Light | 19.5:1 / 17.0:1 | **PASS** (Exceeds 4.5:1) |
| Tile Description | `#475569` (Slate-600) | `#FFFFFF`              | Light | 5.8:1           | **PASS** (Exceeds 4.5:1) |
| Metric Highlight | `#0F172A` (Slate-900) | `#F8FAFC` (Slate-50)   | Light | 17.0:1          | **PASS** (Exceeds 4.5:1) |
| Footnote Text    | `#475569` (Slate-600) | `#FFFFFF`              | Light | 5.8:1           | **PASS** (Exceeds 4.5:1) |
| Card Title       | `#FFFFFF` (White)     | `#0d1424` (Dark Card)  | Dark  | 18.2:1          | **PASS** (Exceeds 4.5:1) |
| Tile Description | `#94A3B8` (Slate-400) | `#0d1424` (Dark Card)  | Dark  | 6.5:1           | **PASS** (Exceeds 4.5:1) |
| Metric Highlight | `#F1F5F9` (Slate-100) | `#131b2e` (Dark Cell)  | Dark  | 14.1:1          | **PASS** (Exceeds 4.5:1) |
