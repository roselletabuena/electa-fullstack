import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ContestantFormModal } from "@/features/contestants/components/ContestantFormModal";
import type { AwardCategoryDto, ContestantDto, DynamicDivisionItem } from "@/features/contestants/types";

describe("ContestantFormModal - Dynamic Category & Division Integration (VS-38)", () => {
  const mockCategories: AwardCategoryDto[] = [
    {
      id: "cat-1",
      eventId: "evt-1",
      name: "People's Choice Award",
      description: "Voted by the public",
      isVotingOpen: true,
    },
    {
      id: "cat-2",
      eventId: "evt-1",
      name: "Best in Swimsuit",
      description: "Stage performance",
      isVotingOpen: true,
    },
  ];

  const mockCustomDivisions: DynamicDivisionItem[] = [
    { id: "div-kids", name: "Kids" },
    { id: "div-teens", name: "Teens" },
    { id: "div-adults", name: "Adults" },
  ];

  const mockInitialData: ContestantDto = {
    id: "c1",
    eventId: "evt-1",
    contestantNumber: 5,
    name: "Maria Santos",
    division: "TEEN",
    divisionId: "div-teens",
    divisionName: "Teens",
    status: "ACTIVE",
    avatarUrl: "https://example.com/avatar.jpg",
    voteCount: 0,
    media: [
      {
        id: "m1",
        mediaType: "PHOTO",
        url: "https://example.com/avatar.jpg",
        embedPlatform: "NONE",
        displayOrder: 0,
        aspectRatio: "4:5",
        isCover: true,
      },
    ],
    categories: mockCategories.slice(0, 1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("renders custom event divisions in the dropdown when divisions prop is provided", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeDefined();

    // Check that custom division options are rendered
    expect(screen.getByRole("option", { name: "Kids" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Teens" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Adults" })).toBeDefined();

    // Fallback static enums should NOT be present when custom divisions exist
    expect(screen.queryByRole("option", { name: "Female" })).toBeNull();
    expect(screen.queryByRole("option", { name: "LGBTQ+" })).toBeNull();
  });

  it("gracefully falls back to standard divisions when divisions prop is empty or undefined", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
      />,
    );

    expect(screen.getByRole("option", { name: "Female" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Male" })).toBeDefined();
    expect(screen.getByRole("option", { name: "LGBTQ+" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Teen" })).toBeDefined();
  });

  it("renders award category checkboxes for active event awards", () => {
    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
        divisions={mockCustomDivisions}
      />,
    );

    expect(screen.getByText("People's Choice Award")).toBeDefined();
    expect(screen.getByText("Best in Swimsuit")).toBeDefined();
  });

  it("pre-selects existing custom division and categories when editing an existing contestant", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ContestantFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        categories={mockCategories}
        divisions={mockCustomDivisions}
        initialData={mockInitialData}
      />,
    );

    // Division dropdown should be populated with the contestant's division
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("Teens");

    // Change division to "Adults"
    fireEvent.change(select, { target: { value: "Adults" } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Update Profile/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Maria Santos",
        division: "Adults",
        divisionId: "div-adults",
      }),
    );
  });
});
