# Feature Specification: Data Model, Schema Migration & Dynamic Theme Resolution Engine

**Feature ID**: `048-dynamic-theme-resolution-engine`  
**Ticket**: [VS-120](https://the-three-devsketeers.atlassian.net/browse/VS-120)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119) (`[Epic] Dynamic Event Theming Engine & Visual Appearance System`)  
**Status**: In Progress  
**Created**: 2026-10-22  

---

## 1. Clarifications & Resolved Decisions

### Session 2026-10-22
- **Q1: Which theme options are initially supported in the database enum?**  
  → **A**: `EventTheme` enum contains `ELECTA_DEFAULT` and `PAGEANT_EDITORIAL`.
- **Q2: What is the database default for existing and newly created events?**  
  → **A**: `ELECTA_DEFAULT`. Existing events automatically receive `ELECTA_DEFAULT` during schema migration with 100% backward compatibility and zero data loss.
- **Q3: How are theme design tokens resolved and applied?**  
  → **A**: Tokens are centralized in `src/features/events/theme/theme-registry.ts`. A theme resolution helper `resolveEventTheme(rawTheme)` safely normalizes any string or null value into an `EventTheme` identifier and associated token dictionary.
- **Q4: How is theme state applied to the DOM without layout shift or FOUT?**  
  → **A**: In `src/features/events/theme/EventThemeProvider.tsx`, the resolved theme applies `data-event-theme="electa-default"` (or `"pageant-editorial"`) and attaches scoped CSS custom properties directly in the initial SSR HTML markup.
- **Q5: How does the system react if an invalid, unmapped, or corrupt theme string is retrieved?**  
  → **A**: `resolveEventTheme` logs a non-fatal warning using `console.warn` and falls back safely to `ELECTA_DEFAULT` without throwing a runtime error or breaking SSR.
- **Q6: How does this impact organizer event branding validation?**  
  → **A**: `updateEventBrandingSchema` in `src/lib/validations/event-branding.ts` is extended to accept an optional `theme` field validated against allowed `EventTheme` values.

---

## 2. Overview & Business Value

Currently, public event pages (`/events/[slug]`) hardcode Electa's Opal light mode design tokens. To support high-value tailored competition experiences (such as the Haute-Couture Pageant Editorial skin in `public/prototypes/pageant-voting.html`), the platform requires an extensible, production-grade theming architecture.

This feature establishes the **Dynamic Theme Foundation**:
1. An `EventTheme` database enum in `prisma/schema.prisma` (`ELECTA_DEFAULT`, `PAGEANT_EDITORIAL`) with non-destructive migration.
2. Extension of `PublicEventDto` and domain types in `src/features/events/types/` to include `theme: EventTheme`.
3. Extension of Zod branding schemas in `src/lib/validations/event-branding.ts` to validate theme selection.
4. A token registry (`src/features/events/theme/theme-registry.ts`) mapping themes to CSS variables (colors, typography, radii, surfaces, borders).
5. An SSR-first theme provider (`src/features/events/theme/EventThemeProvider.tsx`) embedding `data-event-theme` and scoped CSS variables into the initial server markup to guarantee zero flash of unstyled theme (FOUT) and zero Cumulative Layout Shift (CLS = 0).

---

## 3. User Scenarios & Testing

### User Story 1 - Default Event Theme Fallback & Current Design Guarantee (Priority: P1) 🎯 MVP

An event organizer or voter visits a public competition page (`/events/[slug]`) where `theme` is set to `ELECTA_DEFAULT` (or is legacy/null). The page renders with Electa's standard Opal Slate-50 background (`#F8FAFC`), Slate-900 typography, Sky Blue accents, and sharp zero-radius geometry without any visual regression.

**Why this priority**: Guarantees zero regression for 100% of existing events and establishes the baseline design system token mapping.

**Independent Test**: Query an event with `ELECTA_DEFAULT`, verify SSR HTML contains `data-event-theme="electa-default"`, verify computed CSS variables match Opal tokens, and verify zero visual anomalies across cards, headers, and buttons.

**Acceptance Scenarios**:
1. **Given** an existing or newly created event with `theme = "ELECTA_DEFAULT"` or `null`,
   **When** a user views `/events/[slug]`,
   **Then** the page renders with the exact Opal Slate-50 background (`#F8FAFC`), Slate-900 typography, Sky Blue accents, and sharp zero-radius geometry.
2. **Given** an existing database with historical event records,
   **When** the Prisma migration applies,
   **Then** every existing event row has `theme = 'ELECTA_DEFAULT'`, and no existing fields or relations are altered or dropped.

---

### User Story 2 - Resilient Fallback for Corrupted or Unknown Theme Values (Priority: P2)

An event record in the database contains an unknown, deprecated, or malformed theme string. When the public event page or API resolves the theme tokens, the theme engine intercepts the invalid value, logs a diagnostic warning, and smoothly falls back to `ELECTA_DEFAULT` without throwing an unhandled exception or breaking page rendering.

**Why this priority**: Prevents voter-facing 500 errors and protects platform uptime during future theme deprecations or database updates.

**Independent Test**: Pass an arbitrary string (e.g. `"NEON_CYBERPUNK"` or `""`) to `resolveEventTheme()`. Verify it returns `ELECTA_DEFAULT` with default tokens and issues a `console.warn`.

**Acceptance Scenarios**:
1. **Given** an event record containing an invalid or deprecated theme identifier (e.g. `"INVALID_THEME"`),
   **When** the theme resolver evaluates the event,
   **Then** it logs a warning via `console.warn` and returns the `ELECTA_DEFAULT` theme configuration and token definitions.
2. **Given** a null or undefined theme field on an event DTO,
   **When** `resolveEventTheme(null)` or `resolveEventTheme(undefined)` is invoked,
   **Then** it returns the `ELECTA_DEFAULT` theme without error.

---

### User Story 3 - Server-Side Token Injection & Zero FOUT (Priority: P3)

A voter loads `/events/[slug]` on a desktop or mobile browser. Because theme CSS variables and the `data-event-theme` attribute are rendered on the server into the initial HTML document, the page styles apply immediately before client hydration, eliminating any flash of unstyled theme (FOUT) and preventing layout shifts.

**Why this priority**: Core web vital stability (CLS = 0) and high-end visual polish expected of premium voting events.

**Independent Test**: Render `EventThemeProvider` in SSR context and inspect the rendered markup. Verify `data-event-theme` and inline `style` variables are present on the wrapper element.

**Acceptance Scenarios**:
1. **Given** a public event page loaded on Next.js 16 App Router,
   **When** the server renders the initial HTML response,
   **Then** `data-event-theme` and theme CSS variables are embedded directly into the SSR markup.
2. **Given** a page with theme tokens injected,
   **When** client hydration completes,
   **Then** no layout recalculation or flash of contrasting background colors occurs.

---

## 4. Requirements & Functional Invariants

- **INV-1 (Backwards Compatibility)**: All existing events must default to `ELECTA_DEFAULT`. Existing queries and routes must continue to function without modification.
- **INV-2 (Strict Zero-Radius Default)**: When `theme === "ELECTA_DEFAULT"`, all borders, buttons, and cards enforce strict 0px border radius (`--radius: 0px`).
- **INV-3 (Token Coverage)**: Every registered theme in `theme-registry.ts` must provide a complete token set:
  - Backgrounds: `bgBase`, `bgSurface`, `bgSurfaceElevated`, `bgSurfaceHover`
  - Foregrounds: `textPrimary`, `textSecondary`, `textTertiary`
  - Accents: `accentPrimary`, `accentSecondary`, `accentMuted`
  - Borders: `borderHairline`, `borderAccent`
  - Geometry: `radiusSm`, `radiusMd`, `radiusLg`, `radiusPill`
  - Typography: `fontHeading`, `fontBody`, `fontSerif`
- **INV-4 (Zod Boundary Validation)**: All input boundaries (actions, routes) must validate `theme` using `eventThemeSchema`.
- **INV-5 (No Forbidden Constructs)**: Zero `any`, zero non-null assertions (`!`), named exports only.
