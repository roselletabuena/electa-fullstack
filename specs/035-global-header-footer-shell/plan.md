# Implementation Plan: Global Header & Footer Shell

**Feature ID**: `035-global-header-footer-shell`  
**Jira Keys**: VS-100, VS-101

## 1. Architecture & Component Mapping

### Phase 1: Shared shell

- `src/features/navigation/components/site-shell.tsx`: `SiteShell` (header, `flex-1` content, streamlined footer).
- `src/features/navigation/index.ts`: export `SiteShell`.

### Phase 2: Route topology

- `src/app/(public)/layout.tsx` and `src/app/(dashboard)/layout.tsx`: wrap children in `SiteShell`.
- Move `src/app/page.tsx` to `src/app/(public)/page.tsx` and remove its own header/footer.
- Move `(public)/events/[slug]/stage-display` to `(fullscreen)/events/[slug]/stage-display`.

### Phase 3: Layout polish

- Remove inner `min-h-screen` from page wrappers now nested inside the shell (event page client, leaderboard, dashboard) so pages do not overflow viewport by header height.
- Avoid nested `<main>` landmarks.

## 2. Test Plan

- `tests/unit/navigation/site-shell.test.tsx`: banner/contentinfo present, order header/content/footer, flex pinning, zero-radius.
- Update `tests/unit/assembly/page-assembly.test.tsx` for the moved home page (wrap with `SiteShell`).
- Run `npm run typecheck`, `npm run lint`, `npm run test:unit`.
