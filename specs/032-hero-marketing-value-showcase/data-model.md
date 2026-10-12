# Data Model: Hero Marketing Value Showcase & Platform Highlights Card

**Feature ID**: `032-hero-marketing-value-showcase`  
**Jira Key**: [VS-91](https://the-three-devsketeers.atlassian.net/browse/VS-91)  
**Date**: 2026-10-12

---

## 1. Entities & Data Structures

### Marketing Feature Tile DTO

Represents an individual value pillar tile displayed in the card.

```typescript
export interface MarketingFeatureTile {
  id: string;
  icon: string; // Emoji / symbol e.g. "🛡️", "⚡", "🇵🇭", "🚀"
  title: string;
  description: string;
  badge?: string;
}
```

### Platform Highlight Metric DTO

Represents an individual truthful highlight metric in the ribbon.

```typescript
export interface MarketingHighlightMetric {
  id: string;
  label: string; // e.g. "< 5M EVENT SETUP", "1-TAP GCASH & MAYA"
  detail?: string;
}
```

### Hero Marketing Showcase Configuration Entity

Represents the complete marketing card configuration data model.

```typescript
export interface HeroMarketingConfig {
  credentialBadge: string; // "OFFICIAL VOTING PLATFORM"
  headline: string; // "WHY ORGANIZERS & FANS CHOOSE ELECTA"
  tiles: MarketingFeatureTile[]; // Exactly 4 tiles
  metrics: MarketingHighlightMetric[]; // Exactly 4 metrics
  assuranceFootnote: string; // "✓ Transparent live tallies • Philippine e-wallets • Instant mobile access"
}
```

### Component Props Contract

```typescript
export interface HeroMarketingCardProps {
  readonly className?: string;
  readonly config?: HeroMarketingConfig;
}
```

---

## 2. Invariants & Validation Rules

1. **Badge Text Invariant**: Must match `"OFFICIAL VOTING PLATFORM"` (case-insensitive in input, styled uppercase).
2. **Headline Invariant**: Must match `"WHY ORGANIZERS & FANS CHOOSE ELECTA"`.
3. **Pillar Tile Count**: Exactly 4 tiles corresponding to the core pillars:
   - `bot-protection`: Bot & Abuse Protection
   - `live-leaderboard`: Live Stage Leaderboard
   - `ph-payments`: Seamless GCash & Maya
   - `fast-setup`: Fast Event Setup
4. **Highlights Metric Count**: Exactly 4 metrics:
   - `< 5M EVENT SETUP`
   - `1-TAP GCASH & MAYA`
   - `LIVE STAGE TALLY`
   - `FREE DAILY VOTES`
5. **Assurance Footnote Invariant**: Must contain `"✓ Transparent live tallies • Philippine e-wallets • Instant mobile access"`.
6. **Zero-Radius Geometry**: All containers, badges, and tiles enforce `--radius: 0px` (`rounded-none`).
