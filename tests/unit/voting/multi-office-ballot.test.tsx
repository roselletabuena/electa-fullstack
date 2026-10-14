import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MultiOfficeBallot } from "@/features/voting/components/multi-office-ballot";
import { BallotReceiptCard } from "@/features/voting/components/ballot-receipt-card";
import { VoterAuthGuard } from "@/features/voting/components/voter-auth-guard";
import type { PublicBallotEventDto } from "@/features/voting/types/ballot";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockEvent: PublicBallotEventDto = {
  id: "evt-uuid-1",
  slug: "university-council-2026",
  title: "University Student Council Elections 2026",
  description: "Official campus student leadership elections.",
  bannerUrl: "https://example.com/banner.jpg",
  startsAt: "2026-10-14T08:00:00.000Z",
  endsAt: "2026-10-15T18:00:00.000Z",
  operationalState: "VotingOpen",
  positions: [
    {
      id: "pos-pres",
      name: "President",
      description: "Chief executive officer of student council",
      minSelectionsPerVoter: 1,
      maxSelectionsPerVoter: 1,
      displayOrder: 1,
      isVotingOpen: true,
    },
    {
      id: "pos-sen",
      name: "Senator",
      description: "Legislative representatives",
      minSelectionsPerVoter: 1,
      maxSelectionsPerVoter: 5,
      displayOrder: 2,
      isVotingOpen: true,
    },
  ],
  candidates: [
    {
      id: "cand-pres-1",
      contestantNumber: 1,
      name: "Maria Santos",
      avatarUrl: "https://example.com/maria.jpg",
      bio: "Action, Service, Integrity",
      positionId: "pos-pres",
      positionName: "President",
    },
    {
      id: "cand-pres-2",
      contestantNumber: 2,
      name: "Juan Dela Cruz",
      avatarUrl: "https://example.com/juan.jpg",
      bio: "Progress for all students",
      positionId: "pos-pres",
      positionName: "President",
    },
    {
      id: "cand-sen-1",
      contestantNumber: 3,
      name: "Senator One",
      avatarUrl: "https://example.com/sen1.jpg",
      positionId: "pos-sen",
      positionName: "Senator",
    },
    {
      id: "cand-sen-2",
      contestantNumber: 4,
      name: "Senator Two",
      avatarUrl: "https://example.com/sen2.jpg",
      positionId: "pos-sen",
      positionName: "Senator",
    },
    {
      id: "cand-sen-3",
      contestantNumber: 5,
      name: "Senator Three",
      avatarUrl: "https://example.com/sen3.jpg",
      positionId: "pos-sen",
      positionName: "Senator",
    },
    {
      id: "cand-sen-4",
      contestantNumber: 6,
      name: "Senator Four",
      avatarUrl: "https://example.com/sen4.jpg",
      positionId: "pos-sen",
      positionName: "Senator",
    },
    {
      id: "cand-sen-5",
      contestantNumber: 7,
      name: "Senator Five",
      avatarUrl: "https://example.com/sen5.jpg",
      positionId: "pos-sen",
      positionName: "Senator",
    },
    {
      id: "cand-sen-6",
      contestantNumber: 8,
      name: "Senator Six",
      avatarUrl: "https://example.com/sen6.jpg",
      positionId: "pos-sen",
      positionName: "Senator",
    },
  ],
};

describe("MultiOfficeBallot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders positions, candidates, and initial zero progress", () => {
    render(<MultiOfficeBallot event={mockEvent} />);

    expect(screen.getByText("University Student Council Elections 2026")).toBeDefined();
    expect(screen.getByText("President")).toBeDefined();
    expect(screen.getByText("Senator")).toBeDefined();
    expect(screen.getByText("Maria Santos")).toBeDefined();
    expect(screen.getByText("Juan Dela Cruz")).toBeDefined();
    expect(screen.getByText("0 of 1 selected")).toBeDefined();
    expect(screen.getByText("0 of 5 selected")).toBeDefined();
  });

  it("Scenario 1: Happy Path - Multi-Office Selection and Review", async () => {
    render(<MultiOfficeBallot event={mockEvent} />);

    // Select 1 President
    const selectMariaBtn = screen.getByLabelText("Select Maria Santos for President");
    fireEvent.click(selectMariaBtn);

    // Select 5 Senators
    fireEvent.click(screen.getByLabelText("Select Senator One for Senator"));
    fireEvent.click(screen.getByLabelText("Select Senator Two for Senator"));
    fireEvent.click(screen.getByLabelText("Select Senator Three for Senator"));
    fireEvent.click(screen.getByLabelText("Select Senator Four for Senator"));
    fireEvent.click(screen.getByLabelText("Select Senator Five for Senator"));

    // Check count indicators
    expect(screen.getByText("1 of 1 selected")).toBeDefined();
    expect(screen.getByText("5 of 5 selected")).toBeDefined();

    // Review Ballot buttons
    const reviewButtons = screen.getAllByRole("button", { name: /Review/i });
    expect(reviewButtons.length).toBeGreaterThan(0);
    fireEvent.click(reviewButtons[0]!);

    // Review Modal should be open
    expect(screen.getByText("Review Your Official Ballot")).toBeDefined();
    expect(screen.getAllByText("Maria Santos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Senator One").length).toBeGreaterThan(0);

    // Click "Edit Selections"
    const editBtn = screen.getByRole("button", { name: "Edit Selections" });
    fireEvent.click(editBtn);

    // Modal closes, selections preserved
    await waitFor(() => {
      expect(screen.queryByText("Review Your Official Ballot")).toBeNull();
    });
    expect(screen.getByText("1 of 1 selected")).toBeDefined();
    expect(screen.getByText("5 of 5 selected")).toBeDefined();
  });

  it("Scenario 2: Validation & Error Handling - Exceeding Seat Limits", () => {
    const customEvent: PublicBallotEventDto = {
      ...mockEvent,
      positions: [
        {
          id: "pos-council",
          name: "Councilor",
          minSelectionsPerVoter: 1,
          maxSelectionsPerVoter: 3,
          displayOrder: 1,
          isVotingOpen: true,
        },
      ],
      candidates: [
        { id: "c-1", contestantNumber: 1, name: "Cand 1", avatarUrl: "", positionId: "pos-council" },
        { id: "c-2", contestantNumber: 2, name: "Cand 2", avatarUrl: "", positionId: "pos-council" },
        { id: "c-3", contestantNumber: 3, name: "Cand 3", avatarUrl: "", positionId: "pos-council" },
        { id: "c-4", contestantNumber: 4, name: "Cand 4", avatarUrl: "", positionId: "pos-council" },
      ],
    };

    render(<MultiOfficeBallot event={customEvent} />);

    // Select 3 candidates
    fireEvent.click(screen.getByLabelText("Select Cand 1 for Councilor"));
    fireEvent.click(screen.getByLabelText("Select Cand 2 for Councilor"));
    fireEvent.click(screen.getByLabelText("Select Cand 3 for Councilor"));

    expect(screen.getByText("3 of 3 selected")).toBeDefined();

    // Attempt to select 4th candidate
    const cand4Btn = screen.getByLabelText("Select Cand 4 for Councilor");
    fireEvent.click(cand4Btn);

    // Checkbox does NOT toggle
    expect(cand4Btn.getAttribute("aria-checked")).toBe("false");

    // Accessible warning appears
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Maximum 3 candidates reached for this office.")).toBeDefined();
  });

  it("auto-swaps candidate for single-seat offices", () => {
    render(<MultiOfficeBallot event={mockEvent} />);

    const mariaBtn = screen.getByLabelText("Select Maria Santos for President");
    const juanBtn = screen.getByLabelText("Select Juan Dela Cruz for President");

    fireEvent.click(mariaBtn);
    expect(mariaBtn.getAttribute("aria-checked")).toBe("true");
    expect(juanBtn.getAttribute("aria-checked")).toBe("false");

    // Click Juan
    fireEvent.click(juanBtn);
    expect(mariaBtn.getAttribute("aria-checked")).toBe("false");
    expect(juanBtn.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("1 of 1 selected")).toBeDefined();
  });

  it("Scenario 3: Edge Case - Confirmation Receipt Display upon successful submission", async () => {
    const mockCastBallot = vi.fn().mockResolvedValue({
      success: true,
      data: {
        ballotId: "ballot-receipt-test-12345",
        eventId: "evt-uuid-1",
        voterId: "voter-user-1",
        votesCount: 2,
        votes: [],
        submittedAt: "2026-10-14T14:00:00.000Z",
      },
      error: null,
    });

    render(<MultiOfficeBallot event={mockEvent} onCastBallot={mockCastBallot} />);

    // Select Maria
    fireEvent.click(screen.getByLabelText("Select Maria Santos for President"));

    // Open review modal
    const reviewButtons = screen.getAllByRole("button", { name: /Review/i });
    fireEvent.click(reviewButtons[0]!);

    // Confirm & cast
    const confirmBtn = screen.getByRole("button", { name: /Confirm & Cast Ballot/i });
    fireEvent.click(confirmBtn);

    // Expect receipt card to render
    await waitFor(() => {
      expect(screen.getByRole("region", { name: "Ballot submission receipt" })).toBeDefined();
    });

    expect(screen.getByText("Ballot Recorded")).toBeDefined();
    expect(screen.getByTestId("receipt-token-value").textContent).toBe("ballot-receipt-test-12345");
  });
});

describe("BallotReceiptCard", () => {
  it("copies token to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <BallotReceiptCard
        receipt={{
          ballotId: "rec-token-999",
          eventId: "evt-1",
          votesCount: 3,
          submittedAt: "2026-10-14T10:00:00Z",
        }}
        eventSlug="test-election"
      />,
    );

    const copyBtn = screen.getByRole("button", { name: "Copy receipt ID to clipboard" });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("rec-token-999");
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeDefined();
    });
  });
});

describe("VoterAuthGuard", () => {
  it("renders unauthenticated prompt", () => {
    render(
      <VoterAuthGuard
        type="unauthenticated"
        eventSlug="test-election"
        allowedDomains={["school.edu"]}
      />,
    );

    expect(screen.getByText("Sign In to Access Ballot")).toBeDefined();
    expect(screen.getByText("@school.edu")).toBeDefined();
  });

  it("renders ineligible restriction", () => {
    render(
      <VoterAuthGuard
        type="ineligible"
        eventSlug="test-election"
        userEmail="outsider@gmail.com"
        allowedDomains={["school.edu"]}
        reason="Voter identity not found in institutional roster"
      />,
    );

    expect(screen.getByText("Voter Eligibility Restricted")).toBeDefined();
    expect(screen.getByText("Voter identity not found in institutional roster")).toBeDefined();
    expect(screen.getByText("outsider@gmail.com")).toBeDefined();
  });

  it("renders already voted notice", () => {
    render(
      <VoterAuthGuard
        type="already_voted"
        eventSlug="test-election"
        eventTitle="Campus Election"
      />,
    );

    expect(screen.getByText("Official Ballot Already Cast")).toBeDefined();
  });
});
