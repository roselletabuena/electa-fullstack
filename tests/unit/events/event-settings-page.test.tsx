import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import EventSettingsPage from "@/app/(dashboard)/events/[slug]/settings/page";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { db } from "@/lib/db";
import type { Event } from "@/generated/client/client";

vi.mock("@/features/events/utils/ownership-guard", () => ({
  requireEventOwnership: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    division: {
      count: vi.fn(),
    },
    contestant: {
      count: vi.fn(),
    },
    eventAuditLog: {
      count: vi.fn(),
    },
  },
}));

vi.mock("@/features/events/components/dashboard/OrganizerDashboardHeader", () => ({
  OrganizerDashboardHeader: ({ event }: { event: { title: string } }) => (
    <div data-testid="dashboard-header">{event.title}</div>
  ),
}));

vi.mock("@/features/events/components/dashboard/SettingsTabsContainer", () => ({
  SettingsTabsContainer: () => <div data-testid="settings-tabs">Settings Tabs</div>,
}));

describe("EventSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches readiness counts and renders LaunchReadinessChecklist in DRAFT event", async () => {
    const mockEvent: Event = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      slug: "binibini-2026",
      title: "Binibining Pilipinas 2026",
      description: "Grand Pageant",
      bannerUrl: "https://example.com/banner.jpg",
      startsAt: new Date("2026-11-01T00:00:00Z"),
      endsAt: new Date("2026-11-30T23:59:59Z"),
      publicationStatus: "DRAFT",
      draftPassphraseHash: null,
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      isFreeVotingOnly: false,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: "12.00" as unknown as Event["takeRatePercentage"],
      organizerId: "org-1",
      archetype: "PAGEANT",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockEvent,
      session: { userId: "org-1", email: "org@example.com" },
    });

    vi.mocked(db.division.count).mockResolvedValue(1);
    vi.mocked(db.contestant.count).mockResolvedValue(0);
    vi.mocked(db.eventAuditLog.count).mockResolvedValue(0);

    const pageElement = await EventSettingsPage({
      params: Promise.resolve({ slug: "binibini-2026" }),
      searchParams: Promise.resolve({}),
    });

    render(pageElement);

    expect(screen.getByTestId("dashboard-header")).toBeDefined();
    expect(screen.getByRole("region", { name: /launch readiness checklist/i })).toBeDefined();
    expect(screen.getByText(/2 of 4 completed/i)).toBeDefined();
    expect(screen.getByText(/50%/i)).toBeDefined();
  });
});
