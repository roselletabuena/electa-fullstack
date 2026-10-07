import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CategoryFilterBar } from "@/features/contestants/components/CategoryFilterBar";
import type { AwardCategoryDto } from "@/features/contestants/types";

describe("CategoryFilterBar - Dynamic Division & Award Pills (VS-38)", () => {
  const mockCategories: AwardCategoryDto[] = [
    {
      id: "cat-1",
      eventId: "evt-1",
      name: "People's Choice",
      isVotingOpen: true,
    },
    {
      id: "cat-2",
      eventId: "evt-1",
      name: "Best Talent",
      isVotingOpen: true,
    },
  ];

  const customDivisions = [
    { label: "Kids", value: "Kids" },
    { label: "Teens", value: "Teens" },
    { label: "Adults", value: "Adults" },
  ];

  it("renders dynamic division pills matching 'All Candidates', 'Kids', 'Teens', and 'Adults'", () => {
    render(
      <CategoryFilterBar
        divisions={customDivisions}
        selectedDivision="ALL"
        onSelectDivision={vi.fn()}
        categories={mockCategories}
        selectedCategoryId="ALL"
        onSelectCategory={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "All Candidates" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Kids" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Teens" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Adults" })).toBeDefined();

    // Standard static enums should not be rendered when custom divisions are provided
    expect(screen.queryByRole("button", { name: "Female" })).toBeNull();
    expect(screen.queryByRole("button", { name: "LGBTQ+" })).toBeNull();
  });

  it("calls onSelectDivision immediately when a dynamic division pill is clicked", () => {
    const handleSelect = vi.fn();

    render(
      <CategoryFilterBar
        divisions={customDivisions}
        selectedDivision="ALL"
        onSelectDivision={handleSelect}
        categories={mockCategories}
        selectedCategoryId="ALL"
        onSelectCategory={vi.fn()}
      />,
    );

    const kidsPill = screen.getByRole("button", { name: "Kids" });
    fireEvent.click(kidsPill);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("Kids");
  });

  it("highlights the currently active division pill with selected styling", () => {
    render(
      <CategoryFilterBar
        divisions={customDivisions}
        selectedDivision="Teens"
        onSelectDivision={vi.fn()}
        categories={mockCategories}
        selectedCategoryId="ALL"
        onSelectCategory={vi.fn()}
      />,
    );

    const teensPill = screen.getByRole("button", { name: "Teens" });
    expect(teensPill.getAttribute("aria-pressed")).toBe("true");
    expect(teensPill.className).toContain("bg-sky-600");
    expect(teensPill.className).toContain("rounded-none");
  });

  it("does not render division pills when divisions prop is undefined or empty", () => {
    render(
      <CategoryFilterBar
        selectedDivision="ALL"
        onSelectDivision={vi.fn()}
        categories={mockCategories}
        selectedCategoryId="ALL"
        onSelectCategory={vi.fn()}
      />,
    );

    // Divisions should not be shown when no custom divisions are provided
    expect(screen.queryByRole("group", { name: "Competition Divisions" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Female" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Male" })).toBeNull();

    // Award categories should still be rendered
    expect(screen.getByRole("button", { name: "All Awards" })).toBeDefined();
    expect(screen.getByRole("button", { name: "People's Choice" })).toBeDefined();
  });

  it("suppresses division pills when only 1 division is provided", () => {
    render(
      <CategoryFilterBar
        divisions={[{ label: "Female", value: "FEMALE" }]}
        selectedDivision="ALL"
        onSelectDivision={vi.fn()}
        categories={mockCategories}
        selectedCategoryId="ALL"
        onSelectCategory={vi.fn()}
      />,
    );

    expect(screen.queryByRole("group", { name: "Competition Divisions" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Female" })).toBeNull();
    expect(screen.getByRole("button", { name: "All Awards" })).toBeDefined();
  });

  it("renders nothing when there are neither multiple divisions nor categories", () => {
    const { container } = render(
      <CategoryFilterBar
        divisions={[{ label: "Female", value: "FEMALE" }]}
        selectedDivision="ALL"
        onSelectDivision={vi.fn()}
        categories={[]}
        selectedCategoryId="ALL"
        onSelectCategory={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
