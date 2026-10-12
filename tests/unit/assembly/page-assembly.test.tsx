import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home, { metadata } from "@/app/page";
import { SiteFooter } from "@/features/navigation/components/site-footer";

import { ThemeProvider } from "@/components/shared/theme-provider";

// Mock nuqs
vi.mock("nuqs", () => ({
  useQueryState: () => ["all", vi.fn()],
  parseAsStringLiteral: () => ({
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  }),
  parseAsString: {
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("Landing Page Assembly & SEO (VS-93)", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function renderPage() {
    return render(
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      </ThemeProvider>,
    );
  }

  describe("Scenario: Full Page Composition & Mockup Parity", () => {
    it("renders the cohesive page sections matching mockup-realistic.html", () => {
      renderPage();

      // Header Brand
      expect(screen.getAllByText("ELECTA").length).toBeGreaterThanOrEqual(2);

      // Hero Title matching mockup
      expect(screen.getByText("SUPPORT YOUR")).toBeInTheDocument();
      expect(screen.getByText("EVENT CANDIDATES")).toBeInTheDocument();

      // Hero Subtitle matching mockup
      expect(
        screen.getByText(
          /The official digital voting platform\. Discover active events, explore contestant profiles, and cast verified free and boost votes\./i,
        ),
      ).toBeInTheDocument();

      // Marketing Showcase
      expect(screen.getByText("WHY ORGANIZERS & FANS")).toBeInTheDocument();
      expect(screen.getByText("CHOOSE ELECTA")).toBeInTheDocument();

      // Trending Events Section
      expect(screen.getByText("TRENDING EVENTS")).toBeInTheDocument();

      // Streamlined Footer
      expect(screen.getByText("© 2026 Electa Platform. All Rights Reserved.")).toBeInTheDocument();
    });

    it("verifies unnecessary clutter badges and filler texts are pruned per mockup", () => {
      renderPage();

      // "Official Discovery Portal" badge above hero heading should be removed
      expect(screen.queryByText("Official Discovery Portal")).toBeNull();

      // "Live & Scheduled Pageants" badge above trending events heading should be removed
      expect(screen.queryByText("Live & Scheduled Pageants")).toBeNull();
    });

    it("verifies pure SVG iconography and zero visual emoticons in marketing showcase", () => {
      const { container } = renderPage();

      // Check footnote renders SVG without naked checkmark text
      expect(
        screen.getByText("Transparent live tallies • Philippine e-wallets • Instant mobile access"),
      ).toBeInTheDocument();

      // Ensure SVG icons exist in marketing showcase
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Scenario: Accessible Streamlined Footer Integration", () => {
    it("renders streamlined variant with brand, tagline, and copyright without unbuilt directory clutter", () => {
      render(<SiteFooter variant="streamlined" />);

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
      expect(screen.getByText("ELECTA")).toBeInTheDocument();
      expect(screen.getByText("Vote. Engage. Celebrate.")).toBeInTheDocument();
      expect(screen.getByText("© 2026 Electa Platform. All Rights Reserved.")).toBeInTheDocument();

      // Directory headers should be absent in streamlined variant
      expect(screen.queryByRole("heading", { name: "Explore" })).toBeNull();
      expect(screen.queryByRole("heading", { name: "Organizers" })).toBeNull();
      expect(screen.queryByRole("heading", { name: "Platform" })).toBeNull();
      expect(screen.queryByRole("heading", { name: "Legal" })).toBeNull();
    });
  });

  describe("Scenario: OpenGraph & Social Metadata", () => {
    it("exports valid canonical OpenGraph and Twitter card metadata", () => {
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe("Electa — Trending Events | Official Event Voting Platform");
      expect(metadata.description).toContain("The official digital voting platform");

      // OpenGraph
      const og = metadata.openGraph as Record<string, unknown>;
      expect(og).toBeDefined();
      expect(og.title).toBe("Electa — Trending Events | Official Event Voting Platform");
      expect(og.siteName).toBe("Electa");
      expect(og.locale).toBe("en_PH");
      expect(og.type).toBe("website");
      expect(Array.isArray(og.images)).toBe(true);

      // Twitter
      const tw = metadata.twitter as Record<string, unknown>;
      expect(tw).toBeDefined();
      expect(tw.card).toBe("summary_large_image");
      expect(tw.title).toBe("Electa — Trending Events | Official Event Voting Platform");
      expect(Array.isArray(tw.images)).toBe(true);
    });
  });
});
