import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SlugAvailabilityBadge } from "@/features/events/components/SlugAvailabilityBadge";

describe("SlugAvailabilityBadge", () => {
  it("renders nothing when status is idle", () => {
    const { container } = render(<SlugAvailabilityBadge status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders checking state with spinner and label", () => {
    render(<SlugAvailabilityBadge status="checking" />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking availability...");
  });

  it("renders available state with success badge", () => {
    render(<SlugAvailabilityBadge status="available" />);
    expect(screen.getByRole("status")).toHaveTextContent("Slug available");
  });

  it("renders unavailable state with collision badge", () => {
    render(<SlugAvailabilityBadge status="unavailable" />);
    expect(screen.getByRole("status")).toHaveTextContent("Slug already in use");
  });

  it("renders reserved state with warning badge", () => {
    render(<SlugAvailabilityBadge status="reserved" />);
    expect(screen.getByRole("status")).toHaveTextContent("Reserved system keyword");
  });

  it("renders custom message when provided", () => {
    render(<SlugAvailabilityBadge status="unavailable" message="Custom collision error" />);
    expect(screen.getByRole("status")).toHaveTextContent("Custom collision error");
  });
});
