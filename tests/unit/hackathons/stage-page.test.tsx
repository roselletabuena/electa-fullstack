import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StagePage, { generateMetadata } from "@/app/(public)/events/[slug]/stage/page";
import { db } from "@/lib/db";
import { EventArchetype, EventPublicationStatus } from "@/generated/client/client";
import * as peoplesChoiceService from "@/features/hackathons/services/peoples-choice-service";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/features/hackathons/services/peoples-choice-service", () => ({
  getStageLeaderboardData: vi.fn(),
}));

vi.mock("@/features/hackathons/components/stage-leaderboard", () => ({
  StageLeaderboard: ({ initialData }: { initialData: any }) => (
    <div data-testid="stage-leaderboard">
      <div>{initialData.eventTitle}</div>
      <div>{initialData.topProjects?.[0]?.title}</div>
    </div>
  ),
}));

describe("StagePage Route Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders stage presentation for Hackathon archetype event", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce({
      id: "evt-1",
      slug: "hack-surge",
      title: "HackSurge 2026",
      archetype: EventArchetype.HACKATHON,
      publicationStatus: EventPublicationStatus.PUBLISHED,
    } as any);

    vi.mocked(peoplesChoiceService.getStageLeaderboardData).mockResolvedValueOnce({
      eventId: "evt-1",
      eventSlug: "hack-surge",
      eventTitle: "HackSurge 2026",
      totalVotesCast: 10,
      totalProjects: 1,
      tracks: ["AI"],
      topProjects: [
        {
          id: "sub-1",
          title: "NeuralIDE",
          tagline: "AI IDE",
          repositoryUrl: "https://github.com/neural",
          demoUrl: null,
          trackTags: ["AI"],
          members: ["Alice"],
          voteCount: 10,
          rank: 1,
          votePercentage: 100,
        },
      ],
    });

    const pageElement = await StagePage({
      params: Promise.resolve({ slug: "hack-surge" }),
    });

    render(pageElement);

    expect(screen.getByText("HackSurge 2026")).toBeInTheDocument();
    expect(screen.getByText("NeuralIDE")).toBeInTheDocument();
  });

  it("renders fallback notice when event archetype is not HACKATHON", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce({
      id: "evt-pageant",
      slug: "miss-universe",
      title: "Miss Universe",
      archetype: EventArchetype.PAGEANT,
      publicationStatus: EventPublicationStatus.PUBLISHED,
    } as any);

    const pageElement = await StagePage({
      params: Promise.resolve({ slug: "miss-universe" }),
    });

    render(pageElement);

    expect(screen.getByText("Stage Leaderboard Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText(/exclusively enabled for Hackathon archetype events/i)
    ).toBeInTheDocument();
  });

  it("generates correct metadata", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce({
      title: "HackSurge 2026",
    } as any);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "hack-surge" }),
    });

    expect(meta.title).toContain("HackSurge 2026");
    expect(meta.description).toContain("projector");
  });
});
