# Implementation Plan: Full Page Assembly, Accessible Footer & OpenGraph SEO

**Feature ID**: `034-full-page-assembly-opengraph-seo`  
**Jira Key**: [VS-93](https://the-three-devsketeers.atlassian.net/browse/VS-93)

## 1. Architecture & Component Mapping

### Phase 1: Iconography Upgrade & Emoticon Elimination

- `src/features/marketing/components/FeatureTile.tsx`: Replace emoji renderer with dedicated Lucide SVG icons (`ShieldCheck`, `Zap`, `Wallet`, `Rocket`) while maintaining semantic accessibility.
- `src/features/marketing/components/HeroMarketingCard.tsx`: Replace footnote checkmark text with Lucide `Check` icon.
- `src/features/events/components/trending/TrendingEventCard.tsx`: Clean status pills of any leading `⏳` emoticon, rendering clean Lucide status indicators (`Radio`, `Clock`, `CalendarClock`, `Lock`).

### Phase 2: Streamlined Footer Alignment

- `src/features/navigation/types/index.ts`: Add `variant?: "default" | "streamlined"` to `SiteFooterProps`.
- `src/features/navigation/components/site-footer.tsx`: Support streamlined layout when `variant="streamlined"`, displaying the brand emblem (`electa-logo-dark.svg`), "ELECTA" wordmark, tagline _"VOTE · ENGAGE · CELEBRATE"_, and copyright text.

### Phase 3: Landing Page Layout Assembly & Visual Pruning

- `src/app/page.tsx`:
  - Prune unnecessary top badge ("Official Discovery Portal").
  - Align Hero heading (`SUPPORT YOUR EVENT CANDIDATES` with accent span) and subtitle with `public/mockup-realistic.html`.
  - Wire `SiteHeader`, `HomeSearchSection`, `HeroMarketingCard`, `TrendingEventsSection`, and `SiteFooter` (`variant="streamlined"`).
  - Export OpenGraph and Twitter SEO metadata.
- `src/app/opengraph-image.tsx`: Dynamic 1200x630 social card for link previews.

## 2. Test Plan

- Unit tests under `tests/unit/assembly/page-assembly.test.tsx` verifying:
  - Full page rendering without layout shift.
  - Zero emoticons in rendered DOM trees.
  - Streamlined footer variant presence and WCAG contrast.
  - OpenGraph metadata exports.
- Run `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
