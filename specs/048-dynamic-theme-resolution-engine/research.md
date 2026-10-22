# Technical Research & Decision Log: Dynamic Event Theming Engine

**Feature ID**: `048-dynamic-theme-resolution-engine`  
**Ticket**: [VS-120](https://the-three-devsketeers.atlassian.net/browse/VS-120)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Status**: Completed  
**Date**: 2026-10-22  

---

## 1. Context & Research Goals

Electa's public event experience (`/events/[slug]`) requires the ability to switch between visual themes (e.g. Electa standard brutalist-refined light mode vs. Pageant Editorial haute-couture skin). We researched:
1. Optimal token injection mechanism for Next.js 16 App Router preventing FOUT and CLS.
2. Token naming and structure bridging Tailwind CSS v4 and dynamic CSS custom properties.
3. Database migration safety and backward compatibility for Postgres/Prisma.
4. Resilient error-handling patterns for unknown or deprecated theme strings.

---

## 2. Technology Evaluations & Architectural Decisions

### Decision 1: Token Injection Mechanism — Scoped CSS Variables on `data-event-theme`
- **Options Evaluated**:
  1. *Class toggling on `<body>` (e.g. `theme-pageant`)*: Requires client-side DOM mutation or modifying root layout, which leaks across route transitions and causes FOUT if SSR doesn't synchronize.
  2. *CSS-in-JS (Emotion / styled-components)*: Incompatible with Next.js 16 Server Components and introduces runtime overhead and bundle bloat.
  3. *Scoped CSS custom properties on server-rendered container element (`data-event-theme`)*: **SELECTED**.
- **Rationale**:
  - Embedding CSS custom properties directly on `<div data-event-theme="..." style={cssVars}>` in Server Component markup guarantees that styles are defined *before* first paint.
  - Zero CLS and zero FOUT.
  - Isolates event theming to the event container without altering global layout elements.

---

### Decision 2: Theme Token Taxonomy & Structural Symmetry
- **Token Taxonomy**:
  Each theme implements a standardized `ThemeTokens` interface:
  - `bgBase`: Primary page background.
  - `bgSurface`: Card and panel surface background.
  - `bgSurfaceElevated`: Floating modals and active dropdowns.
  - `bgSurfaceHover`: Interactive element hover state.
  - `borderHairline`: Subtle structure and partition borders.
  - `borderAccent`: Highlight and focus borders.
  - `accentPrimary`: Primary brand action color (Sky Blue `#0284C7` for Electa Default, Champagne `#CBB279` for Pageant Editorial).
  - `accentSecondary`: Complementary tone.
  - `accentMuted`: Low-intensity accent for badges and subtle tags.
  - `textPrimary`: High-contrast readable body/heading text.
  - `textSecondary`: Medium-contrast secondary text.
  - `textTertiary`: Low-contrast captions and timestamps.
  - `fontHeading`: Heading font stack.
  - `fontBody`: Body font stack.
  - `fontSerif`: Serif font stack for editorial elements.
  - `radiusSm`, `radiusMd`, `radiusLg`, `radiusPill`: Corner geometry tokens.

---

### Decision 3: Database Migration Safety (PostgreSQL / Prisma)
- **Schema Modification**:
  ```prisma
  enum EventTheme {
    ELECTA_DEFAULT
    PAGEANT_EDITORIAL
  }

  model Event {
    ...
    theme EventTheme @default(ELECTA_DEFAULT)
  }
  ```
- **Migration Plan**:
  - `CREATE TYPE "EventTheme" AS ENUM ('ELECTA_DEFAULT', 'PAGEANT_EDITORIAL');`
  - `ALTER TABLE "Event" ADD COLUMN "theme" "EventTheme" NOT NULL DEFAULT 'ELECTA_DEFAULT';`
  - PostgreSQL applies constant defaults to existing rows instantly using catalog metadata (Postgres 11+ non-blocking DDL).
  - 100% backward compatible: No rows altered, no existing tables or columns dropped.

---

### Decision 4: Resilient Fallback Pattern
- Even if a bad payload enters the system or a future theme is deprecated:
  ```ts
  export function resolveEventTheme(rawTheme?: unknown): ThemeDefinition {
    if (typeof rawTheme === "string" && isKnownTheme(rawTheme)) {
      return THEME_REGISTRY[rawTheme];
    }
    if (rawTheme !== undefined && rawTheme !== null && rawTheme !== "ELECTA_DEFAULT") {
      console.warn(`[ThemeEngine] Unknown or deprecated theme "${String(rawTheme)}". Falling back to ELECTA_DEFAULT.`);
    }
    return THEME_REGISTRY.ELECTA_DEFAULT;
  }
  ```
- Guarantees fail-safe rendering under all edge cases.
