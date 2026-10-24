import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSelectorCard } from "@/features/events/components/dashboard/ThemeSelectorCard";
import { THEME_REGISTRY } from "@/features/events/theme/theme-registry";

describe("ThemeSelectorCard", () => {
  const defaultTheme = THEME_REGISTRY.ELECTA_DEFAULT;
  const pageantTheme = THEME_REGISTRY.PAGEANT_EDITORIAL;

  it("renders theme title, description, and typography tags", () => {
    const handleSelect = vi.fn();
    render(
      <ThemeSelectorCard
        theme={defaultTheme}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );

    expect(screen.getByText(defaultTheme.displayName)).toBeInTheDocument();
    expect(screen.getByText(defaultTheme.description)).toBeInTheDocument();
    expect(screen.getByText(/Outfit/i)).toBeInTheDocument();
    expect(screen.getByText(/Sora/i)).toBeInTheDocument();
  });

  it("renders color swatches for base, surface, accent, and text", () => {
    const handleSelect = vi.fn();
    render(
      <ThemeSelectorCard
        theme={pageantTheme}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );

    expect(screen.getByTitle(/Base Background: #0B0C10/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Surface: #12141C/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Primary Accent: #CBB279/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Text: #F9F9FB/i)).toBeInTheDocument();
  });

  it("handles selected state with aria-checked and visual badge", () => {
    const handleSelect = vi.fn();
    const { rerender } = render(
      <ThemeSelectorCard
        theme={defaultTheme}
        isSelected={true}
        onSelect={handleSelect}
      />,
    );

    const card = screen.getByRole("radio");
    expect(card).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Active Theme/i)).toBeInTheDocument();

    rerender(
      <ThemeSelectorCard
        theme={defaultTheme}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );
    expect(card).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByText(/Active Theme/i)).not.toBeInTheDocument();
  });

  it("fires onSelect callback on click", () => {
    const handleSelect = vi.fn();
    render(
      <ThemeSelectorCard
        theme={pageantTheme}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByRole("radio"));
    expect(handleSelect).toHaveBeenCalledWith("PAGEANT_EDITORIAL");
  });

  it("fires onSelect callback on keyboard activation (Enter and Space)", () => {
    const handleSelect = vi.fn();
    render(
      <ThemeSelectorCard
        theme={defaultTheme}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );

    const card = screen.getByRole("radio");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledWith("ELECTA_DEFAULT");

    fireEvent.keyDown(card, { key: " " });
    expect(handleSelect).toHaveBeenCalledWith("ELECTA_DEFAULT");
  });

  it("enforces strict zero-radius brutalist branding", () => {
    const handleSelect = vi.fn();
    const { container } = render(
      <ThemeSelectorCard
        theme={defaultTheme}
        isSelected={true}
        onSelect={handleSelect}
      />,
    );

    const card = container.querySelector('[role="radio"]');
    expect(card?.className).toContain("rounded-none");
    expect(card?.className).not.toContain("rounded-lg");
    expect(card?.className).not.toContain("rounded-xl");
    expect(card?.className).not.toContain("rounded-md");

    // All swatches and badges must have rounded-none
    const elementsWithRounded = container.querySelectorAll('[class*="rounded"]');
    elementsWithRounded.forEach((el) => {
      expect(el.className).toContain("rounded-none");
      expect(el.className).not.toMatch(/rounded-(sm|md|lg|xl|2xl|full)/);
    });
  });
});
