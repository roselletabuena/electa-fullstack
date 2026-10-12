import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SiteFooter } from "@/features/navigation/components/site-footer";
import { DEFAULT_SITE_FOOTER_CONFIG } from "@/features/navigation/utils/footer-config";
import type { FooterConfig } from "@/features/navigation/types";

describe("SiteFooter Component", () => {
  it("renders semantic footer landmark with role contentinfo", () => {
    render(<SiteFooter />);
    const footer = screen.getByRole("contentinfo", { name: /site footer/i });
    expect(footer).toBeDefined();
    expect(footer.className).toContain("bg-[#0F172A]");
  });

  it("renders official Electa brand symbol, wordmark, and tagline", () => {
    render(<SiteFooter />);
    expect(screen.getByText("ELECTA")).toBeDefined();
    expect(screen.getByText("Vote. Engage. Celebrate.")).toBeDefined();

    const logo = screen.getByAltText("Electa Logo");
    expect(logo).toBeDefined();
    expect(logo.getAttribute("src")).toContain("electa-logo-dark.svg");
  });

  it("renders copyright text and system status badge", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText("© 2026 Electa Platform. All Rights Reserved."),
    ).toBeDefined();
    expect(
      screen.getByText("SYSTEM OPERATIONAL · AUDIT VERIFIED"),
    ).toBeDefined();
  });

  it("renders all 4 directory column sections with headings", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("heading", { name: "Explore" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Organizers" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Platform" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Legal" })).toBeDefined();
  });

  it("renders directory links with valid href paths", () => {
    render(<SiteFooter />);

    // Explore section links
    const trendingLink = screen.getByRole("link", { name: /browse trending events/i });
    expect(trendingLink.getAttribute("href")).toBe("/events?filter=trending");

    const liveVotingLink = screen.getByRole("link", { name: /view active live voting events/i });
    expect(liveVotingLink.getAttribute("href")).toBe("/events?filter=live");

    // Organizers section links
    const createEventLink = screen.getByRole("link", { name: /create a new pageant or contest event/i });
    expect(createEventLink.getAttribute("href")).toBe("/events/new");

    const portalLink = screen.getByRole("link", { name: /access the organizer management portal/i });
    expect(portalLink.getAttribute("href")).toBe("/dashboard");

    // Platform section links
    const statusLink = screen.getByRole("link", { name: /check realtime platform uptime and system status/i });
    expect(statusLink.getAttribute("href")).toBe("/status");

    // Legal section links
    const termsLink = screen.getByRole("link", { name: /view terms of service/i });
    expect(termsLink.getAttribute("href")).toBe("/terms");

    const privacyLink = screen.getByRole("link", { name: /read our privacy policy/i });
    expect(privacyLink.getAttribute("href")).toBe("/privacy");

    const auditLink = screen.getByRole("link", { name: /platform vote verification and cryptographic audit integrity/i });
    expect(auditLink.getAttribute("href")).toBe("/audit");
  });

  it("satisfies touch target spacing requirements on mobile", () => {
    render(<SiteFooter />);
    const links = screen.getAllByRole("link");
    // Verify directory links have min-h-11 or min-h-[44px]
    const directoryLinks = links.filter((l) =>
      l.getAttribute("href")?.startsWith("/"),
    );
    expect(directoryLinks.length).toBeGreaterThan(0);
    for (const link of directoryLinks) {
      if (link.getAttribute("aria-label")?.includes("Electa - Home")) continue;
      expect(link.className).toMatch(/min-h-11|min-h-\[44px\]/);
    }
  });

  it("enforces zero-radius geometry without rounded-* classes", () => {
    const { container } = render(<SiteFooter />);
    const roundedElements = container.querySelectorAll(
      '[class*="rounded-md"], [class*="rounded-lg"], [class*="rounded-xl"], [class*="rounded-full"]',
    );
    expect(roundedElements).toHaveLength(0);
  });

  it("supports custom configuration overrides", () => {
    const customConfig: FooterConfig = {
      ...DEFAULT_SITE_FOOTER_CONFIG,
      brand: {
        ...DEFAULT_SITE_FOOTER_CONFIG.brand,
        title: "CUSTOM ELECTA",
        tagline: "Vote. Engage. Celebrate.",
      },
    };

    render(<SiteFooter config={customConfig} />);
    expect(screen.getByText("CUSTOM ELECTA")).toBeDefined();
  });
});
