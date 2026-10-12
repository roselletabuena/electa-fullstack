import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TrendingEventsGrid } from "@/features/events/components/trending/TrendingEventsGrid";
import type { PublicEventDto } from "@/features/events/types";

describe("TrendingEventsGrid Component", () => {
  const mockEvents: PublicEventDto[] = [
    {
      id: "evt_1",
      slug: "event-one",
      title: "Event One",
      description: "Description one",
      bannerUrl: "https://example.com/1.jpg",
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      serverTime: new Date().toISOString(),
      operationalState: "Active",
      showResultsOnClose: true,
      contestants: [],
    },
    {
      id: "evt_2",
      slug: "event-two",
      title: "Event Two",
      description: "Description two",
      bannerUrl: "https://example.com/2.jpg",
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      serverTime: new Date().toISOString(),
      operationalState: "Scheduled",
      showResultsOnClose: true,
      contestants: [],
    },
  ];

  it("renders a card for each event in the list", () => {
    render(
      <TrendingEventsGrid
        events={mockEvents}
        isLoading={false}
        activeFilter="all"
        onResetFilter={vi.fn()}
      />,
    );

    expect(screen.getByText("Event One")).toBeInTheDocument();
    expect(screen.getByText("Event Two")).toBeInTheDocument();
  });

  it("renders skeleton loader cards when isLoading is true", () => {
    render(
      <TrendingEventsGrid
        events={[]}
        isLoading={true}
        activeFilter="all"
        onResetFilter={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("event-card-skeleton")).toHaveLength(3);
  });

  it("renders empty state with reset button when events list is empty", () => {
    const handleReset = vi.fn();
    render(
      <TrendingEventsGrid
        events={[]}
        isLoading={false}
        activeFilter="active"
        onResetFilter={handleReset}
      />,
    );

    expect(screen.getByText(/no events found/i)).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /reset filter/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
