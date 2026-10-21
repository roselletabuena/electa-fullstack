import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "@/features/events/components/dashboard-overview/EventCard";
import type { OrganizerEventItemDto } from "@/features/events/types/dashboard-overview";

describe("EventCard Component", () => {
  const mockEvent: OrganizerEventItemDto = {
    id: "evt_123",
    slug: "ms-tala-2026",
    title: "Ms. Tala 2026",
    description: "Annual cultural and talent competition.",
    bannerUrl: "https://example.com/banner.jpg",
    publicationStatus: "DRAFT",
    startsAt: "2026-11-01T00:00:00.000Z",
    endsAt: "2026-11-05T00:00:00.000Z",
    isLive: false,
    isEnded: false,
    contestantsCount: 12,
    votesCount: 3500,
    createdAt: "2026-10-01T00:00:00.000Z",
  };

  it("renders event details, telemetry figures, and refined status pill", () => {
    render(<EventCard event={mockEvent} />);

    // Title and description
    expect(screen.getByRole("link", { name: "Ms. Tala 2026" })).toHaveAttribute(
      "href",
      "/events/ms-tala-2026/settings",
    );
    expect(screen.getByText("Annual cultural and talent competition.")).toBeInTheDocument();

    // Draft status badge
    expect(screen.getByText("Draft")).toBeInTheDocument();

    // Telemetry counts
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3,500")).toBeInTheDocument();
  });

  it("links primary action to event management settings", () => {
    render(<EventCard event={mockEvent} />);

    const manageLink = screen.getByRole("link", { name: /manage event/i });
    expect(manageLink).toHaveAttribute("href", "/events/ms-tala-2026/settings");
  });

  it("links contestants metric directly to contestants management tab", () => {
    render(<EventCard event={mockEvent} />);

    const contestantsLink = screen.getByTitle("View Contestants");
    expect(contestantsLink).toHaveAttribute("href", "/events/ms-tala-2026/contestants");
  });

  it("renders live voting status badge when event is live", () => {
    const liveEvent: OrganizerEventItemDto = {
      ...mockEvent,
      publicationStatus: "PUBLISHED",
      isLive: true,
      startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    render(<EventCard event={liveEvent} />);
    expect(screen.getByText("Live Voting")).toBeInTheDocument();
  });

  it("renders scheduled status badge when event starts in future", () => {
    const scheduledEvent: OrganizerEventItemDto = {
      ...mockEvent,
      publicationStatus: "PUBLISHED",
      isLive: false,
      isEnded: false,
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    };

    render(<EventCard event={scheduledEvent} />);
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
  });

  it("renders completed status badge when event has ended", () => {
    const completedEvent: OrganizerEventItemDto = {
      ...mockEvent,
      publicationStatus: "PUBLISHED",
      isLive: false,
      isEnded: true,
      startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    render(<EventCard event={completedEvent} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders archived status badge when event publication status is ARCHIVED", () => {
    const archivedEvent: OrganizerEventItemDto = {
      ...mockEvent,
      publicationStatus: "ARCHIVED",
      isLive: false,
      isEnded: true,
    };

    render(<EventCard event={archivedEvent} />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("copies public URL to clipboard on share button click", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });

    render(<EventCard event={mockEvent} />);

    const shareButton = screen.getByRole("button", { name: /copy public event link/i });
    await user.click(shareButton);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("/events/ms-tala-2026"));
  });
});
