import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FreeVoteCooldownBanner } from "@/features/voting/components/FreeVoteCooldownBanner";
import { EventVotingRulesBanner } from "@/features/events/components/EventVotingRulesBanner";
import type { VoterQuotaStateDto } from "@/features/voting/types";

let mockQuotaData: {
  quota: VoterQuotaStateDto | null;
  isLoading: boolean;
  formattedCountdown: string;
} = {
  quota: null,
  isLoading: false,
  formattedCountdown: "",
};

vi.mock("@/features/voting/hooks/use-free-vote-quota", () => ({
  useFreeVoteQuota: () => mockQuotaData,
}));

describe("FreeVoteCooldownBanner & Unified EventVotingRulesBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active free voting state with remaining votes and 24h reset indicator", () => {
    mockQuotaData = {
      quota: {
        dailyLimit: 5,
        votesUsedIn24h: 1,
        remainingVotes: 4,
        isFreeVotingEnabled: true,
        isEventActive: true,
        isInCooldown: false,
        nextResetTime: null,
      },
      isLoading: false,
      formattedCountdown: "",
    };

    render(<FreeVoteCooldownBanner eventId="evt-1" dailyFreeVoteLimit={5} />);

    expect(screen.getByText("Daily Free Voting Active")).toBeDefined();
    expect(screen.getByText(/5 Free Votes \/ 24h/i)).toBeDefined();
    expect(screen.getByText(/4 of 5/i)).toBeDefined();
    expect(screen.getByText(/24h Rolling Reset/i)).toBeDefined();
  });

  it("renders cooldown state when daily quota is reached with live countdown and power boost CTA", () => {
    const handleBoostClick = vi.fn();

    mockQuotaData = {
      quota: {
        dailyLimit: 5,
        votesUsedIn24h: 5,
        remainingVotes: 0,
        isFreeVotingEnabled: true,
        isEventActive: true,
        isInCooldown: true,
        nextResetTime: new Date(Date.now() + 3600000).toISOString(),
      },
      isLoading: false,
      formattedCountdown: "17:17:20",
    };

    render(
      <FreeVoteCooldownBanner
        eventId="evt-1"
        dailyFreeVoteLimit={5}
        onBoostClick={handleBoostClick}
      />,
    );

    expect(screen.getByText("Daily Quota Reached")).toBeDefined();
    expect(screen.getByText("17:17:20")).toBeDefined();
    expect(screen.getByText(/All 5 free daily votes have been cast/i)).toBeDefined();

    const boostButton = screen.getByRole("button", { name: /Power Boost Candidates/i });
    expect(boostButton).toBeDefined();

    fireEvent.click(boostButton);
    expect(handleBoostClick).toHaveBeenCalledTimes(1);
  });

  it("renders coronation phase when free voting is paused", () => {
    const handleBoostClick = vi.fn();

    mockQuotaData = {
      quota: {
        dailyLimit: 5,
        votesUsedIn24h: 0,
        remainingVotes: 0,
        isFreeVotingEnabled: false,
        isEventActive: true,
        isInCooldown: false,
        nextResetTime: null,
      },
      isLoading: false,
      formattedCountdown: "",
    };

    render(
      <EventVotingRulesBanner
        eventId="evt-1"
        isFreeVotingEnabled={false}
        onBoostClick={handleBoostClick}
      />,
    );

    expect(screen.getByText("Coronation Phase: Paid Boost Voting Active")).toBeDefined();
    expect(screen.getByText("Grand Finals Mode")).toBeDefined();
    expect(screen.getByText(/Daily free voting is currently closed for this round/i)).toBeDefined();

    const boostButton = screen.getByRole("button", { name: /Power Boost Candidates/i });
    expect(boostButton).toBeDefined();
    fireEvent.click(boostButton);
    expect(handleBoostClick).toHaveBeenCalledTimes(1);
  });

  it("renders graceful fallback with configured limit while quota is loading", () => {
    mockQuotaData = {
      quota: null,
      isLoading: true,
      formattedCountdown: "",
    };

    render(<FreeVoteCooldownBanner eventId="evt-1" dailyFreeVoteLimit={3} />);

    expect(screen.getByText("Daily Free Voting Active")).toBeDefined();
    expect(screen.getByText(/3 Free Votes \/ 24h/i)).toBeDefined();
    expect(screen.getByText(/3 of 3/i)).toBeDefined();
  });
});
