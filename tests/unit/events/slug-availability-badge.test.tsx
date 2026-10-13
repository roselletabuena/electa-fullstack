import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlugAvailabilityBadge } from "@/features/events/components/SlugAvailabilityBadge";

describe("SlugAvailabilityBadge", () => {
  it("renders null when status is idle", () => {
    const { container } = render(<SlugAvailabilityBadge status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders checking state with brutalist zero-radius styling", () => {
    render(<SlugAvailabilityBadge status="checking" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Checking availability/i);
    expect(badge.className).toContain("rounded-none");
    expect(badge.className).not.toContain("rounded-full");
    expect(badge.className).toContain("font-mono");
  });

  it("renders available state with green styling and rounded-none", () => {
    render(<SlugAvailabilityBadge status="available" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Slug available/i);
    expect(badge.className).toContain("rounded-none");
    expect(badge.className).toContain("text-emerald-800");
    expect(badge.className).toContain("dark:text-emerald-300");
  });

  it("renders unavailable state with high-contrast rose styling and custom message", () => {
    render(<SlugAvailabilityBadge status="unavailable" message="Slug taken by another event" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Slug taken by another event");
    expect(badge.className).toContain("rounded-none");
    expect(badge.className).toContain("text-rose-800");
    expect(badge.className).toContain("dark:text-rose-300");
  });

  it("renders reserved state with amber styling and rounded-none", () => {
    render(<SlugAvailabilityBadge status="reserved" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Reserved system keyword/i);
    expect(badge.className).toContain("rounded-none");
    expect(badge.className).toContain("text-amber-900");
    expect(badge.className).toContain("dark:text-amber-300");
  });

  it("renders invalid state with rose styling and rounded-none", () => {
    render(<SlugAvailabilityBadge status="invalid" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Invalid slug format/i);
    expect(badge.className).toContain("rounded-none");
    expect(badge.className).toContain("text-rose-800");
    expect(badge.className).toContain("dark:text-rose-300");
  });
});
