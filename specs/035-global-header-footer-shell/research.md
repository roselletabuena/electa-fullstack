# Research: Global Header & Footer Shell

## Decision 1: Route-group layouts instead of root layout

- **Decision**: Add layouts to `(public)` and `(dashboard)`; move stage-display to a new `(fullscreen)` group.
- **Rationale**: Next.js 16 App Router route groups share a URL space, so stage-display keeps `/events/[slug]/stage-display` while opting out of chrome. Putting chrome in the root layout would force conditional pathname checks (client component) and break RSC-first (Constitution II).
- **Alternatives rejected**: Root layout + `usePathname` exclusion (client boundary, flash); per-page imports (duplication, drift).

## Decision 2: Shared `SiteShell` component

- **Decision**: Single `SiteShell` in `src/features/navigation/components/` used by both layouts.
- **Rationale**: One implementation of layout/flex pinning; testable in isolation (Vitest cannot render Next layouts with route semantics).

## Decision 3: Home page relocation

- **Decision**: Move `src/app/page.tsx` to `src/app/(public)/page.tsx`; URL `/` is unchanged. `opengraph-image.tsx` stays at the app root.
- **Impact**: `tests/unit/assembly/page-assembly.test.tsx` imports updated and wrapped with `SiteShell`.

## Decision 4: Auth routes excluded

- `(auth)` has a focused centered layout with a minimal footer; adding the full header would distract from sign-in. Revisit separately if requested.
