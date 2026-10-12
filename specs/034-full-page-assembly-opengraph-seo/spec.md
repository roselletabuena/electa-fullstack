# Feature Specification: Full Page Assembly, Accessible Footer & OpenGraph SEO

**Feature ID**: `034-full-page-assembly-opengraph-seo`  
**Jira Key**: [VS-93](https://the-three-devsketeers.atlassian.net/browse/VS-93)  
**Parent Epic**: [VS-90: [Epic] Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Sequence**: Milestone 1.5 (Final deliverable for Epic VS-90)  
**Status**: In Progress  
**Created**: 2026-10-13

---

## 🎯 Executive Summary & Purpose

This specification governs the final assembly of the Electa public landing page (`/`). It integrates all foundational building blocks from Milestone 1.1 through 1.4:

1. **Site Navigation Header** (VS-87) with high-contrast theme switcher and accessible shortcuts.
2. **Hero Discovery & Search** (VS-88) featuring the high-impact search input and streamlined title/subtitle aligned with `public/mockup-realistic.html`.
3. **Hero Marketing Value Showcase Card** (VS-91) showcasing four core platform capabilities with pure Lucide SVG icons (no emoticons), platform highlight metrics, and trust assurance.
4. **Trending Events Grid & Lifecycle Filters** (VS-92) offering real-time event discovery with pure SVG status indicators and clean card geometry.
5. **Streamlined Accessible Footer** (VS-89 / VS-93) adhering to zero-radius Opal design system standards, featuring official brand marks, tagline _"Vote. Engage. Celebrate."_, and copyright notice, with unnecessary dummy links and clutter pruned per `public/mockup-realistic.html`.
6. **OpenGraph & Twitter Social SEO Metadata** providing rich link previews with canonical URL, descriptions, titles, and dynamic 1200x630 social card images.

---

## 👥 Actors & User Roles

- **Public Visitor & Fan**: Navigates the landing page seamlessly, searches for pageants or campus elections, and discovers active contests without visual clutter or layout shifts.
- **Social Media Link Viewer**: Sees a high-fidelity, branded preview card when a link to Electa (`/`) is shared on WhatsApp, X (Twitter), Facebook, Slack, or Discord.
- **Keyboard & Screen Reader User**: Experiences full semantic hierarchy (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`), zero emoticons in accessibility trees, and WCAG 2.1 AA color contrast in both Light Mode (Opal) and Dark Mode.

---

## 📋 Functional & Design Requirements

### 1. Full Page Composition & Streamlined Mockup Parity

- Root route `/` renders a cohesive vertical layout:
  - Sticky `SiteHeader` with zero-radius geometry.
  - Hero grid containing left introduction column (`SUPPORT YOUR EVENT CANDIDATES` with accent span, subtitle, `HomeSearchSection`) and right marketing card column (`HeroMarketingCard`).
  - Prunes unnecessary badges (e.g. "Official Discovery Portal" above hero heading).
  - Main discovery section (`TrendingEventsSection`) featuring lifecycle tabs (`ALL EVENTS`, `LIVE VOTING`, `UPCOMING`, `CONCLUDED`) and responsive cards.
  - Streamlined `SiteFooter` matching `mockup-realistic.html` (brand mark, "ELECTA", tagline, and copyright notice without 16 unbuilt dummy links or noisy filler pills).
- Zero Cumulative Layout Shift (CLS < 0.02) achieved with explicit aspect ratios (`aspect-video`, `aspect-4/5`), Server Component composition, and skeleton fallbacks.

### 2. Iconography & Emoticon Elimination

- **Strictly No Emoticons**: All unicode emoticons (`🛡️`, `⚡`, `🇵🇭`, `🚀`, `⏳`, `✓`, etc.) are replaced with accessible SVG icons from `lucide-react`:
  - Bot & Abuse Protection: `ShieldCheck`
  - Live Stage Leaderboard: `Zap`
  - Seamless GCash & Maya: `Wallet`
  - Fast Event Setup: `Rocket`
  - Countdown & Live Indicators: `Radio`, `Clock`, `CalendarClock`, `Lock`
  - Trust Verification Footnote: `Check`

### 3. OpenGraph & Social Metadata (SEO)

- Root route provides complete `Metadata` and dynamic `ImageResponse` (`src/app/opengraph-image.tsx` or route metadata):
  - `title`: `Electa — Trending Events | Official Event Voting Platform`
  - `description`: `The official digital voting platform. Discover active events, explore contestant profiles, and cast verified free and boost votes.`
  - `openGraph`: title, description, url, siteName (`Electa`), locale (`en_PH`), type (`website`), and 1200x630 branded image.
  - `twitter`: card (`summary_large_image`), title, description, image.
  - `metadataBase`: URL resolution fallback pointing to `https://electa.ph` or `process.env.NEXT_PUBLIC_APP_URL`.

---

## 🧪 User Scenarios & Acceptance Criteria (Gherkin)

### Scenario 1: Full Page Composition & Zero Clutter

- **Given** components from 1.1 (Navbar), 1.2/1.3 (Hero & Marketing Panel), 1.4 (Events Grid), and VS-89 (Footer),
- **When** the root route `/` renders,
- **Then** all sections assemble into a cohesive zero-radius layout matching `mockup-realistic.html`,
- **And** cumulative layout shift (CLS) remains < 0.02,
- **And** all emoticons are replaced with accessible Lucide SVG icons.

### Scenario 2: OpenGraph & Social Metadata

- **Given** the public landing page URL,
- **When** crawled by social platforms (Facebook, X, WhatsApp, Discord),
- **Then** it serves valid canonical OpenGraph and Twitter card meta tags with brand title, description, and preview image.

### Scenario 3: Accessible Streamlined Footer Integration

- **Given** the bottom of the page,
- **When** the visitor scrolls down,
- **Then** the page renders the accessible footer with brand mark, tagline _"VOTE · ENGAGE · CELEBRATE"_, and copyright notices,
- **And** unnecessary unbuilt directory links and filler badges are omitted in the streamlined landing presentation.
