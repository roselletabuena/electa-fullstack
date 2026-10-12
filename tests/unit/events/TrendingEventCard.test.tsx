import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendingEventCard } from "@/features/events/components/trending/TrendingEventCard";
import type { PublicEventDto } from "@/features/events/types";

describe("TrendingEventCard Component", () => {
  const mockEvent: PublicEventDto = {
    id: "evt_01",
    slug: "miss-luzon-2026",
    title: "Miss Luzon 2026",
    description: "The official premier beauty pageant of Northern Luzon.",
    bannerUrl: "https://example.com/banner.jpg",
    location: "Baguio City, Northern Luzon",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    serverTime: new Date().toISOString(),
    operationalState: "Scheduled",
    showResultsOnClose: true,
    contestants: [
      {
        id: "cst_1",
        contestantNumber: 1,
        name: "Maria Angelica Santos",
        bio: "Advocate for marine conservation",
        avatarUrl: "https://example.com/c1.jpg",
        voteCount: null,
      },
      {
        id: "cst_2",
        contestantNumber: 2,
        name: "Bea Christine Ramos",
        bio: "STEM education advocate",
        avatarUrl: "https://example.com/c2.jpg",
        voteCount: null,
      },
    ],
  };

  it("renders event title, location, contestant count, and description", () => {
    render(<TrendingEventCard event={mockEvent} />);

    expect(screen.getByText("Miss Luzon 2026")).toBeInTheDocument();
    expect(screen.getByText("Baguio City, Northern Luzon")).toBeInTheDocument();
    expect(screen.getByText("2 Contestants")).toBeInTheDocument();
    expect(
      screen.getByText("The official premier beauty pageant of Northern Luzon."),
    ).toBeInTheDocument();
  });

  it("renders contextual action button linking to event page", () => {
    render(<TrendingEventCard event={mockEvent} />);

    const link = screen.getByRole("link", { name: /preview event/i });
    expect(link).toHaveAttribute("href", "/events/miss-luzon-2026");
    expect(link).toHaveTextContent("PREVIEW EVENT →");
  });

  it("renders live active countdown pill and 'VIEW EVENT →' for active events", () => {
    const activeEvent: PublicEventDto = {
      ...mockEvent,
      operationalState: "Active",
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    };

    render(<TrendingEventCard event={activeEvent} />);

    const link = screen.getByRole("link", { name: /view event/i });
    expect(link).toHaveTextContent("VIEW EVENT →");
    expect(screen.getByText(/left/i)).toBeInTheDocument();
  });

  it("renders 'VIEW FINAL TALLIES →' and 'FINAL TALLIES' for closed events", () => {
    const closedEvent: PublicEventDto = {
      ...mockEvent,
      operationalState: "Closed",
    };

    render(<TrendingEventCard event={closedEvent} />);

    const link = screen.getByRole("link", { name: /view final tallies/i });
    expect(link).toHaveTextContent("VIEW FINAL TALLIES →");
    expect(screen.getByText("FINAL TALLIES")).toBeInTheDocument();
  });
});
