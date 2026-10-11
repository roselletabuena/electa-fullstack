import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SiteHeader } from "@/features/navigation/components/site-header";
import { ThemeProvider } from "@/components/shared/theme-provider";

describe("SiteHeader Component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider defaultTheme="light">{ui}</ThemeProvider>);
  };

  it("renders brand mark with ELECTA wordmark and tagline", () => {
    renderWithTheme(<SiteHeader />);
    expect(screen.getByText("ELECTA")).toBeDefined();
    expect(screen.getByText("VOTE · ENGAGE · CELEBRATE")).toBeDefined();
  });

  it("renders + Create Event link with href /events/new", () => {
    renderWithTheme(<SiteHeader />);
    const link = screen.getByRole("link", { name: /create a new event/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/events/new");
    expect(link.className).toContain("rounded-none");
  });

  it("renders Sign In link with href /login", () => {
    renderWithTheme(<SiteHeader />);
    const link = screen.getByRole("link", { name: /sign in to your account/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/login");
    expect(link.className).toContain("rounded-none");
  });

  it("renders theme toggle button with accessible aria-label", () => {
    renderWithTheme(<SiteHeader />);
    const themeBtn = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(themeBtn).toBeDefined();
    expect(themeBtn.className).toContain("rounded-none");
  });

  it("hides navigation actions when showActions is false", () => {
    renderWithTheme(<SiteHeader showActions={false} />);
    expect(screen.queryByRole("link", { name: /create a new event/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /sign in to your account/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /switch to dark mode/i })).toBeNull();
  });

  it("contains semantic navigation container with proper accessible label", () => {
    renderWithTheme(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeDefined();
  });
});
