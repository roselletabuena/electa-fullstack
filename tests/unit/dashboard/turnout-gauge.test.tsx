import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TurnoutGauge } from "@/features/dashboard/components/turnout-gauge";

describe("TurnoutGauge Component", () => {
  const baseMetrics = {
    totalWhitelistedVoters: 2000,
    recordedParticipations: 750,
    turnoutPercentage: 37.5,
    isQuorumMet: false,
    quorumThresholdPercentage: 50,
    votingVelocityPerHour: 42,
    isPollClosed: false,
    endsAt: "2026-10-15T18:00:00.000Z",
  };

  it("renders Scenario 1: 37.5% turnout, counts, and pending quorum badge", () => {
    render(<TurnoutGauge metrics={baseMetrics} />);

    expect(screen.getByTestId("turnout-percentage-value")).toHaveTextContent("37.5");
    expect(screen.getByTestId("roster-count")).toHaveTextContent("2,000");
    expect(screen.getByTestId("participations-count")).toHaveTextContent("750");
    expect(screen.getByTestId("voting-velocity")).toHaveTextContent("42");

    const quorumBadge = screen.getByTestId("quorum-badge");
    expect(quorumBadge).toHaveTextContent("Quorum Pending (50% Req.)");

    // Progressbar accessibility attributes
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "37.5");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders quorum reached badge when threshold is met or exceeded", () => {
    render(
      <TurnoutGauge
        metrics={{
          ...baseMetrics,
          recordedParticipations: 1200,
          turnoutPercentage: 60.0,
          isQuorumMet: true,
        }}
      />,
    );

    const quorumBadge = screen.getByTestId("quorum-badge");
    expect(quorumBadge).toHaveTextContent("Quorum Reached (60%)");
  });

  it("renders empty roster notice when totalWhitelistedVoters is 0 (Scenario 4)", () => {
    render(
      <TurnoutGauge
        metrics={{
          ...baseMetrics,
          totalWhitelistedVoters: 0,
          recordedParticipations: 0,
          turnoutPercentage: 0,
          isQuorumMet: false,
        }}
      />,
    );

    expect(screen.getByTestId("empty-roster-notice")).toBeInTheDocument();
    expect(screen.getByTestId("turnout-percentage-value")).toHaveTextContent("0.0");
  });
});
