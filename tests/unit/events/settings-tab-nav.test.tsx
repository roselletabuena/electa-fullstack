import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SettingsTabNav } from "@/features/events/components/dashboard/SettingsTabNav";
import type { LaunchReadinessSnapshot } from "@/features/events/types/launch-readiness";
import type { Event } from "@/generated/client/client";

vi.mock("nuqs", () => ({
  useQueryState: vi.fn((_key, _options) => {
    return ["general", vi.fn()];
  }),
  parseAsStringLiteral: vi.fn(() => ({
    withDefault: vi.fn().mockReturnThis(),
    withOptions: vi.fn().mockReturnThis(),
  })),
}));

const mockEvent: Event = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "rey-ng-tarlac-2026",
  title: "Rey ng Tarlac 2026",
  description: "Pageant description",
  bannerUrl: "https://example.com/banner.jpg",
  startsAt: new Date("2026-11-01T00:00:00Z"),
  endsAt: new Date("2026-11-30T23:59:59Z"),
  publicationStatus: "DRAFT",
  draftPassphraseHash: null,
  showResultsOnClose: true,
  isFreeVotingEnabled: true,
  isFreeVotingOnly: false,
  allowedEmailDomains: [],
  dailyFreeVoteLimit: 1,
  takeRatePercentage: "12.00" as unknown as Event["takeRatePercentage"],
  organizerId: "org-1",
  archetype: "PAGEANT",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSnapshot: LaunchReadinessSnapshot = {
  eventId: "550e8400-e29b-41d4-a716-446655440000",
  slug: "rey-ng-tarlac-2026",
  publicationStatus: "DRAFT",
  divisionsCount: 0,
  contestantsCount: 0,
  hasVotingRulesConfigured: false,
  totalMilestones: 4,
  completedMilestones: 1,
  percentageComplete: 25,
  isAllCompleted: false,
  items: [
    {
      id: "event-profile",
      title: "Event Profile Created",
      description: "Basic competition details configured.",
      isCompleted: true,
      actionLabel: "Edit Profile",
      actionHref: "/events/rey-ng-tarlac-2026/settings?tab=general",
    },
    {
      id: "divisions",
      title: "Set Up Divisions",
      description: "Structure competition brackets.",
      isCompleted: false,
      actionLabel: "Configure Divisions",
      actionHref: "/events/rey-ng-tarlac-2026/settings?tab=categories",
    },
    {
      id: "contestants",
      title: "Add Contestants",
      description: "Register delegates and candidates.",
      isCompleted: false,
      actionLabel: "Manage Contestants",
      actionHref: "/events/rey-ng-tarlac-2026/contestants",
    },
    {
      id: "voting-rules",
      title: "Configure Voting Rules",
      description: "Set free limits and voting rules.",
      isCompleted: false,
      actionLabel: "Configure Rules",
      actionHref: "/events/rey-ng-tarlac-2026/settings?tab=voting-rules",
    },
  ],
};

describe("SettingsTabNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 4 settings sections with badges", () => {
    render(<SettingsTabNav event={mockEvent} snapshot={mockSnapshot} />);

    expect(screen.getByText("General & Branding")).toBeDefined();
    expect(screen.getByText("Schedule & Timeline")).toBeDefined();
    expect(screen.getByText("Voting Rules & Quotas")).toBeDefined();
    expect(screen.getByText("Categories & Awards")).toBeDefined();

    expect(screen.getByText("Identity")).toBeDefined();
    expect(screen.getByText(/Nov 1.*30/)).toBeDefined();
    expect(screen.getByText("1 Free")).toBeDefined();
    expect(screen.getByText("Divisions")).toBeDefined();
  });

  it("renders Launch Readiness section with percentage and next task in collapsed mode", () => {
    render(<SettingsTabNav event={mockEvent} snapshot={mockSnapshot} />);

    const region = screen.getByRole("region", { name: /launch readiness checklist/i });
    expect(region).toBeDefined();

    expect(screen.getByText("25%")).toBeDefined();
    expect(screen.getByText(/1 of 4 completed/i)).toBeDefined();

    // Next action link in collapsed state
    expect(screen.getByText(/Next:/i)).toBeDefined();
    expect(screen.getByText("Set Up Divisions")).toBeDefined();
    expect(screen.getByRole("link", { name: /configure divisions/i })).toBeDefined();
  });

  it("expands milestone tasks list when clicking Tasks button", () => {
    render(<SettingsTabNav event={mockEvent} snapshot={mockSnapshot} />);

    const toggleButton = screen.getByRole("button", { name: /expand launch readiness tasks/i });
    expect(toggleButton).toBeDefined();

    // Click to expand
    fireEvent.click(toggleButton);

    expect(screen.getByText("Event Profile Created")).toBeDefined();
    expect(screen.getByText("Set Up Divisions")).toBeDefined();
    expect(screen.getByText("Add Contestants")).toBeDefined();
    expect(screen.getByText("Configure Voting Rules")).toBeDefined();

    expect(screen.getByRole("link", { name: /manage contestants/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /configure rules/i })).toBeDefined();
  });
});
