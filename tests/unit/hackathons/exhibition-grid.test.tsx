import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ExhibitionGrid } from "@/features/hackathons/components/exhibition-grid";
import type { ProjectSubmissionDto } from "@/features/hackathons/types/submission";

// Mock nuqs
let mockTrack: string | null = "all";
const mockSetUrlTrack = vi.fn((newVal: string | null) => {
  mockTrack = newVal;
  return Promise.resolve(new URLSearchParams());
});

vi.mock("nuqs", () => ({
  parseAsString: {
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  },
  useQueryState: vi.fn(() => [mockTrack, mockSetUrlTrack]),
}));

describe("ExhibitionGrid Component", () => {
  const mockSubmissions: ProjectSubmissionDto[] = [
    {
      id: "sub-1",
      eventId: "evt-1",
      teamLeadId: "lead-1",
      title: "Agentic DAO Guard",
      tagline: "Autonomous agent for treasury security",
      description: "Monitors multisig transactions using deep learning agents.",
      repositoryUrl: "https://github.com/agent-dao/guard",
      demoUrl: "https://guard.agentdao.org",
      videoUrl: null,
      status: "ACCEPTED",
      createdAt: "2026-10-14T10:00:00.000Z",
      updatedAt: "2026-10-14T10:00:00.000Z",
      members: [{ id: "m1", submissionId: "sub-1", name: "Bob", email: "bob@dao.org", role: "Dev", createdAt: "" }],
      trackTags: [{ id: "t1", submissionId: "sub-1", trackName: "AI & Agents", createdAt: "" }],
      links: [],
    },
    {
      id: "sub-2",
      eventId: "evt-1",
      teamLeadId: "lead-2",
      title: "Decentralized Micro-Tally",
      tagline: "Instant gasless voting",
      description: "A fast offchain voting rollup with fraud proofs.",
      repositoryUrl: "https://github.com/rollups/micro-tally",
      demoUrl: "https://tally.rollups.io",
      videoUrl: null,
      status: "SUBMITTED",
      createdAt: "2026-10-14T11:00:00.000Z",
      updatedAt: "2026-10-14T11:00:00.000Z",
      members: [{ id: "m2", submissionId: "sub-2", name: "Carol", email: "carol@rollups.io", role: "Lead", createdAt: "" }],
      trackTags: [{ id: "t2", submissionId: "sub-2", trackName: "Web3", createdAt: "" }],
      links: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrack = "all";
  });

  it("renders all projects when track is all (Scenario 1 Happy Path)", () => {
    render(
      <ExhibitionGrid
        eventSlug="eth-manila-2026"
        eventTitle="ETH Global Manila 2026"
        initialSubmissions={mockSubmissions}
      />
    );

    expect(screen.getByText("Agentic DAO Guard")).toBeDefined();
    expect(screen.getByText("Decentralized Micro-Tally")).toBeDefined();
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName.toLowerCase() === "span" &&
          Boolean(element?.textContent && /Showing\s*2\s*of\s*2\s*projects/i.test(element.textContent))
      )
    ).toBeDefined();
  });

  it("updates URL state when selecting a track filter pill (Scenario 3)", () => {
    render(
      <ExhibitionGrid
        eventSlug="eth-manila-2026"
        eventTitle="ETH Global Manila 2026"
        initialSubmissions={mockSubmissions}
        availableTracks={["AI & Agents", "Web3"]}
      />
    );

    const aiTrackButton = screen.getByRole("button", { name: "AI & Agents" });
    fireEvent.click(aiTrackButton);

    expect(mockSetUrlTrack).toHaveBeenCalledWith("ai-agents");
  });

  it("filters projects according to the active URL track", () => {
    mockTrack = "ai-agents";

    render(
      <ExhibitionGrid
        eventSlug="eth-manila-2026"
        eventTitle="ETH Global Manila 2026"
        initialSubmissions={mockSubmissions}
        availableTracks={["AI & Agents", "Web3"]}
      />
    );

    expect(screen.getByText("Agentic DAO Guard")).toBeDefined();
    expect(screen.queryByText("Decentralized Micro-Tally")).toBeNull();
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName.toLowerCase() === "span" &&
          Boolean(element?.textContent && /Showing\s*1\s*of\s*2\s*projects/i.test(element.textContent))
      )
    ).toBeDefined();
  });

  it("filters projects in real-time via search query input", () => {
    render(
      <ExhibitionGrid
        eventSlug="eth-manila-2026"
        eventTitle="ETH Global Manila 2026"
        initialSubmissions={mockSubmissions}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search projects/i);
    fireEvent.change(searchInput, { target: { value: "rollup" } });

    expect(screen.queryByText("Agentic DAO Guard")).toBeNull();
    expect(screen.getByText("Decentralized Micro-Tally")).toBeDefined();
  });

  it("displays empty state when no projects match the filter (Scenario 4)", () => {
    mockTrack = "non-existent-track";

    render(
      <ExhibitionGrid
        eventSlug="eth-manila-2026"
        eventTitle="ETH Global Manila 2026"
        initialSubmissions={mockSubmissions}
      />
    );

    expect(screen.getByTestId("exhibition-empty-state")).toBeDefined();
    expect(screen.getByText(/No projects found/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Clear Filters/i })).toBeDefined();
  });

  it("opens submission modal when clicking Submit Project button", () => {
    render(
      <ExhibitionGrid
        eventSlug="eth-manila-2026"
        eventTitle="ETH Global Manila 2026"
        initialSubmissions={mockSubmissions}
        isSubmissionOpen={true}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Submit Project/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Submit Hackathon Project/i)).toBeDefined();
  });
});
