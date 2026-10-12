# Implementation Plan: Hero Marketing Value Showcase & Platform Highlights Card

**Feature ID**: `032-hero-marketing-value-showcase`  
**Jira Key**: [VS-91](https://the-three-devsketeers.atlassian.net/browse/VS-91)  
**Parent Epic**: [VS-90: [Epic] Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Execution Order**: Milestone 1.3 (Landing Page Hero Assembly)  
**Date**: 2026-10-12

---

## 1. Summary & Architecture Strategy

Build the high-impact hero marketing value showcase card (`HeroMarketingCard`) for Electa:

1. Create a dedicated vertical slice feature in `src/features/marketing/` (`components/`, `types/`, `utils/`, `index.ts`).
2. Implement `HeroMarketingCard` as a pure React Server Component (RSC):
   - Zero-radius container (`rounded-none`, `border border-slate-300 dark:border-slate-800`, `bg-white dark:bg-[#0d1424]`).
   - Official credential badge `OFFICIAL VOTING PLATFORM` with sky blue accent indicator.
   - Showcase headline `"WHY ORGANIZERS & FANS CHOOSE ELECTA"` in Outfit font (`font-heading font-black`).
   - 4 value pillar tiles (`Bot & Abuse Protection`, `Live Stage Leaderboard`, `Seamless GCash & Maya`, `Fast Event Setup`) in a 2-column responsive grid.
   - 4 truthful platform metrics (`< 5M EVENT SETUP`, `1-TAP GCASH & MAYA`, `LIVE STAGE TALLY`, `FREE DAILY VOTES`) in a tabular highlights ribbon (`font-mono`).
   - Platform assurance footnote: `"✓ Transparent live tallies • Philippine e-wallets • Instant mobile access"` in Sora font (`font-sans`).
3. Define configuration types and Zod schemas in `src/features/marketing/types/index.ts` and default data constants in `src/features/marketing/utils/marketing-config.ts`.
4. Export `HeroMarketingCard` from `src/features/marketing/index.ts`.
5. Integrate `HeroMarketingCard` into the landing page hero layout in `src/app/page.tsx` within a responsive 2-column grid (`lg:grid-cols-12` or hero split).
6. Write comprehensive unit tests in `tests/unit/marketing/HeroMarketingCard.test.tsx` verifying:
   - Rendering of badge, headline, all 4 tiles, all 4 metrics, and assurance footnote.
   - Zero-radius geometry (`rounded-none` everywhere).
   - WCAG 2.1 AA dual-theme contrast classes.
   - Semantic accessibility structure.

---

## 2. Technical Context & Constraints

- **Framework**: Next.js 16 App Router (pure RSC, zero client JS overhead).
- **TypeScript**: 5.8 Strict Mode (no `any`, no `!`, explicit TypeScript interfaces).
- **Styling**: Tailwind CSS v4 (`bg-linear-to-*`, `rounded-none`, `@theme` typography).
- **Design Rules**: Default to Light Mode root (Opal `#F8FAFC`), crisp white card `#FFFFFF` with dark mode parity (`dark:bg-[#0d1424]`). Strict zero-radius (`rounded-none`).
- **Typography**: Outfit for headings/badges, Sora for descriptions, JetBrains Mono for metrics.
- **Accessibility**: WCAG 2.1 AA color contrast compliance in both light and dark themes.

---

## 3. Constitution Check

| Principle                                  | Check / Rule                                         | Status   | Notes                                                       |
| :----------------------------------------- | :--------------------------------------------------- | :------- | :---------------------------------------------------------- |
| **§I. Strict Type Safety**                 | Zero `any`, zero `!`, explicit TypeScript interfaces | **PASS** | Validated via Zod schemas and TypeScript strict mode        |
| **§II. Server-First & Boundary Isolation** | Server Components default; zero client JavaScript    | **PASS** | `HeroMarketingCard` is 100% React Server Component          |
| **§III. Single Source of Truth**           | Marketing data configured in `marketing-config.ts`   | **PASS** | Single canonical source of truth for marketing copy         |
| **§IV. Secure-by-Design**                  | No raw process.env, sanitized static content         | **PASS** | Static presentation without user injection vectors          |
| **§V. Feature Colocation**                 | Vertical slice in `src/features/marketing/`          | **PASS** | Modular, colocated components, types, and utils             |
| **§VI. Test-First Quality Gates**          | Unit tests in `tests/unit/marketing/`                | **PASS** | Vitest testing component rendering, copy, and accessibility |

---

## 4. Component Mapping & File Structure

```text
src/
├── features/
│   └── marketing/
│       ├── components/
│       │   ├── HeroMarketingCard.tsx       # Main marketing showcase card (VS-91)
│       │   ├── FeatureTile.tsx             # Individual value pillar tile
│       │   ├── HighlightsRibbon.tsx        # 4-metric tabular highlights ribbon
│       │   └── index.ts                    # Component exports
│       ├── types/
│       │   └── index.ts                    # TypeScript interfaces & Zod schemas
│       ├── utils/
│       │   ├── marketing-config.ts         # Default marketing content configuration
│       │   └── index.ts                    # Utils barrel export
│       └── index.ts                        # Feature barrel export
tests/
└── unit/
    └── marketing/
        └── HeroMarketingCard.test.tsx      # Comprehensive unit tests for HeroMarketingCard
```
