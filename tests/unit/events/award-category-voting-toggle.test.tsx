import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AwardCategoriesSection } from "@/features/events/components/dashboard/AwardCategoriesSection";
import type { AwardCategoryDto } from "@/features/events/types";

describe("AwardCategoriesSection & Voting Toggle", () => {
  const mockCategories: AwardCategoryDto[] = [
    {
      id: "cat_1",
      eventId: "evt_1",
      name: "People's Choice",
      description: "Public voting track",
      isVotingOpen: true,
      displayOrder: 0,
      contestantCount: 4,
      createdAt: "2026-09-27T00:00:00Z",
      updatedAt: "2026-09-27T00:00:00Z",
    },
    {
      id: "cat_2",
      eventId: "evt_1",
      name: "Best in Evening Gown",
      description: "Judged gala competition",
      isVotingOpen: false,
      displayOrder: 1,
      contestantCount: 0,
      createdAt: "2026-09-27T00:00:00Z",
      updatedAt: "2026-09-27T00:00:00Z",
    },
  ];

  it("renders award tracks with their respective voting statuses", () => {
    render(
      <AwardCategoriesSection
        slug="miss-universe-2026"
        awardCategories={mockCategories}
        isLoading={false}
        onAddCategory={vi.fn()}
        onToggleVoting={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    );

    expect(screen.getByText("People's Choice")).toBeDefined();
    expect(screen.getByText("Best in Evening Gown")).toBeDefined();
    expect(screen.getByText("Open")).toBeDefined();
    expect(screen.getByText("Closed")).toBeDefined();
  });

  it("calls onToggleVoting when voting switch is clicked", async () => {
    const onToggleVoting = vi.fn().mockResolvedValue(undefined);

    render(
      <AwardCategoriesSection
        slug="miss-universe-2026"
        awardCategories={mockCategories}
        isLoading={false}
        onAddCategory={vi.fn()}
        onToggleVoting={onToggleVoting}
        onDeleteRequest={vi.fn()}
      />,
    );

    const toggleSwitches = screen.getAllByRole("switch");
    expect(toggleSwitches.length).toBeGreaterThanOrEqual(2);

    // Toggle the first category (People's Choice, currently true -> false)
    await React.act(async () => {
      fireEvent.click(toggleSwitches[0]!);
    });
    expect(onToggleVoting).toHaveBeenCalledWith("cat_1", false);
  });
});
