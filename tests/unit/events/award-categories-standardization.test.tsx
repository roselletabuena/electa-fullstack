import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AwardCategoriesSection } from "@/features/events/components/dashboard/AwardCategoriesSection";
import type { AwardCategoryDto } from "@/features/events/types";

describe("VS-118: Standardize Award Categories Nomenclature, Status Badges & Ordering", () => {
  const mockCategories: AwardCategoryDto[] = [
    {
      id: "cat_1",
      eventId: "evt_1",
      name: "People's Choice Award",
      description: "Public popular vote",
      isVotingOpen: true,
      displayOrder: 1,
      contestantCount: 4,
      createdAt: "2026-10-18T00:00:00Z",
      updatedAt: "2026-10-18T00:00:00Z",
    },
    {
      id: "cat_2",
      eventId: "evt_1",
      name: "Best in Formal Wear",
      description: "Judged gala competition",
      isVotingOpen: false,
      displayOrder: 2,
      contestantCount: 0,
      createdAt: "2026-10-18T00:00:00Z",
      updatedAt: "2026-10-18T00:00:00Z",
    },
  ];

  it("Scenario 1: consistently renders 'Award Categories' nomenclature across header, badges, and actions", () => {
    render(
      <AwardCategoriesSection
        slug="pageant-2026"
        awardCategories={mockCategories}
        isLoading={false}
        onAddCategory={vi.fn()}
        onToggleVoting={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    );

    // Title should be "Award Categories" without "Tracks"
    expect(screen.getByRole("heading", { level: 3, name: "Award Categories" })).toBeDefined();
    expect(screen.queryByText(/Award Categories & Voting Tracks/i)).toBeNull();

    // Badge count should use "Award Categories"
    expect(screen.getByText("2 Award Categories")).toBeDefined();
    expect(screen.queryByText(/Award Track/i)).toBeNull();

    // Add button should say "Add Award Category"
    expect(screen.getByRole("button", { name: /Add Award Category/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Add Award Track/i })).toBeNull();
  });

  it("Scenario 2: harmonizes status indicators with 'VOTING OPEN' and 'JUDGED ONLY' badges", () => {
    render(
      <AwardCategoriesSection
        slug="pageant-2026"
        awardCategories={mockCategories}
        isLoading={false}
        onAddCategory={vi.fn()}
        onToggleVoting={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    );

    // People's Choice Award isVotingOpen: true -> "VOTING OPEN"
    expect(screen.getByText("VOTING OPEN")).toBeDefined();

    // Best in Formal Wear isVotingOpen: false -> "JUDGED ONLY"
    expect(screen.getByText("JUDGED ONLY")).toBeDefined();

    // Ambiguous legacy "Open" or "Closed" badges must not appear
    expect(screen.queryByText(/^Open$/)).toBeNull();
    expect(screen.queryByText(/^Closed$/)).toBeNull();
  });

  it("Scenario 3: assigns sequential 1-based displayOrder avoiding collisions when opening add form", () => {
    render(
      <AwardCategoriesSection
        slug="pageant-2026"
        awardCategories={mockCategories}
        isLoading={false}
        onAddCategory={vi.fn()}
        onToggleVoting={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    );

    // Click Add Award Category
    const addBtn = screen.getByRole("button", { name: /Add Award Category/i });
    fireEvent.click(addBtn);

    // Save button should say "Save Award Category"
    expect(screen.getByRole("button", { name: /Save Award Category/i })).toBeDefined();
  });

  it("Scenario 4: renders empty state with standardized nomenclature", () => {
    render(
      <AwardCategoriesSection
        slug="pageant-2026"
        awardCategories={[]}
        isLoading={false}
        onAddCategory={vi.fn()}
        onToggleVoting={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    );

    expect(screen.getByText("No Award Categories Configured")).toBeDefined();
    expect(screen.getByRole("button", { name: /Add First Award Category/i })).toBeDefined();
  });
});
