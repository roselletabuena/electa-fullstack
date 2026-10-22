# Implementation Plan: Data Model, Schema Migration & Dynamic Theme Resolution Engine

**Feature ID**: `048-dynamic-theme-resolution-engine`  
**Ticket**: [VS-120](https://the-three-devsketeers.atlassian.net/browse/VS-120)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Branch**: `feature/VS-120-dynamic-theme-resolution-engine`  
**Status**: Ready  

---

## 1. Architecture & Component Mapping

```mermaid
flowchart TD
    subgraph Data Layer
        P[prisma/schema.prisma\nEventTheme enum] --> C[Prisma Client\nEvent.theme]
    end

    subgraph Domain & Contracts
        T[src/features/events/types/theme.ts\nEventTheme & ThemeTokens]
        Z[src/lib/validations/event-branding.ts\nupdateEventBrandingSchema]
    end

    subgraph Theme Resolution Engine
        R[src/features/events/theme/theme-registry.ts\nTHEME_REGISTRY & resolveEventTheme]
        T --> R
    end

    subgraph Presentation & SSR
        E[src/features/events/theme/EventThemeProvider.tsx\nServer Component Token Injector]
        R --> E
        E --> Page[src/app/(public)/events/[slug]/page.tsx]
    end
```

### Directory Structure & Target Files

- `prisma/schema.prisma` — Schema definitions for `EventTheme` enum and `Event.theme` field.
- `prisma/migrations/20261022000000_add_event_theme_enum/` — Safe Prisma migration.
- `src/features/events/types/theme.ts` — Theme enums, `ThemeTokens`, `ThemeDefinition` interfaces.
- `src/features/events/types/index.ts` — Extension of `PublicEventDto` with `theme?: EventTheme` and re-exports.
- `src/lib/validations/event-branding.ts` — Extension of `updateEventBrandingSchema` to support `theme`.
- `src/features/events/theme/theme-registry.ts` — Definition of `THEME_REGISTRY`, `resolveEventTheme()`, and CSS variable serializer.
- `src/features/events/theme/EventThemeProvider.tsx` — Server/client island theme container setting `data-event-theme` and inline CSS variables.
- `src/features/events/theme/index.ts` — Public barrel file for the `theme/` module.
- `src/app/(public)/events/[slug]/page.tsx` — Integration of `EventThemeProvider` around public event content.
- `tests/unit/events/theme-resolution.test.ts` — Tests for theme normalization, fallback warning, and token extraction.
- `tests/unit/events/theme-provider.test.tsx` — React component tests for SSR attribute and CSS custom properties injection.
- `tests/unit/events/event-branding.test.ts` — Tests for branding schema validation with theme support.

---

## 2. Technical Implementation Phases

### Phase 1: Domain Types, Validation Contracts & TDD Tests
1. Create `src/features/events/types/theme.ts` defining `EVENT_THEMES`, `EventTheme`, `ThemeTokens`, `ThemeDefinition`.
2. Update `src/features/events/types/index.ts` extending `PublicEventDto` and re-exporting theme types.
3. Update `src/lib/validations/event-branding.ts` to include optional `theme` field using Zod enum.
4. Write unit tests in `tests/unit/events/theme-resolution.test.ts` and `tests/unit/events/event-branding.test.ts`.

### Phase 2: Theme Registry & Token Resolution Engine
1. Implement `src/features/events/theme/theme-registry.ts`:
   - `THEME_REGISTRY`: `ELECTA_DEFAULT` (Opal light mode default with dark parity) and `PAGEANT_EDITORIAL` (Haute-couture Champagne & dark slate).
   - `resolveEventTheme(rawTheme)`: Resilient resolver with warning on invalid theme string and safe fallback to `ELECTA_DEFAULT`.
   - `themeTokensToCssVars(tokens)`: Converts tokens into standard CSS custom properties.
2. Verify Phase 1 & 2 tests pass (Red -> Green).

### Phase 3: EventThemeProvider & SSR Integration
1. Implement `src/features/events/theme/EventThemeProvider.tsx`:
   - Wraps children in `<div data-event-theme={themeConfig.slug} style={themeConfig.cssVariables}>`.
   - Injects SSR styles directly to prevent FOUT.
2. Implement `tests/unit/events/theme-provider.test.tsx` verifying SSR attribute rendering and style injection.
3. Integrate `EventThemeProvider` into `src/app/(public)/events/[slug]/page.tsx`.
4. Create barrel file `src/features/events/theme/index.ts`.

### Phase 4: Database Schema & Safe Migration via `db-migrate`
1. Update `prisma/schema.prisma` with `enum EventTheme` and `Event.theme`.
2. Execute migration safely via `db-migrate` workflow.
3. Regenerate Prisma client (`npx prisma generate`).

### Phase 5: Verification & Quality Gates
1. Run `npm run test:unit` to verify 100% green tests.
2. Run `npm run typecheck` and `npm run lint`.
3. Perform Constitution §I–§VI audit.
