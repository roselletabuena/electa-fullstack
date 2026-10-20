import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LaunchReadinessChecklist } from "@/features/events/components/dashboard/LaunchReadinessChecklist";
import type { LaunchReadinessSnapshot } from "@/features/events/types/launch-readiness";

const mockDraftSnapshot: LaunchReadinessSnapshot = {
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
      title: "Configure Voting Rules & Pricing",
      description: "Set free limits and boost packages.",
      isCompleted: false,
      actionLabel: "Configure Rules",
      actionHref: "/events/rey-ng-tarlac-2026/settings?tab=voting-rules",
    },
  ],
};

describe("LaunchReadinessChecklist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the checklist in DRAFT status with 4 milestones and progress bar", () => {
    render(<LaunchReadinessChecklist snapshot={mockDraftSnapshot} />);

    expect(screen.getByRole("region", { name: /launch readiness checklist/i })).toBeDefined();
    expect(screen.getByText("Launch Readiness Checklist")).toBeDefined();
    expect(screen.getByText(/1 of 4 completed/i)).toBeDefined();
    expect(screen.getByText(/25%/i)).toBeDefined();

    // Completed milestone
    expect(screen.getByText("Event Profile Created")).toBeDefined();

    // Incomplete milestones and links
    expect(screen.getByRole("link", { name: /configure divisions/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /manage contestants/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /configure rules/i })).toBeDefined();

    // Progress bar accessible attributes
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar.getAttribute("aria-valuenow")).toBe("25");
    expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("renders compact 'Ready & Live' banner when status is PUBLISHED and handles dismissal", async () => {
    const publishedSnapshot: LaunchReadinessSnapshot = {
      ...mockDraftSnapshot,
      publicationStatus: "PUBLISHED",
      isAllCompleted: true,
      completedMilestones: 4,
      percentageComplete: 100,
      items: mockDraftSnapshot.items.map((item) => ({ ...item, isCompleted: true })),
    };

    const { unmount } = render(<LaunchReadinessChecklist snapshot={publishedSnapshot} />);

    expect(screen.getByText(/competition is ready & live/i)).toBeDefined();
    const dismissButton = screen.getByRole("button", { name: /dismiss/i });
    expect(dismissButton).toBeDefined();

    fireEvent.click(dismissButton);

    // After dismissal, it should no longer be visible
    expect(screen.queryByText(/competition is ready & live/i)).toBeNull();
    expect(localStorage.getItem(`electa_dismissed_readiness_${publishedSnapshot.eventId}`)).toBe(
      "true",
    );

    unmount();

    // Subsequent render should return null directly due to localStorage check
    const { container } = render(<LaunchReadinessChecklist snapshot={publishedSnapshot} />);
    expect(container.firstChild).toBeNull();
  });

  it("toggles collapse state between expanded cards and compact strip with persistence", () => {
    const { unmount } = render(<LaunchReadinessChecklist snapshot={mockDraftSnapshot} />);

    // Initially expanded: subtitle and milestone cards are visible
    expect(screen.getByText(/complete these essential setup tasks before opening/i)).toBeDefined();
    expect(screen.getByText("Event Profile Created")).toBeDefined();

    // Find and click the Minimize button
    const toggleButton = screen.getByRole("button", {
      name: /minimize launch readiness checklist/i,
    });
    expect(toggleButton).toBeDefined();
    fireEvent.click(toggleButton);

    // After collapse: 4 cards & subtitle are hidden, compact next milestone inline is shown
    expect(screen.queryByText(/complete these essential setup tasks before opening/i)).toBeNull();
    expect(screen.getByText(/next:/i)).toBeDefined();
    expect(localStorage.getItem(`electa_collapsed_readiness_${mockDraftSnapshot.eventId}`)).toBe(
      "true",
    );

    // The toggle button now has "Expand" label and aria-label
    const expandButton = screen.getByRole("button", {
      name: /expand launch readiness checklist/i,
    });
    expect(expandButton).toBeDefined();

    // Click Expand to restore
    fireEvent.click(expandButton);
    expect(screen.getByText(/complete these essential setup tasks before opening/i)).toBeDefined();
    expect(localStorage.getItem(`electa_collapsed_readiness_${mockDraftSnapshot.eventId}`)).toBe(
      "false",
    );

    unmount();

    // If pre-set to collapsed in localStorage, renders collapsed directly
    localStorage.setItem(`electa_collapsed_readiness_${mockDraftSnapshot.eventId}`, "true");
    render(<LaunchReadinessChecklist snapshot={mockDraftSnapshot} />);
    expect(screen.queryByText(/complete these essential setup tasks before opening/i)).toBeNull();
    expect(
      screen.getByRole("button", { name: /expand launch readiness checklist/i }),
    ).toBeDefined();
  });
});
