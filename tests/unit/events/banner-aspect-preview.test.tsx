import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BannerAspectPreview } from "@/features/events/components/dashboard/BannerAspectPreview";

describe("BannerAspectPreview", () => {
  it("renders empty state placeholder when no image URL is provided", () => {
    const { container } = render(<BannerAspectPreview imageUrl="" title="Test Event" />);
    expect(screen.getByText(/No banner image URL provided/i)).toBeInTheDocument();

    // Zero-radius geometry check
    const viewport = container.querySelector(".overflow-hidden");
    expect(viewport).toBeInTheDocument();
    expect(viewport?.className).toContain("rounded-none");
    expect(viewport?.className).not.toContain("rounded-xl");
  });

  it("renders aspect ratio selection controls with zero-radius pill radios", () => {
    render(<BannerAspectPreview imageUrl="" title="Test Event" />);
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("rounded-none");
    expect(group.className).not.toContain("rounded-lg");

    const radio16x9 = screen.getByRole("radio", { name: /16:9/i });
    const radio21x9 = screen.getByRole("radio", { name: /21:9/i });

    expect(radio16x9.className).toContain("rounded-none");
    expect(radio16x9.className).not.toContain("rounded-md");
    expect(radio21x9.className).toContain("rounded-none");

    expect(radio16x9).toHaveAttribute("aria-checked", "true");
    expect(radio21x9).toHaveAttribute("aria-checked", "false");

    fireEvent.click(radio21x9);
    expect(radio21x9).toHaveAttribute("aria-checked", "true");
    expect(radio16x9).toHaveAttribute("aria-checked", "false");
  });

  it("renders aspect ratio badge overlay with zero-radius font-mono styling", () => {
    const { container } = render(
      <BannerAspectPreview imageUrl="https://images.unsplash.com/photo-1" title="Test Event" />,
    );
    const badge = container.querySelector(".font-mono");
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain("rounded-none");
    expect(badge?.className).not.toContain("rounded-md");
  });
});
