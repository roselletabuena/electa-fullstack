import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EventLifecycleFilters } from "@/features/events/components/trending/EventLifecycleFilters";

describe("EventLifecycleFilters Component", () => {
  const counts = {
    all: 3,
    active: 1,
    scheduled: 1,
    closed: 1,
  };

  it("renders all 4 lifecycle filter tabs with correct labels", () => {
    render(<EventLifecycleFilters activeFilter="all" onFilterChange={vi.fn()} counts={counts} />);

    expect(screen.getByRole("tab", { name: /all events/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /live voting/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /upcoming/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /concluded/i })).toBeInTheDocument();
  });

  it("displays event count badges when counts are provided", () => {
    render(<EventLifecycleFilters activeFilter="all" onFilterChange={vi.fn()} counts={counts} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByText("1")).toHaveLength(3);
  });

  it("sets aria-selected=true on the active filter tab", () => {
    render(
      <EventLifecycleFilters activeFilter="active" onFilterChange={vi.fn()} counts={counts} />,
    );

    const activeTab = screen.getByRole("tab", { name: /live voting/i });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    const upcomingTab = screen.getByRole("tab", { name: /upcoming/i });
    expect(upcomingTab).toHaveAttribute("aria-selected", "false");
  });

  it("calls onFilterChange when a different tab is clicked", () => {
    const handleFilterChange = vi.fn();
    render(
      <EventLifecycleFilters
        activeFilter="all"
        onFilterChange={handleFilterChange}
        counts={counts}
      />,
    );

    const upcomingTab = screen.getByRole("tab", { name: /upcoming/i });
    fireEvent.click(upcomingTab);

    expect(handleFilterChange).toHaveBeenCalledTimes(1);
    expect(handleFilterChange).toHaveBeenCalledWith("scheduled");
  });
});
