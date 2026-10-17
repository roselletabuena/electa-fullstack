import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Prisma } from "@/generated/client/client";
import { CreateEventForm } from "@/features/events/components/CreateEventForm";
import { createEventAction } from "@/features/events/actions/create-event";
import { EVENT_CREATE_DRAFT_KEY } from "@/features/events/utils/event-draft-storage";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/events/actions/create-event", () => ({
  createEventAction: vi.fn(),
}));

// Mock fetch for debounced slug checking
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("CreateEventForm (Brutalist Reskin & Design System)", () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { slug: "valid-event", available: true },
      }),
    });
  });

  it("renders all key form input sections, buttons, and duration preset chips with brutalist zero-radius tokens", () => {
    const { container } = render(<CreateEventForm />);

    // Form surface has zero border-radius
    const form = container.querySelector("form");
    expect(form?.className).toContain("rounded-none");
    expect(form?.className).toContain("border-slate-300");

    const titleInput = screen.getByLabelText(/Event Title/i);
    const slugInput = screen.getByLabelText(/Public URL Slug/i);
    const descInput = screen.getByLabelText(/Description/i);
    const bannerInput = screen.getByLabelText(/Banner Image URL/i);
    const startsAtInput = screen.getByLabelText(/Voting Starts At/i);
    const endsAtInput = screen.getByLabelText(/Voting Ends At/i);

    expect(titleInput).toBeInTheDocument();
    expect(titleInput.className).toContain("rounded-none");

    expect(slugInput).toBeInTheDocument();
    expect(slugInput.className).toContain("rounded-none");
    expect(slugInput.className).toContain("font-mono");

    expect(descInput).toBeInTheDocument();
    expect(descInput.className).toContain("rounded-none");

    expect(bannerInput).toBeInTheDocument();
    expect(bannerInput.className).toContain("rounded-none");

    expect(startsAtInput).toBeInTheDocument();
    expect(startsAtInput.className).toContain("rounded-none");

    expect(endsAtInput).toBeInTheDocument();
    expect(endsAtInput.className).toContain("rounded-none");

    // Duration preset chips
    const chip7 = screen.getByRole("button", { name: /\+7 Days/i });
    const chip14 = screen.getByRole("button", { name: /\+14 Days/i });
    const chip30 = screen.getByRole("button", { name: /\+30 Days/i });

    expect(chip7).toBeInTheDocument();
    expect(chip7.className).toContain("rounded-none");
    expect(chip7.className).toMatch(/min-h-(11|\[44px\])/);

    expect(chip14).toBeInTheDocument();
    expect(chip14.className).toContain("rounded-none");
    expect(chip14.className).toMatch(/min-h-(11|\[44px\])/);

    expect(chip30).toBeInTheDocument();
    expect(chip30.className).toContain("rounded-none");
    expect(chip30.className).toMatch(/min-h-(11|\[44px\])/);

    // Primary action button
    const submitBtn = screen.getByRole("button", { name: /Create Event/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn.className).toContain("btn-primary");
    expect(submitBtn.className).toContain("rounded-none");
    expect(submitBtn.className).toMatch(/min-h-(11|\[44px\])/);
    expect(submitBtn.className).toContain("uppercase");
    expect(submitBtn.className).toContain("font-extrabold");

    // Cancel button
    const cancelLink = screen.getByRole("link", { name: /Cancel/i });
    expect(cancelLink).toBeInTheDocument();
    expect(cancelLink.className).toContain("rounded-none");
    expect(cancelLink.className).toMatch(/min-h-(11|\[44px\])/);
  });

  it("auto-populates slug when title is entered and allows reset with touch target compliance", async () => {
    render(<CreateEventForm />);

    const titleInput = screen.getByLabelText(/Event Title/i);
    const slugInput = screen.getByLabelText(/Public URL Slug/i);

    fireEvent.change(titleInput, { target: { value: "Gala Night 2026!" } });
    expect(slugInput).toHaveValue("gala-night-2026");

    // Manually edit slug
    fireEvent.change(slugInput, { target: { value: "custom-gala" } });
    expect(slugInput).toHaveValue("custom-gala");

    // Reset button should appear and satisfy touch target
    const resetButton = screen.getByRole("button", { name: /Reset to Title/i });
    expect(resetButton).toBeInTheDocument();
    expect(resetButton.className).toMatch(/min-h-(11|\[44px\])/);

    fireEvent.click(resetButton);
    expect(slugInput).toHaveValue("gala-night-2026");
  });

  it("calculates end date automatically when duration preset chip is clicked", () => {
    render(<CreateEventForm />);

    const startsAtInput = screen.getByLabelText(/Voting Starts At/i) as HTMLInputElement;
    const endsAtInput = screen.getByLabelText(/Voting Ends At/i) as HTMLInputElement;

    // Set a known startsAt
    fireEvent.change(startsAtInput, { target: { value: "2026-11-01T10:00" } });

    const chip7 = screen.getByRole("button", { name: /\+7 Days/i });
    const chip14 = screen.getByRole("button", { name: /\+14 Days/i });
    const chip30 = screen.getByRole("button", { name: /\+30 Days/i });

    // Click +7 Days
    fireEvent.click(chip7);
    expect(endsAtInput.value).toBe("2026-11-08T10:00");
    expect(chip7).toHaveAttribute("aria-pressed", "true");
    expect(chip14).toHaveAttribute("aria-pressed", "false");

    // Click +14 Days
    fireEvent.click(chip14);
    expect(endsAtInput.value).toBe("2026-11-15T10:00");
    expect(chip14).toHaveAttribute("aria-pressed", "true");
    expect(chip7).toHaveAttribute("aria-pressed", "false");

    // Click +30 Days
    fireEvent.click(chip30);
    expect(endsAtInput.value).toBe("2026-12-01T10:00");
    expect(chip30).toHaveAttribute("aria-pressed", "true");
  });

  it("shows temporal error and disables submit when end time is less than 1 hour after start time", async () => {
    render(<CreateEventForm />);

    const startsAtInput = screen.getByLabelText(/Voting Starts At/i);
    const endsAtInput = screen.getByLabelText(/Voting Ends At/i);

    // Set start date and end date only 30 minutes apart
    fireEvent.change(startsAtInput, { target: { value: "2026-10-01T10:00" } });
    fireEvent.change(endsAtInput, { target: { value: "2026-10-01T10:30" } });

    await waitFor(() => {
      expect(
        screen.getByText(/Event end time must be at least 1 hour after the start time/i),
      ).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", { name: /Create Event/i });
    expect(submitBtn).toBeDisabled();
  });

  it("recovers draft form state from sessionStorage and allows clearing it", () => {
    // Seed sessionStorage with saved draft
    sessionStorage.setItem(
      EVENT_CREATE_DRAFT_KEY,
      JSON.stringify({
        title: "Saved Pageant 2026",
        slug: "saved-pageant-2026",
        description: "Recovered description from previous session.",
        bannerUrl: "https://example.com/recovered.jpg",
        startsAt: "2026-12-01T10:00",
        endsAt: "2026-12-15T10:00",
        isCustomSlug: true,
        savedAt: Date.now(),
      }),
    );

    render(<CreateEventForm />);

    // Assert inputs are prefilled
    expect(screen.getByLabelText(/Event Title/i)).toHaveValue("Saved Pageant 2026");
    expect(screen.getByLabelText(/Public URL Slug/i)).toHaveValue("saved-pageant-2026");
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      "Recovered description from previous session.",
    );

    // Alert banner must be visible with zero radius and touch target
    expect(
      screen.getByText(/Draft Restored: We recovered your previously entered event details/i),
    ).toBeInTheDocument();

    const clearDraftBtn = screen.getByRole("button", { name: /Clear Draft/i });
    expect(clearDraftBtn.className).toContain("rounded-none");
    expect(clearDraftBtn.className).toMatch(/min-h-(11|\[44px\])/);

    // Click "Clear Draft"
    fireEvent.click(clearDraftBtn);

    // Values should be reset
    expect(screen.getByLabelText(/Event Title/i)).toHaveValue("");
    expect(screen.getByLabelText(/Public URL Slug/i)).toHaveValue("");
    expect(sessionStorage.getItem(EVENT_CREATE_DRAFT_KEY)).toBeNull();
    expect(screen.queryByText(/Draft Restored/i)).not.toBeInTheDocument();
  });

  it("calls onCancel callback when custom cancel button is provided", () => {
    const handleCancel = vi.fn();
    render(<CreateEventForm onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    expect(cancelBtn.className).toContain("rounded-none");
    expect(cancelBtn.className).toMatch(/min-h-(11|\[44px\])/);
    fireEvent.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  const mockEventData = {
    id: "evt_123",
    slug: "super-star-2026",
    title: "Super Star 2026",
    description: "Description",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01T10:00:00.000Z"),
    endsAt: new Date("2026-10-02T10:00:00.000Z"),
    publicationStatus: "DRAFT" as const,
    isPublished: false,
    timezone: "UTC",
    requirePassphrase: false,
    draftPassphraseHash: null,
    maxVotesPerUser: 1,
    organizerId: "org_123",
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    isFreeVotingOnly: false,
    allowedEmailDomains: [],
    dailyFreeVoteLimit: 1,
    takeRatePercentage: new Prisma.Decimal(12.0),
    archetype: "PAGEANT" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("successfully submits the form, clears draft from sessionStorage, and navigates", async () => {
    vi.mocked(createEventAction).mockResolvedValue({
      success: true,
      data: mockEventData,
    });

    render(<CreateEventForm />);

    fireEvent.change(screen.getByLabelText(/Event Title/i), {
      target: { value: "Super Star 2026" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: {
        value: "This is a comprehensive description of the competition with plenty of characters.",
      },
    });
    fireEvent.change(screen.getByLabelText(/Banner Image URL/i), {
      target: { value: "https://example.com/banner.jpg" },
    });

    // Wait for slug availability check
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/available/i);
    });

    const submitBtn = screen.getByRole("button", { name: /Create Event/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createEventAction).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/events/super-star-2026/settings");
      expect(sessionStorage.getItem(EVENT_CREATE_DRAFT_KEY)).toBeNull();
    });
  });

  it("invokes onSuccess prop instead of router navigation if provided", async () => {
    const onSuccessMock = vi.fn();
    vi.mocked(createEventAction).mockResolvedValue({
      success: true,
      data: mockEventData,
    });

    render(<CreateEventForm onSuccess={onSuccessMock} />);

    fireEvent.change(screen.getByLabelText(/Event Title/i), {
      target: { value: "Super Star 2026" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: {
        value: "This is a comprehensive description of the competition with plenty of characters.",
      },
    });
    fireEvent.change(screen.getByLabelText(/Banner Image URL/i), {
      target: { value: "https://example.com/banner.jpg" },
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/available/i);
    });

    const submitBtn = screen.getByRole("button", { name: /Create Event/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith("super-star-2026");
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
