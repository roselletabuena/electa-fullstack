# Quickstart & Verification Guide: Hero Marketing Value Showcase & Platform Highlights Card

**Feature ID**: `032-hero-marketing-value-showcase`  
**Jira Key**: [VS-91](https://the-three-devsketeers.atlassian.net/browse/VS-91)

---

## 1. Overview & Setup

This guide provides test and inspection procedures to verify the Hero Marketing Value Showcase Card across desktop and mobile viewports.

---

## 2. Manual Verification Scenarios

### Scenario A: Desktop Hero Inspection

1. Start development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000` in Google Chrome or Microsoft Edge.
3. Observe the hero section right-hand column:
   - Verify official badge `OFFICIAL VOTING PLATFORM` with sky blue accent indicator.
   - Verify heading `"WHY ORGANIZERS & FANS CHOOSE ELECTA"` in Outfit font.
   - Verify all 4 value tiles:
     1. 🛡️ **Bot & Abuse Protection**: Turnstile verification, IP rate-limiting, and voter sign-in.
     2. ⚡ **Live Stage Leaderboard**: Instant score updates for live event projector screens.
     3. 🇵🇭 **Seamless GCash & Maya**: Frictionless paid boost votes powered by dynamic QR Ph and Philippine e-wallets.
     4. 🚀 **Fast Event Setup**: Contestant rosters, voting categories, and custom rules.
   - Verify the 4 tabular highlights metrics in the ribbon:
     - `< 5M EVENT SETUP`
     - `1-TAP GCASH & MAYA`
     - `LIVE STAGE TALLY`
     - `FREE DAILY VOTES`
   - Verify the assurance footer:
     - `"✓ Transparent live tallies • Philippine e-wallets • Instant mobile access"`

### Scenario B: Dark Mode Parity & Zero-Radius Geometry

1. Toggle the theme switcher in the site header to **Dark Mode**.
2. Verify all text remains high-contrast (≥ 4.5:1), cards transition cleanly to dark slate surfaces (`dark:bg-[#0d1424]`), and hairline borders remain subtle (`dark:border-slate-800`).
3. Verify all container edges, badges, tiles, and ribbons maintain strict zero-radius corners (`rounded-none`).

### Scenario C: Mobile Viewport Stacking

1. Toggle Chrome DevTools responsive device toolbar (iPhone 14 / 375px width).
2. Confirm the marketing card stacks naturally beneath the search input without horizontal scrolling.
3. Confirm tiles reflow gracefully to a single column while preserving readability.

---

## 3. Automated Test Suite Execution

Run dedicated marketing unit tests:

```bash
npm run test:unit tests/unit/marketing/HeroMarketingCard.test.tsx
```

Run full quality gate verification:

```bash
npm run typecheck
npm run lint
npm run test:unit
```
