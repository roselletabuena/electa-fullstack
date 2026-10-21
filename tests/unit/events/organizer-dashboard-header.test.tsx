import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { OrganizerDashboardHeader } from "@/features/events/components/dashboard/OrganizerDashboardHeader";
import type { Event } from "@/generated/client/client";
import type { UserSession } from "@/lib/auth/get-session";

const mockEvent: Event = {
  id: "73306bb3-4ce7-4399-a7bd-815e65274918",
  title: "Miss Caloocan 2026",
  slug: "miss-caloocan-2026",
  organizerId: "org-123",
  startsAt: new Date(Date.now() - 3600000),
  endsAt: new Date(Date.now() + 3600000),
  publicationStatus: "PUBLISHED",
  bannerUrl: null,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Event;

const mockUser: UserSession = {
  userId: "user-123",
  email: "rosellerpxtabuena@gmail.com",
};

describe("OrganizerDashboardHeader", () => {
  it("renders event title, breadcrumbs, and all section navigation tabs without redundant email", () => {
    render(<OrganizerDashboardHeader event={mockEvent} user={mockUser} activeSection="revenue" />);

    expect(screen.getByText("Miss Caloocan 2026")).toBeDefined();
    expect(screen.getByText("Back to Dashboard")).toBeDefined();
    expect(screen.queryByText("rosellerpxtabuena@gmail.com")).toBeNull();

    const settingsTab = screen.getByRole("link", { name: /event settings/i });
    const contestantsTab = screen.getByRole("link", { name: /contestants/i });
    const revenueTab = screen.getByRole("link", { name: /revenue & payouts/i });

    expect(settingsTab).toBeDefined();
    expect(contestantsTab).toBeDefined();
    expect(revenueTab).toBeDefined();
  });

  it("applies responsive scroll and non-wrapping classes to navigation", () => {
    render(<OrganizerDashboardHeader event={mockEvent} user={mockUser} activeSection="revenue" />);

    const nav = screen.getByRole("navigation", { name: /event dashboard sections/i });
    expect(nav.className).toContain("overflow-x-auto");
    expect(nav.className).toContain("scrollbar-none");

    const revenueTab = screen.getByRole("link", { name: /revenue & payouts/i });
    expect(revenueTab.className).toContain("shrink-0");
    expect(revenueTab.className).toContain("whitespace-nowrap");
    expect(revenueTab.getAttribute("aria-current")).toBe("page");
  });
});
