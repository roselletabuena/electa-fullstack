# Feature Specification: Hero Marketing Value Showcase & Platform Highlights Card

**Feature ID**: `032-hero-marketing-value-showcase`  
**Jira Key**: [VS-91](https://the-three-devsketeers.atlassian.net/browse/VS-91)  
**Parent Epic**: [VS-90: [Epic] Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Execution Order**: Milestone 1.3 (Landing Page Hero Assembly)  
**Status**: Draft  
**Created**: 2026-10-12

---

## 🎯 Executive Summary & Overview

Public visitors landing on Electa need immediate, authoritative clarity regarding the platform's purpose, integrity safeguards, and live event voting capabilities. The **Hero Marketing Value Showcase & Platform Highlights Card** is a high-impact, authentic marketing panel positioned in the right-hand column of the hero section.

It communicates why collegiate organizers, pageant committees, and voters trust Electa over generic poll forms or social media comment counters. The card presents official platform credentials, 4 core value pillar tiles (Bot & Abuse Protection, Live Stage Leaderboard, Seamless GCash & Maya, Fast Event Setup), a high-density 4-metric highlights ribbon (`< 5M EVENT SETUP`, `1-TAP GCASH & MAYA`, `LIVE STAGE TALLY`, `FREE DAILY VOTES`), and an assurance footnote (_"✓ Transparent live tallies • Philippine e-wallets • Instant mobile access"_).

The component adheres strictly to Electa's brutalist-refined zero-radius geometry (`rounded-none`), default Light Mode (Opal theme) with full Dark Mode parity, WCAG 2.1 AA accessibility contrast, and renders as a zero-JS React Server Component (RSC).

---

## 👥 Personas & Target Audiences

1. **First-Time Voter / Fan**: Arrives via QR code or direct link to support a candidate or pageant contestant; needs instant assurance that voting is legitimate, real-time, free daily or paid via trusted Philippine e-wallets (GCash/Maya), and protected against bots.
2. **Event Organizer / Pageant Director**: Evaluates whether Electa can manage their upcoming campus or community event; seeks proof of quick setup (< 5 mins), live stage projector support, and robust fraud prevention.
3. **Screen Reader / Keyboard User**: Navigates the landing page; encounters semantic cards, clear headings, high-contrast text, and zero inaccessible decorative clutter.

---

## 📋 Functional Requirements

### 1. Hero Card Placement & Framing

- Positioned as the right-hand column in the landing page hero section (`lg:col-span-5` or complementary grid column next to the discovery search section).
- Enforces strict zero-radius brutalist geometry (`rounded-none`, hairline borders `border-slate-300 dark:border-slate-800`).
- Surface background: crisp pure white (`bg-white dark:bg-[#0d1424]`) with subtle elevation and hairline contrast borders.

### 2. Header Credentials & Title

- **Official Credential Badge**:
  - Label: `OFFICIAL VOTING PLATFORM`
  - Styling: Sharp zero-radius badge (`rounded-none`), uppercase tracking (`tracking-widest text-[11px] font-extrabold`), subtle accent dot indicator (`bg-sky-600 dark:bg-sky-400`).
- **Showcase Heading**:
  - Text: `"WHY ORGANIZERS & FANS CHOOSE ELECTA"`
  - Typography: Outfit (`font-heading font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white`).

### 3. Core Value Pillar Tiles (4 Feature Tiles)

The card must display exactly 4 structured feature tiles:

1. 🛡️ **Bot & Abuse Protection**: Turnstile verification, IP rate-limiting, and voter sign-in.
2. ⚡ **Live Stage Leaderboard**: Instant score updates for live event projector screens.
3. 🇵🇭 **Seamless GCash & Maya**: Frictionless paid boost votes powered by dynamic QR Ph and Philippine e-wallets.
4. 🚀 **Fast Event Setup**: Contestant rosters, voting categories, and custom rules.

Each tile features:

- High-contrast visual icon container (`rounded-none`, subtle border, themed background).
- Clear, prominent title (`font-heading font-bold text-sm text-slate-900 dark:text-slate-100`).
- Concise description text (`font-sans text-xs text-slate-600 dark:text-slate-400 leading-relaxed`).

### 4. High-Density Highlights Ribbon (4 Truthful Metrics)

Directly beneath the 4 tiles, a metric ribbon displays 4 verifiable platform highlights:

1. `< 5M EVENT SETUP`
2. `1-TAP GCASH & MAYA`
3. `LIVE STAGE TALLY`
4. `FREE DAILY VOTES`

- Visual styling: Grid of 2x2 or 4x1 tabular metric cells with JetBrains Mono numbers (`font-mono font-black text-xs sm:text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100`).
- Separated by clean hairline borders (`border-t border-b border-slate-200 dark:border-slate-800`).

### 5. Platform Assurance Footnote

- Located at the base of the marketing card:
  - Text: `✓ Transparent live tallies • Philippine e-wallets • Instant mobile access`
  - Typography: Sora (`font-sans text-xs font-semibold text-slate-600 dark:text-slate-400`).
  - Subtle checkmark styling in Sky Blue (`text-sky-600 dark:text-sky-400`).

---

## 🧪 User Scenarios & Acceptance Criteria (Gherkin)

### Scenario 1: Core Value Pillars Display

- **Given** a visitor views the right-hand column of the hero section,
- **When** the marketing showcase card renders,
- **Then** it must display badge `OFFICIAL VOTING PLATFORM` and heading _"WHY ORGANIZERS & FANS CHOOSE ELECTA"_,
- **And** it must display 4 feature tiles:
  1. 🛡️ **Bot & Abuse Protection**: Turnstile verification, IP rate-limiting, and voter sign-in.
  2. ⚡ **Live Stage Leaderboard**: Instant score updates for live event projector screens.
  3. 🇵🇭 **Seamless GCash & Maya**: Frictionless paid boost votes powered by dynamic QR Ph and Philippine e-wallets.
  4. 🚀 **Fast Event Setup**: Contestant rosters, voting categories, and custom rules.

### Scenario 2: Truthful Highlights & Trust Footnote

- **Given** the marketing card is rendered,
- **When** viewing the ribbon and footer,
- **Then** it must display 4 truthful metrics (`< 5M EVENT SETUP`, `1-TAP GCASH & MAYA`, `LIVE STAGE TALLY`, `FREE DAILY VOTES`),
- **And** the assurance footer must state: _"✓ Transparent live tallies • Philippine e-wallets • Instant mobile access"_.

### Scenario 3: Responsive Stacking & Geometry

- **Given** a user views the landing page on mobile devices (< 640px) or desktop (≥ 1024px),
- **When** the marketing showcase card is laid out,
- **Then** all container corners and tiles must have sharp zero-radius corners (`rounded-none`),
- **And** on mobile viewports, the card stacks naturally below the hero headline and search input without horizontal clipping.

---

## 🛡️ Edge Cases & Non-Functional Requirements

1. **Zero Client JavaScript**: Component is purely presentational and deterministic; default to React Server Component (RSC).
2. **Dual-Theme Parity**: Tested in both Light Mode (Opal `#F8FAFC`) and Dark Mode (`#090D16` / `#0d1424`).
3. **WCAG 2.1 AA Contrast**: All body text meets ≥ 4.5:1; headings and badges meet ≥ 3:1.
4. **Semantics**: Uses `<section aria-labelledby="showcase-heading">`, proper heading tags (`<h2>` or `<h3>`), and structured lists (`<ul>`, `<li>`) for feature tiles.

---

## 🚫 Out of Scope

- Interactive modal popups for each feature tile (deferred to dedicated detail pages).
- Dynamic backend CMS loading of marketing copy (copy is static, deterministic, and tested).
- Final landing page OpenGraph meta-tags and full page assembly (assigned to downstream ticket `VS-93`).
