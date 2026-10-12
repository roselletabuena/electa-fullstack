# Quickstart & Verification Guide: Full Page Assembly & OpenGraph SEO

**Feature**: `034-full-page-assembly-opengraph-seo`

## 1. Overview & Setup

Verify that the root landing page `/` matches `public/mockup-realistic.html` in visual hierarchy, streamlined content, pure SVG iconography, accessible footer, and OpenGraph metadata.

## 2. Verification Scenarios

### Scenario A: Clean Landing Page Render & Zero Clutter

1. Start dev server or run unit tests.
2. Visit `/` in browser.
3. Verify that:
   - No unnecessary badge appears above the hero heading.
   - Heading reads `SUPPORT YOUR EVENT CANDIDATES` with `EVENT CANDIDATES` in sky-600 accent.
   - Subtitle reads "The official digital voting platform. Discover active events, explore contestant profiles, and cast verified free and boost votes."
   - Hero Marketing Card displays 4 tiles with real SVG icons (`ShieldCheck`, `Zap`, `Wallet`, `Rocket`), zero emoticons.
   - Trending events cards display pure SVG status icons (`Radio`, `Clock`, `Lock`), zero emoticons.
   - Footer renders the streamlined bar with brand mark, tagline, and copyright notice.

### Scenario B: OpenGraph Preview

1. Inspect `<head>` element of `/`.
2. Verify `meta[property="og:title"]`, `meta[property="og:description"]`, `meta[property="og:image"]`, and `meta[name="twitter:card"]`.

## 3. Automated Test Suite Execution

```bash
npm run typecheck
npm run lint
npm run test:unit tests/unit/assembly/
```
