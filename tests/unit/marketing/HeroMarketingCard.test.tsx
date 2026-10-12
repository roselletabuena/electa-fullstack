import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroMarketingCard } from "@/features/marketing/components/HeroMarketingCard";
import { FeatureTile } from "@/features/marketing/components/FeatureTile";
import { HighlightsRibbon } from "@/features/marketing/components/HighlightsRibbon";
import { DEFAULT_HERO_MARKETING_CONFIG } from "@/features/marketing/utils/marketing-config";
import {
  heroMarketingConfigSchema,
  marketingFeatureTileSchema,
  marketingHighlightMetricSchema,
} from "@/features/marketing/types";
import type { HeroMarketingConfig } from "@/features/marketing/types";

describe("HeroMarketingCard Component", () => {
  it("renders semantic section landmark with proper accessible heading label", () => {
    const { container } = render(<HeroMarketingCard />);
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("aria-labelledby")).toBe("marketing-showcase-heading");

    const heading = screen.getByRole("heading", {
      name: "WHY ORGANIZERS & FANS CHOOSE ELECTA",
    });
    expect(heading).toBeDefined();
    expect(heading.id).toBe("marketing-showcase-heading");
  });

  it("does not render the credential badge per design cleanup", () => {
    render(<HeroMarketingCard />);
    expect(screen.queryByText("OFFICIAL VOTING PLATFORM")).toBeNull();
  });

  it("renders all 4 feature tiles with exact titles and descriptions", () => {
    render(<HeroMarketingCard />);

    // Tile 1: Bot & Abuse Protection
    expect(screen.getByText("Bot & Abuse Protection")).toBeDefined();
    expect(
      screen.getByText("Turnstile verification, IP rate-limiting, and voter sign-in."),
    ).toBeDefined();
    expect(screen.getByText("🛡️")).toBeDefined();

    // Tile 2: Live Stage Leaderboard
    expect(screen.getByText("Live Stage Leaderboard")).toBeDefined();
    expect(
      screen.getByText("Instant score updates for live event projector screens."),
    ).toBeDefined();
    expect(screen.getByText("⚡")).toBeDefined();

    // Tile 3: Seamless GCash & Maya
    expect(screen.getByText("Seamless GCash & Maya")).toBeDefined();
    expect(
      screen.getByText(
        "Frictionless paid boost votes powered by dynamic QR Ph and Philippine e-wallets.",
      ),
    ).toBeDefined();
    expect(screen.getByText("🇵🇭")).toBeDefined();

    // Tile 4: Fast Event Setup
    expect(screen.getByText("Fast Event Setup")).toBeDefined();
    expect(
      screen.getByText("Contestant rosters, voting categories, and custom rules."),
    ).toBeDefined();
    expect(screen.getByText("🚀")).toBeDefined();
  });

  it("renders the 4 truthful metrics in the highlights ribbon", () => {
    render(<HeroMarketingCard />);

    expect(screen.getByText("< 5M EVENT SETUP")).toBeDefined();
    expect(screen.getByText("1-TAP GCASH & MAYA")).toBeDefined();
    expect(screen.getByText("LIVE STAGE TALLY")).toBeDefined();
    expect(screen.getByText("FREE DAILY VOTES")).toBeDefined();
  });

  it("renders the trust assurance footnote", () => {
    render(<HeroMarketingCard />);
    expect(
      screen.getByText(/Transparent live tallies • Philippine e-wallets • Instant mobile access/),
    ).toBeDefined();
  });

  it("renders with custom configuration when provided via props", () => {
    const customConfig: HeroMarketingConfig = {
      credentialBadge: "VERIFIED PLATFORM",
      headline: "CUSTOM MARKETING HEADLINE",
      tiles: [
        { id: "t1", icon: "⭐", title: "Tile 1", description: "Desc 1" },
        { id: "t2", icon: "⭐", title: "Tile 2", description: "Desc 2" },
        { id: "t3", icon: "⭐", title: "Tile 3", description: "Desc 3" },
        { id: "t4", icon: "⭐", title: "Tile 4", description: "Desc 4" },
      ],
      metrics: [
        { id: "m1", label: "METRIC 1" },
        { id: "m2", label: "METRIC 2" },
        { id: "m3", label: "METRIC 3" },
        { id: "m4", label: "METRIC 4" },
      ],
      assuranceFootnote: "✓ Custom assurance footnote",
    };

    render(<HeroMarketingCard config={customConfig} />);
    expect(screen.getByText("CUSTOM MARKETING HEADLINE")).toBeDefined();
    expect(screen.getByText("Tile 1")).toBeDefined();
    expect(screen.getByText("METRIC 1")).toBeDefined();
    expect(screen.getByText(/Custom assurance footnote/)).toBeDefined();
  });

  it("enforces strict zero-radius brutalist geometry (no rounded borders)", () => {
    const { container } = render(<HeroMarketingCard />);
    const allElements = container.querySelectorAll("*");

    for (const el of allElements) {
      const classList = el.className;
      if (typeof classList === "string" && classList.length > 0) {
        // Must never contain rounded-md, rounded-lg, rounded-xl, rounded-full, etc.
        expect(classList).not.toMatch(/\brounded-(?:sm|md|lg|xl|2xl|3xl|full)\b/);
      }
    }
  });

  it("validates Zod schemas against default configuration", () => {
    const parsed = heroMarketingConfigSchema.safeParse(DEFAULT_HERO_MARKETING_CONFIG);
    expect(parsed.success).toBe(true);

    // Validate sub-schemas
    for (const tile of DEFAULT_HERO_MARKETING_CONFIG.tiles) {
      expect(marketingFeatureTileSchema.safeParse(tile).success).toBe(true);
    }
    for (const metric of DEFAULT_HERO_MARKETING_CONFIG.metrics) {
      expect(marketingHighlightMetricSchema.safeParse(metric).success).toBe(true);
    }
  });
});

describe("FeatureTile Component", () => {
  it("renders badge when provided on tile", () => {
    const tileWithBadge = {
      id: "badge-tile",
      icon: "🎯",
      title: "Badge Tile",
      description: "Description with badge",
      badge: "NEW",
    };
    render(<FeatureTile tile={tileWithBadge} />);
    expect(screen.getByText("NEW")).toBeDefined();
  });
});

describe("HighlightsRibbon Component", () => {
  it("renders detail text when provided on metric", () => {
    const metricsWithDetail = [
      { id: "m1", label: "99.9%", detail: "UPTIME" },
      { id: "m2", label: "0 SEC", detail: "LATENCY" },
    ];
    render(<HighlightsRibbon metrics={metricsWithDetail} />);
    expect(screen.getByText("99.9%")).toBeDefined();
    expect(screen.getByText("UPTIME")).toBeDefined();
  });
});
