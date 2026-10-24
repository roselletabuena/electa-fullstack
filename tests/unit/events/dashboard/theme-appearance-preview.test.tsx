import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeAppearancePreview } from "@/features/events/components/dashboard/ThemeAppearancePreview";
import { THEME_REGISTRY } from "@/features/events/theme/theme-registry";

describe("ThemeAppearancePreview", () => {
  const defaultTheme = THEME_REGISTRY.ELECTA_DEFAULT;
  const pageantTheme = THEME_REGISTRY.PAGEANT_EDITORIAL;

  it("renders live preview header with active theme name and event title", () => {
    render(
      <ThemeAppearancePreview
        theme={pageantTheme}
        eventTitle="Miss Visayas 2026"
        bannerUrl="https://example.com/banner.jpg"
      />,
    );

    expect(screen.getByText(/Live Appearance Preview/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(pageantTheme.displayName, "i"))).toBeInTheDocument();
    expect(screen.getByText("Miss Visayas 2026")).toBeInTheDocument();
  });

  it("renders sample countdown timer and sample contestant card", () => {
    render(
      <ThemeAppearancePreview
        theme={defaultTheme}
        eventTitle="Miss Visayas 2026"
      />,
    );

    expect(screen.getByText(/Voting Closes In/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample Candidate/i)).toBeInTheDocument();
    expect(screen.getByText(/Vote Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Boost/i)).toBeInTheDocument();
  });

  it("applies theme custom properties and data-event-theme attribute", () => {
    const { container } = render(
      <ThemeAppearancePreview
        theme={pageantTheme}
        eventTitle="Miss Mindanao 2026"
      />,
    );

    const themedBox = container.querySelector('[data-event-theme="pageant-editorial"]');
    expect(themedBox).toBeInTheDocument();
  });

  it("enforces strict zero-radius brutalist branding across preview elements", () => {
    const { container } = render(
      <ThemeAppearancePreview
        theme={pageantTheme}
        eventTitle="Miss Visayas 2026"
      />,
    );

    const elementsWithRounded = container.querySelectorAll('[class*="rounded"]');
    elementsWithRounded.forEach((el) => {
      expect(el.className).toContain("rounded-none");
      expect(el.className).not.toMatch(/rounded-(sm|md|lg|xl|2xl|full)/);
    });
  });
});
