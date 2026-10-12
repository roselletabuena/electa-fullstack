# Research & Architecture Decisions: Accessible Site Footer

**Feature ID**: `031-accessible-site-footer`  
**Jira Key**: [VS-89](https://the-three-devsketeers.atlassian.net/browse/VS-89)  
**Parent Epic**: [VS-86: [UI Components] Core Global Shell: Navigation Bar, Search Bar, and Footer](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Date**: 2026-10-12

---

## 🏛️ Stack Context (Pre-established Electa Conventions)

| Concern             | Architectural Decision           | Justification                                                                                   |
| :------------------ | :------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Framework**       | Next.js 16 App Router            | Default to pure React Server Component (RSC) — zero client JS bundle overhead                   |
| **Language**        | TypeScript 5 Strict Mode         | Zero `any`, zero non-null assertions (`!`), strictly typed footer configuration schemas         |
| **Styling**         | Tailwind CSS v4 (`@theme`)       | Uses native tokens: `font-heading` (Outfit), `font-sans` (Sora), `font-mono` (JetBrains Mono)   |
| **Design Language** | Brutalist-Refined Zero-Radius    | `--radius: 0px`, `rounded-none`, hairline borders (`border-slate-800`)                          |
| **Color Scheme**    | Deep Obsidian Anchor (`#0F172A`) | Solid grounding footer providing visual finality, institutional trust, and high contrast        |
| **Accessibility**   | WCAG 2.1 AA Compliant            | All text elements achieve ≥ 4.5:1 contrast against `#0F172A`, minimum 44px mobile touch targets |

---

## 🔬 Architectural Decisions & Trade-Off Analysis

### 1. React Server Component (RSC) vs. Client Component

- **Decision**: Implement `SiteFooter` as a pure React Server Component without `"use client"`.
- **Rationale**:
  - The footer directory links, brand information, and legal copyright notices are static and deterministic.
  - Zero hydration overhead: no client bundle penalty, no re-rendering on client state changes.
  - Full SEO and search bot crawlability for all platform and legal links.
  - Instant server-rendered HTML delivery.

### 2. Branding Asset Rendering Strategy

- **Decision**: Render the official Electa logo symbol (`/electa-logo-dark.svg` or `ElectaSymbol` SVG) coupled with semantic text elements.
- **Rationale**:
  - `electa-logo-dark.svg` is specifically optimized for `#0F172A` dark surfaces with `#F8FAFC` bracket geometry and `#38BDF8` sky blue checkmark.
  - Provides crisp vector rendering at any scale without raster pixelation.

### 3. Navigation Group Schema & Extensibility

- **Decision**: Colocate footer link data structures in `src/features/navigation/types/index.ts` and define configuration constants in `src/features/navigation/utils/footer-config.ts`.
- **Rationale**:
  - Keeps the navigation shell modular and maintainable.
  - Allows easy additions to directory columns (e.g. new developer links, legal policies) without touching the presentation JSX.
  - Supports unit testing of configuration schema validation using Zod.

### 4. Responsive Layout & Mobile Stacking Strategy

- **Decision**:
  - Desktop (`lg:` ≥ 1024px): 5-column grid (`grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12`) with brand on column 1 and the 4 directory groups spanning columns 2-5.
  - Tablet (`sm:` 640px - 1023px): 2-to-3 column responsive grid.
  - Mobile (`< 640px`): Single-column stack (`flex flex-col gap-8`) with minimum 44px vertical touch targets for effortless navigation on mobile touchscreens.
- **Rationale**:
  - Simple CSS Grid / Flexbox without requiring JavaScript accordion toggles maintains zero runtime script overhead while ensuring exceptional readability.

---

## 🎨 Color Contrast Validation Matrix

| Element               | Foreground              | Background | Contrast Ratio | WCAG 2.1 AA | WCAG 2.1 AAA |
| :-------------------- | :---------------------- | :--------- | :------------- | :---------- | :----------- |
| Brand Wordmark        | `#FFFFFF`               | `#0F172A`  | 18.2:1         | ✅ PASS     | ✅ PASS      |
| Directory Headings    | `#F8FAFC` (`slate-50`)  | `#0F172A`  | 17.5:1         | ✅ PASS     | ✅ PASS      |
| Brand Tagline         | `#38BDF8` (`sky-400`)   | `#0F172A`  | 8.41:1         | ✅ PASS     | ✅ PASS      |
| Directory Links       | `#CBD5E1` (`slate-300`) | `#0F172A`  | 12.02:1        | ✅ PASS     | ✅ PASS      |
| Secondary / Copyright | `#94A3B8` (`slate-400`) | `#0F172A`  | 6.96:1         | ✅ PASS     | ✅ PASS      |
| Status Indicator      | `#4ADE80` (`green-400`) | `#0F172A`  | 10.15:1        | ✅ PASS     | ✅ PASS      |
