import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ElectionAuditPanel } from "@/features/dashboard/components/election-audit-panel";
import { exportCertifiedTally } from "@/features/dashboard/actions/export-certified-tally";

vi.mock("@/features/dashboard/actions/export-certified-tally", () => ({
  exportCertifiedTally: vi.fn(),
}));

describe("ElectionAuditPanel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOpenTurnout = {
    totalWhitelistedVoters: 2000,
    recordedParticipations: 750,
    turnoutPercentage: 37.5,
    isQuorumMet: false,
    quorumThresholdPercentage: 50,
    votingVelocityPerHour: 42,
    isPollClosed: false,
    endsAt: "2026-10-15T18:00:00.000Z",
  };

  const mockClosedTurnout = {
    ...mockOpenTurnout,
    recordedParticipations: 1200,
    turnoutPercentage: 60.0,
    isQuorumMet: true,
    isPollClosed: true,
  };

  const mockOffices = [
    {
      officeId: "office-1",
      officeName: "President",
      maxSelectionsPerVoter: 1,
      totalVotesCast: 1200,
      candidates: [
        {
          candidateId: "cand-1",
          candidateName: "Alice Chen",
          contestantNumber: 1,
          avatarUrl: "/avatars/alice.png",
          voteCount: 800,
          votePercentage: 66.7,
          isWinner: true,
        },
        {
          candidateId: "cand-2",
          candidateName: "Bob Smith",
          contestantNumber: 2,
          avatarUrl: "/avatars/bob.png",
          voteCount: 400,
          votePercentage: 33.3,
          isWinner: false,
        },
      ],
      winners: [
        {
          candidateId: "cand-1",
          candidateName: "Alice Chen",
          contestantNumber: 1,
          avatarUrl: "/avatars/alice.png",
          voteCount: 800,
          votePercentage: 66.7,
          isWinner: true,
        },
      ],
    },
  ];

  it("Scenario 2: displays sealed banner and hides tallies while polls are open", () => {
    render(
      <ElectionAuditPanel
        eventId="event-123"
        eventTitle="USC Elections 2026"
        endsAt="2026-10-15T18:00:00.000Z"
        turnout={mockOpenTurnout}
        offices={[]}
      />,
    );

    expect(screen.getByTestId("sealed-results-banner")).toBeInTheDocument();
    expect(screen.getByText(/Candidate Results Strictly Sealed/i)).toBeInTheDocument();
    expect(screen.queryByTestId("unsealed-audit-view")).not.toBeInTheDocument();
  });

  it("Scenario 3: displays unsealed audit view with winners when polls are closed", () => {
    render(
      <ElectionAuditPanel
        eventId="event-123"
        eventTitle="USC Elections 2026"
        endsAt="2026-10-14T18:00:00.000Z"
        turnout={mockClosedTurnout}
        offices={mockOffices}
      />,
    );

    expect(screen.queryByTestId("sealed-results-banner")).not.toBeInTheDocument();
    expect(screen.getByTestId("unsealed-audit-view")).toBeInTheDocument();
    expect(screen.getByText("President")).toBeInTheDocument();
    expect(screen.getByText("Alice Chen")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByTestId("winner-badge")).toHaveTextContent("Elected");
    expect(screen.getByTestId("export-tally-button")).toBeInTheDocument();
  });

  it("Scenario 3 (action): triggers certification export and shows SHA-256 audit digest", async () => {
    vi.mocked(exportCertifiedTally).mockResolvedValue({
      success: true,
      data: {
        filename: "audit.csv",
        content: "ELECTA OFFICIAL ELECTION CERTIFICATION REPORT...",
        format: "csv",
        auditHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        certifiedAt: "2026-10-15T00:00:00.000Z",
      },
    });

    render(
      <ElectionAuditPanel
        eventId="event-123"
        eventTitle="USC Elections 2026"
        endsAt="2026-10-14T18:00:00.000Z"
        turnout={mockClosedTurnout}
        offices={mockOffices}
      />,
    );

    const exportBtn = screen.getByTestId("export-tally-button");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(exportCertifiedTally).toHaveBeenCalledWith({
        eventId: "event-123",
        format: "csv",
      });
    });

    expect(await screen.findByTestId("certified-hash-container")).toBeInTheDocument();
    expect(screen.getByTestId("audit-hash-code")).toHaveTextContent(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});
