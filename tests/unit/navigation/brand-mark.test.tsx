import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BrandMark } from "@/features/navigation/components/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ThemeProvider } from "@/components/shared/theme-provider";

describe("BrandMark Component", () => {
  it("renders Electa wordmark and links to homepage", () => {
    render(<BrandMark />);
    const link = screen.getByRole("link", { name: /electa/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
    expect(screen.getByText("ELECTA")).toBeDefined();
  });

  it("renders tagline when showTagline is true", () => {
    render(<BrandMark showTagline={true} />);
    expect(screen.getByText("VOTE · ENGAGE · CELEBRATE")).toBeDefined();
  });

  it("omits tagline when showTagline is false", () => {
    render(<BrandMark showTagline={false} />);
    expect(screen.queryByText("VOTE · ENGAGE · CELEBRATE")).toBeNull();
  });
});

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("renders icon variant with accessible aria-label", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle variant="icon" />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(button).toBeDefined();
    expect(button.className).toContain("rounded-none");
    expect(button.className).toContain("h-9");
    expect(button.className).toContain("w-9");
  });

  it("toggles theme and updates aria-label and localStorage on click", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle variant="icon" />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    fireEvent.click(button);

    expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeDefined();
    expect(localStorage.getItem("electa-theme")).toBe("dark");
  });
});
