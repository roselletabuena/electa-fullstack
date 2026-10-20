import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { DashboardEmptyState } from "@/features/events/components/dashboard-overview/DashboardEmptyState";

describe("DashboardEmptyState (VS-118 Spec Alignment)", () => {
  it("renders empty state headline, description, and feature list", () => {
    render(<DashboardEmptyState />);

    expect(screen.getByRole("heading", { level: 2, name: /no events created yet/i })).toBeDefined();
    expect(
      screen.getByText(/get started by creating your first voting competition/i),
    ).toBeDefined();
    expect(screen.getByText(/full candidate profiles & media/i)).toBeDefined();
    expect(screen.getByText(/real-time secure voting/i)).toBeDefined();
  });

  it("does not render redundant create event button within empty state viewport", () => {
    render(<DashboardEmptyState />);

    // Verify VS-118 invariant: No duplicate link/button inside empty state body
    const createButton = screen.queryByRole("link", { name: /create your first event/i });
    expect(createButton).toBeNull();
  });
});
