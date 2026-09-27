import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DivisionsSection } from "@/features/events/components/dashboard/DivisionsSection";
import type { DivisionDto } from "@/features/events/types";

describe("DivisionsSection", () => {
  const mockDivisions: DivisionDto[] = [
    {
      id: "div-1",
      eventId: "evt-123",
      name: "Senior Division",
      description: "Ages 18+",
      displayOrder: 0,
      contestantCount: 3,
      createdAt: "2026-09-27T00:00:00.000Z",
      updatedAt: "2026-09-27T00:00:00.000Z",
    },
  ];

  it("renders division list correctly", () => {
    render(
      <DivisionsSection
        slug="test-event"
        divisions={mockDivisions}
        isLoading={false}
        onAddDivision={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    );

    expect(screen.getByText("Competition Divisions & Brackets")).toBeDefined();
    expect(screen.getByText("Senior Division")).toBeDefined();
    expect(screen.getByText("Ages 18+")).toBeDefined();
    expect(screen.getByText("3 contestants")).toBeDefined();
  });

  it("opens inline form and submits new division", async () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);

    render(
      <DivisionsSection
        slug="test-event"
        divisions={mockDivisions}
        isLoading={false}
        onAddDivision={handleAdd}
        onDeleteRequest={vi.fn()}
      />,
    );

    const addButton = screen.getByRole("button", { name: /Add Division/i });
    fireEvent.click(addButton);

    expect(screen.getByText("New Division")).toBeDefined();

    const nameInput = screen.getByPlaceholderText(/Female Division, Junior Bracket/i);
    fireEvent.change(nameInput, { target: { value: "Junior Bracket" } });

    const createBtn = screen.getByRole("button", { name: /Save Division/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledTimes(1);
      expect(handleAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Junior Bracket",
        }),
      );
    });
  });

  it("calls onDeleteRequest when delete button is clicked", () => {
    const handleDeleteRequest = vi.fn();

    render(
      <DivisionsSection
        slug="test-event"
        divisions={mockDivisions}
        isLoading={false}
        onAddDivision={vi.fn()}
        onDeleteRequest={handleDeleteRequest}
      />,
    );

    const deleteBtn = screen.getByTitle("Delete division");
    fireEvent.click(deleteBtn);

    expect(handleDeleteRequest).toHaveBeenCalledWith(mockDivisions[0]);
  });
});
