import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PeoplesChoiceVoteButton } from "@/features/hackathons/components/peoples-choice-vote-button";
import * as castAction from "@/features/hackathons/actions/cast-peoples-choice-vote";
import { toast } from "sonner";

vi.mock("@/features/hackathons/actions/cast-peoples-choice-vote", () => ({
  castPeoplesChoiceVoteAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PeoplesChoiceVoteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders unvoted state with 'Vote People's Choice' label", () => {
    render(
      <PeoplesChoiceVoteButton
        eventId="evt-1"
        submissionId="sub-1"
        projectTitle="Quantum Agent"
        initialVoteCount={5}
      />
    );

    const button = screen.getByRole("button", { name: /Vote People's Choice for Quantum Agent/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Vote People's Choice")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shifts to active 'Voted' state upon successful vote (Scenario 1)", async () => {
    vi.mocked(castAction.castPeoplesChoiceVoteAction).mockResolvedValueOnce({
      success: true,
      data: {
        submissionId: "sub-1",
        totalVotes: 6,
        hasVoted: true,
      },
      error: null,
    });

    const onVoteSuccess = vi.fn();

    render(
      <PeoplesChoiceVoteButton
        eventId="evt-1"
        submissionId="sub-1"
        projectTitle="Quantum Agent"
        initialVoteCount={5}
        onVoteSuccess={onVoteSuccess}
      />
    );

    const button = screen.getByRole("button", { name: /Vote People's Choice for Quantum Agent/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Voted")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Vote recorded"),
      expect.anything()
    );
    expect(onVoteSuccess).toHaveBeenCalledWith(6);
  });

  it("displays accessible toast alert when duplicate vote is blocked (Scenario 2)", async () => {
    vi.mocked(castAction.castPeoplesChoiceVoteAction).mockResolvedValueOnce({
      success: false,
      data: null,
      error: {
        code: "ALREADY_VOTED",
        message: "You have already cast your People's Choice vote for this hackathon.",
      },
    });

    render(
      <PeoplesChoiceVoteButton
        eventId="evt-1"
        submissionId="sub-2"
        projectTitle="Another Team"
        initialVoteCount={2}
      />
    );

    const button = screen.getByRole("button", { name: /Vote People's Choice for Another Team/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "You have already cast your People's Choice vote for this hackathon."
      );
    });

    // Should remain in unvoted state for this card
    expect(screen.getByText("Vote People's Choice")).toBeInTheDocument();
  });

  it("disables button when isVotingOpen is false", () => {
    render(
      <PeoplesChoiceVoteButton
        eventId="evt-1"
        submissionId="sub-1"
        projectTitle="Quantum Agent"
        isVotingOpen={false}
      />
    );

    const button = screen.getByRole("button", { name: /Vote People's Choice for Quantum Agent/i });
    expect(button).toBeDisabled();
  });

  it("renders active 'Voted' state if initialHasVoted is true", () => {
    render(
      <PeoplesChoiceVoteButton
        eventId="evt-1"
        submissionId="sub-1"
        projectTitle="Quantum Agent"
        initialHasVoted={true}
        initialVoteCount={12}
      />
    );

    expect(screen.getByText("Voted")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
