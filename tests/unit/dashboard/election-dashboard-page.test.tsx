import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ElectionDashboardPage from "@/app/(dashboard)/events/[slug]/elections/page";
import { getSession } from "@/lib/auth/get-session";
import { getElectionDashboardData } from "@/features/dashboard/actions/get-election-dashboard-data";
import { redirect, notFound } from "next/navigation";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/features/dashboard/actions/get-election-dashboard-data", () => ({
  getElectionDashboardData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("ElectionDashboardPage RSC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    await ElectionDashboardPage({
      params: Promise.resolve({ slug: "usc-election-2026" }),
    });

    expect(redirect).toHaveBeenCalledWith(
      "/login?redirect=%2Fevents%2Fusc-election-2026%2Felections",
    );
  });

  it("triggers notFound() when election event does not exist", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "user-1",
      email: "test@example.com",
    });

    vi.mocked(getElectionDashboardData).mockResolvedValue({
      success: false,
      data: null,
      error: {
        code: "NOT_FOUND",
        message: "Election event not found.",
      },
    });

    await ElectionDashboardPage({
      params: Promise.resolve({ slug: "nonexistent" }),
    });

    expect(notFound).toHaveBeenCalled();
  });

  it("renders forbidden banner when user is not authorized organizer", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "user-unauthorized",
      email: "unauthorized@example.com",
    });

    vi.mocked(getElectionDashboardData).mockResolvedValue({
      success: false,
      data: null,
      error: {
        code: "FORBIDDEN",
        message: "Only the designated election organizer can inspect the audit dashboard.",
      },
    });

    const jsx = await ElectionDashboardPage({
      params: Promise.resolve({ slug: "usc-election-2026" }),
    });

    render(jsx);

    expect(
      screen.getByText(/Access Denied: Organizer Authorization Required/i),
    ).toBeInTheDocument();
  });

  it("renders election dashboard client when session is authorized", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "organizer-123",
      email: "commissioner@school.edu",
    });

    vi.mocked(getElectionDashboardData).mockResolvedValue({
      success: true,
      data: {
        event: {
          id: "event-123",
          title: "University Student Council Elections 2026",
          slug: "usc-election-2026",
          startsAt: "2026-10-14T08:00:00.000Z",
          endsAt: "2026-10-15T18:00:00.000Z",
          organizerId: "organizer-123",
        },
        turnout: {
          totalWhitelistedVoters: 2000,
          recordedParticipations: 750,
          turnoutPercentage: 37.5,
          isQuorumMet: false,
          quorumThresholdPercentage: 50,
          votingVelocityPerHour: 42,
          isPollClosed: false,
          endsAt: "2026-10-15T18:00:00.000Z",
        },
        offices: [],
        isPollClosed: false,
      },
    });

    const jsx = await ElectionDashboardPage({
      params: Promise.resolve({ slug: "usc-election-2026" }),
    });

    render(jsx);

    expect(
      screen.getByText("University Student Council Elections 2026"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("turnout-percentage-value")).toHaveTextContent("37.5");
    expect(screen.getByTestId("sealed-results-banner")).toBeInTheDocument();
  });
});
