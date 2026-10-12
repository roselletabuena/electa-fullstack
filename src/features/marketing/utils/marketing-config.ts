import type { HeroMarketingConfig } from "../types";

export const DEFAULT_HERO_MARKETING_CONFIG: HeroMarketingConfig = {
  credentialBadge: "OFFICIAL VOTING PLATFORM",
  headline: "WHY ORGANIZERS & FANS CHOOSE ELECTA",
  tiles: [
    {
      id: "bot-protection",
      icon: "🛡️",
      title: "Bot & Abuse Protection",
      description: "Turnstile verification, IP rate-limiting, and voter sign-in.",
    },
    {
      id: "live-leaderboard",
      icon: "⚡",
      title: "Live Stage Leaderboard",
      description: "Instant score updates for live event projector screens.",
    },
    {
      id: "ph-payments",
      icon: "🇵🇭",
      title: "Seamless GCash & Maya",
      description:
        "Frictionless paid boost votes powered by dynamic QR Ph and Philippine e-wallets.",
    },
    {
      id: "fast-setup",
      icon: "🚀",
      title: "Fast Event Setup",
      description: "Contestant rosters, voting categories, and custom rules.",
    },
  ],
  metrics: [
    {
      id: "metric-fast-setup",
      label: "< 5M EVENT SETUP",
    },
    {
      id: "metric-ewallets",
      label: "1-TAP GCASH & MAYA",
    },
    {
      id: "metric-stage-tally",
      label: "LIVE STAGE TALLY",
    },
    {
      id: "metric-free-votes",
      label: "FREE DAILY VOTES",
    },
  ],
  assuranceFootnote: "✓ Transparent live tallies • Philippine e-wallets • Instant mobile access",
};
