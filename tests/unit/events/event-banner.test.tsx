import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { EventBanner } from "@/features/events/components/EventBanner";
import type { PublicEventDto } from "@/features/events/types";

describe("EventBanner - Live Leaderboard Button Visibility Rule", () => {
  const baseEvent: PublicEventDto = {
    id: "evt-123",
    slug: "miss-caloocan-2026",
    title: "Miss Caloocan 2026",
    description: "Annual grand coronation pageant",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: "2026-10-01T12:00:00Z",
    endsAt: "2026-11-01T12:00:00Z",
    serverTime: "2026-10-15T12:00:00Z",
    operationalState: "Active",
    showResultsOnClose: true,
    contestants: [
      {
        id: "c-1",
        contestantNumber: 1,
        name: "Candidate One",
        bio: "Bio 1",
        avatarUrl: "https://example.com/c1.jpg",
        voteCount: 0,
      },
    ],
  };

  it("renders Live Leaderboard button when event is Active and totalVotes > 1", () => {
    render(<EventBanner event={{ ...baseEvent, operationalState: "Active" }} totalVotes={2} />);

    const button = screen.getByRole("link", { name: /Live Leaderboard/i });
    expect(button).toBeDefined();
    expect(button.getAttribute("href")).toBe("/events/miss-caloocan-2026/leaderboard");
  });

  it("hides Live Leaderboard button when event is Active but totalVotes is 1", () => {
    render(<EventBanner event={{ ...baseEvent, operationalState: "Active" }} totalVotes={1} />);

    expect(screen.queryByRole("link", { name: /Live Leaderboard/i })).toBeNull();
  });

  it("hides Live Leaderboard button when event is Active but totalVotes is 0", () => {
    render(<EventBanner event={{ ...baseEvent, operationalState: "Active" }} totalVotes={0} />);

    expect(screen.queryByRole("link", { name: /Live Leaderboard/i })).toBeNull();
  });

  it("hides Live Leaderboard button when event is Scheduled even if totalVotes > 1", () => {
    render(<EventBanner event={{ ...baseEvent, operationalState: "Scheduled" }} totalVotes={5} />);

    expect(screen.queryByRole("link", { name: /Live Leaderboard/i })).toBeNull();
  });

  it("hides Live Leaderboard button when event is Closed even if totalVotes > 1", () => {
    render(<EventBanner event={{ ...baseEvent, operationalState: "Closed" }} totalVotes={10} />);

    expect(screen.queryByRole("link", { name: /Live Leaderboard/i })).toBeNull();
  });
});
