import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StageLeaderboard } from "@/features/hackathons/components/stage-leaderboard";
import type { StageLeaderboardDataDto } from "@/features/hackathons/types/peoples-choice";

describe("StageLeaderboard Component", () => {
  const mockInitialData: StageLeaderboardDataDto = {
    eventId: "evt-123",
    eventSlug: "hack-surge-2026",
    eventTitle: "HackSurge 2026",
    totalVotesCast: 100,
    totalProjects: 3,
    tracks: ["AI & Agents", "Web3", "Developer Tooling"],
    topProjects: [
      {
        id: "sub-1",
        title: "zkVoting Shield",
        tagline: "Cryptographic privacy",
        repositoryUrl: "https://github.com/zk/shield",
        demoUrl: "https://zk.shield.io",
        trackTags: ["Web3"],
        members: ["Satoshi", "Ada"],
        voteCount: 50,
        rank: 1,
        votePercentage: 50,
      },
      {
        id: "sub-2",
        title: "AgentIDE",
        tagline: "Autonomous coding engine",
        repositoryUrl: "https://github.com/agent/ide",
        demoUrl: null,
        trackTags: ["AI & Agents"],
        members: ["Alan Turing"],
        voteCount: 30,
        rank: 2,
        votePercentage: 30,
      },
      {
        id: "sub-3",
        title: "DevPulse CLI",
        tagline: "Terminal productivity",
        repositoryUrl: "https://github.com/dev/pulse",
        demoUrl: "https://devpulse.sh",
        trackTags: ["Developer Tooling"],
        members: ["Linus"],
        voteCount: 20,
        rank: 3,
        votePercentage: 20,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders stage title, total vote metric, and ranked projects (Scenario 3)", () => {
    render(<StageLeaderboard initialData={mockInitialData} pollIntervalMs={0} />);

    expect(screen.getByText("HackSurge 2026")).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText("zkVoting Shield")).toBeInTheDocument();
    expect(screen.getByText("AgentIDE")).toBeInTheDocument();
    expect(screen.getByText("DevPulse CLI")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
  });

  it("filters displayed projects when track filter pill is clicked", async () => {
    render(<StageLeaderboard initialData={mockInitialData} pollIntervalMs={0} />);

    const web3Pill = screen.getByRole("button", { name: "Web3" });
    fireEvent.click(web3Pill);

    await waitFor(() => {
      expect(screen.getByText("zkVoting Shield")).toBeInTheDocument();
      expect(screen.queryByText("AgentIDE")).not.toBeInTheDocument();
      expect(screen.queryByText("DevPulse CLI")).not.toBeInTheDocument();
    });

    const allPill = screen.getByRole("button", { name: "All Tracks" });
    fireEvent.click(allPill);

    await waitFor(() => {
      expect(screen.getByText("zkVoting Shield")).toBeInTheDocument();
      expect(screen.getByText("AgentIDE")).toBeInTheDocument();
      expect(screen.getByText("DevPulse CLI")).toBeInTheDocument();
    });
  });

  it("toggles fullscreen mode when fullscreen button is clicked", () => {
    const requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, "requestFullscreen", {
      value: requestFullscreenMock,
      writable: true,
      configurable: true,
    });

    render(<StageLeaderboard initialData={mockInitialData} pollIntervalMs={0} />);

    const fullscreenBtn = screen.getByRole("button", { name: /Enter Fullscreen/i });
    fireEvent.click(fullscreenBtn);

    expect(requestFullscreenMock).toHaveBeenCalled();
  });

  it("renders podium highlights for the top 3 projects", () => {
    render(<StageLeaderboard initialData={mockInitialData} pollIntervalMs={0} />);

    expect(screen.getByTestId("stage-rank-card-sub-1")).toBeInTheDocument();
    expect(screen.getByTestId("stage-rank-card-sub-2")).toBeInTheDocument();
    expect(screen.getByTestId("stage-rank-card-sub-3")).toBeInTheDocument();
  });
});
