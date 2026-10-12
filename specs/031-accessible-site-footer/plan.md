# Implementation Plan: Accessible Site Footer with Official Brand Tagline, Copyright & Directory Links

**Feature ID**: `031-accessible-site-footer`  
**Jira Key**: [VS-89](https://the-three-devsketeers.atlassian.net/browse/VS-89)  
**Parent Epic**: [VS-86: [UI Components] Core Global Shell: Navigation Bar, Search Bar, and Footer](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Execution Order**: Milestone 1.3 (Foundational Global Shell)  
**Date**: 2026-10-12

---

## 1. Summary & Architecture Strategy

Build the persistent, accessible global footer component (`SiteFooter`) for Electa:

1. Colocate the feature slice in `src/features/navigation/` (`components/`, `types/`, `utils/`).
2. Implement `SiteFooter` as a React Server Component (RSC):
   - Grounded container with deep obsidian background `#0F172A` and hairline top border (`border-t border-slate-800`).
   - Left brand block rendering official emblem (`/electa-logo-dark.svg`), wordmark `ELECTA`, tagline _"Vote. Engage. Celebrate."_ (`text-sky-400 font-bold uppercase`), and platform summary.
   - 4 directory columns: Explore, Organizers, Platform, Legal with semantic links and accessible touch targets (≥ 44px).
   - Bottom bar with legal copyright notice (`© 2026 Electa Platform. All Rights Reserved.`) in JetBrains Mono (`font-mono`) and live audit integrity indicator.
3. Define configuration types and Zod schemas in `src/features/navigation/types/index.ts` and standard data constants in `src/features/navigation/utils/footer-config.ts`.
4. Export `SiteFooter` from `src/features/navigation/index.ts`.
5. Integrate `SiteFooter` into public pages (e.g. `src/app/page.tsx`) to anchor the global shell.
6. Write unit tests in `tests/unit/navigation/site-footer.test.tsx` verifying brand assets, directory groups, link paths, zero-radius geometry, WCAG 2.1 AA contrast compliance, and keyboard accessibility.

---

## 2. Technical Context & Constraints

- **Framework**: Next.js 16 App Router (pure RSC, zero client JS overhead).
- **TypeScript**: 5.8 Strict Mode (no `any`, no `!`, explicit TypeScript interfaces).
- **Styling**: Tailwind CSS v4 (`bg-linear-to-*`, `rounded-none`, `@theme` typography).
- **Design Rules**: Default to Light Mode root, with `#0F172A` deep obsidian grounded footer. Strict zero-radius (`rounded-none`).
- **Typography**: Outfit for headings, Sora for body/links, JetBrains Mono for copyright and metadata.
- **Accessibility**: WCAG 2.1 AA color contrast (all foreground text ≥ 4.5:1 against `#0F172A`), minimum 44px mobile touch targets.

---

## 3. Constitution Check

| Principle                                  | Check / Rule                                             | Status   | Notes                                                        |
| :----------------------------------------- | :------------------------------------------------------- | :------- | :----------------------------------------------------------- |
| **§I. Strict Type Safety**                 | Zero `any`, zero `!`, explicit TypeScript interfaces     | **PASS** | Validated via Zod schemas and TypeScript strict mode         |
| **§II. Server-First & Boundary Isolation** | Server Components default; zero client JavaScript        | **PASS** | `SiteFooter` is 100% React Server Component                  |
| **§III. Single Source of Truth**           | Navigation/directory links managed in `footer-config.ts` | **PASS** | Single canonical source of truth for footer links            |
| **§IV. Secure-by-Design**                  | Safe relative routes, secure external links              | **PASS** | Sanitized hrefs, `rel="noopener noreferrer"`                 |
| **§V. Feature Colocation**                 | Vertical slice in `src/features/navigation/`             | **PASS** | Colocated with existing navigation shell components          |
| **§VI. Test-First Quality Gates**          | Unit tests in `tests/unit/navigation/`                   | **PASS** | Vitest testing component rendering, links, and accessibility |

---

## 4. Component Mapping & File Structure

```text
src/
├── features/
│   └── navigation/
│       ├── components/
│       │   ├── site-header.tsx         # Persistent top header (VS-87)
│       │   ├── site-footer.tsx         # Persistent accessible footer (VS-89)
│       │   └── brand-mark.tsx          # Brand mark with logo, title, and tagline
│       ├── types/
│       │   └── index.ts                # TypeScript interfaces & Zod schemas
│       ├── utils/
│       │   ├── nav-config.ts           # Header navigation configuration
│       │   └── footer-config.ts        # Footer directory links & metadata configuration
│       └── index.ts                    # Feature barrel export
tests/
└── unit/
    └── navigation/
        └── site-footer.test.tsx        # Comprehensive unit tests for SiteFooter
```
