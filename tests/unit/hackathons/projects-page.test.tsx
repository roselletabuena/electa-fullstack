import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import HackathonProjectsPage, { generateMetadata } from "@/app/(public)/events/[slug]/projects/page";
import { db } from "@/lib/db";
import { getProjectSubmissions } from "@/features/hackathons/services/submission-service";
import { notFound } from "next/navigation";
import { EventArchetype, EventPublicationStatus } from "@/generated/client/enums";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/features/hackathons/services/submission-service", () => ({
  getProjectSubmissions: vi.fn(),
}));

vi.mock("@/features/hackathons/components/exhibition-grid", () => ({
  ExhibitionGrid: ({ eventTitle }: { eventTitle: string }) => (
    <div data-testid="exhibition-grid-mock">Mock Exhibition: {eventTitle}</div>
  ),
}));

describe("HackathonProjectsPage (/events/[slug]/projects)", () => {
  const mockEvent = {
    id: "evt-hack-1",
    slug: "eth-manila-2026",
    title: "ETH Manila 2026",
    description: "Web3 & AI Hackathon",
    archetype: EventArchetype.HACKATHON,
    publicationStatus: EventPublicationStatus.PUBLISHED,
    startsAt: new Date(Date.now() - 3600000),
    endsAt: new Date(Date.now() + 3600000),
    positions: [{ id: "pos-1", name: "AI & Agents", displayOrder: 0 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generateMetadata returns descriptive title and description for valid event", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: "evt-hack-1",
      title: "ETH Manila 2026",
      description: "Web3 & AI Hackathon",
    } as unknown as never);

    const meta = await generateMetadata({ params: Promise.resolve({ slug: "eth-manila-2026" }) });
    expect(meta.title).toContain("ETH Manila 2026");
    expect(meta.description).toContain("ETH Manila 2026");
  });

  it("calls notFound when event does not exist in DB", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    await expect(
      HackathonProjectsPage({ params: Promise.resolve({ slug: "non-existent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("renders non-hackathon guard when event archetype is not HACKATHON", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({
      ...mockEvent,
      archetype: EventArchetype.PAGEANT,
    } as unknown as never);

    const jsx = await HackathonProjectsPage({ params: Promise.resolve({ slug: "eth-manila-2026" }) });
    render(jsx);

    expect(screen.getByText(/Exhibition Unavailable/i)).toBeDefined();
    expect(screen.getByText(/exclusively enabled for Hackathon archetype events/i)).toBeDefined();
  });

  it("renders ExhibitionGrid within Suspense when event is valid Hackathon", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent as unknown as never);
    vi.mocked(getProjectSubmissions).mockResolvedValue({
      success: true,
      data: [],
    });

    const jsx = await HackathonProjectsPage({ params: Promise.resolve({ slug: "eth-manila-2026" }) });
    render(jsx);

    expect(screen.getByTestId("exhibition-grid-mock")).toBeDefined();
    expect(screen.getByText(/Mock Exhibition: ETH Manila 2026/i)).toBeDefined();
  });
});
