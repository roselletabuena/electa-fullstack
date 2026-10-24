import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { GeneralBrandingForm } from "@/features/events/components/dashboard/GeneralBrandingForm";
import { updateEventBrandingAction } from "@/features/events/actions/update-event-branding";
import type { Event } from "@/generated/client/client";
import { Prisma } from "@/generated/client/client";

vi.mock("@/features/events/actions/update-event-branding", () => ({
  updateEventBrandingAction: vi.fn(),
}));

describe("GeneralBrandingForm - Theme Selection & Appearance Preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent: Event = {
    id: "evt_test_123",
    slug: "miss-visayas-2026",
    title: "Miss Visayas 2026",
    description: "Annual competition.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01"),
    endsAt: new Date("2026-10-05"),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    isFreeVotingOnly: false,
    allowedEmailDomains: [],
    dailyFreeVoteLimit: 1,
    takeRatePercentage: new Prisma.Decimal(12.0),
    organizerId: "usr_org_1",
    archetype: "PAGEANT",
    theme: "ELECTA_DEFAULT",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("renders Theme & Appearance section with available themes", () => {
    render(<GeneralBrandingForm event={mockEvent} />);

    expect(screen.getByText(/Visual Theme & Appearance/i)).toBeInTheDocument();
    expect(screen.getByText("Electa Opal (Default)")).toBeInTheDocument();
    expect(screen.getByText("Pageant Editorial Haute-Couture")).toBeInTheDocument();

    // Default theme should have Active Theme badge
    expect(screen.getByText(/Active Theme/i)).toBeInTheDocument();
  });

  it("updates live preview immediately upon clicking a different theme", async () => {
    render(<GeneralBrandingForm event={mockEvent} />);

    const pageantCard = screen.getByText("Pageant Editorial Haute-Couture");
    await act(async () => {
      fireEvent.click(pageantCard);
    });

    // Unsaved changes banner should appear
    expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();

    // Live preview badge should show Pageant Editorial
    expect(
      screen.getByText(/Previewing: Pageant Editorial Haute-Couture/i),
    ).toBeInTheDocument();
  });

  it("reverts selected theme and preview when Discard Changes is clicked", async () => {
    render(<GeneralBrandingForm event={mockEvent} />);

    const pageantCard = screen.getByText("Pageant Editorial Haute-Couture");
    await act(async () => {
      fireEvent.click(pageantCard);
    });

    expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();

    const discardBtn = screen.getByRole("button", { name: /Discard Changes/i });
    await act(async () => {
      fireEvent.click(discardBtn);
    });

    // Unsaved changes should disappear
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();

    // Live preview should revert to default theme
    expect(
      screen.getByText(/Previewing: Electa Opal \(Default\)/i),
    ).toBeInTheDocument();
  });

  it("submits the selected theme to updateEventBrandingAction", async () => {
    vi.mocked(updateEventBrandingAction).mockResolvedValue({
      success: true,
      data: { ...mockEvent, theme: "PAGEANT_EDITORIAL" },
      message: "Event branding updated successfully!",
    });

    render(<GeneralBrandingForm event={mockEvent} />);

    const pageantCard = screen.getByText("Pageant Editorial Haute-Couture");
    await act(async () => {
      fireEvent.click(pageantCard);
    });

    const submitBtn = screen.getByRole("button", { name: /Save Changes/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(updateEventBrandingAction).toHaveBeenCalledWith(
        "miss-visayas-2026",
        expect.objectContaining({
          theme: "PAGEANT_EDITORIAL",
        }),
      );
    });

    expect(
      await screen.findByText(/Event branding updated successfully!/i),
    ).toBeInTheDocument();
  });
});
