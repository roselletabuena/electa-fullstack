import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { CreateEventForm } from "@/features/events/components/CreateEventForm";
import { createEventAction } from "@/features/events/actions/create-event";
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

describe("CreateEventForm", () => {
  const pushMock = vi.fn();

  beforeEach(() => {
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

  it("renders all key form input sections and buttons", () => {
    render(<CreateEventForm />);

    expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Public URL Slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Banner Image URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Voting Starts At/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Voting Ends At/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Event/i })).toBeInTheDocument();
  });

  it("auto-populates slug when title is entered and allows reset if edited", async () => {
    const user = userEvent.setup();
    render(<CreateEventForm />);

    const titleInput = screen.getByLabelText(/Event Title/i);
    const slugInput = screen.getByLabelText(/Public URL Slug/i);

    await user.type(titleInput, "Gala Night 2026!");
    expect(slugInput).toHaveValue("gala-night-2026");

    // Manually edit slug
    await user.clear(slugInput);
    await user.type(slugInput, "custom-gala");
    expect(slugInput).toHaveValue("custom-gala");

    // Reset button should appear
    const resetButton = screen.getByRole("button", { name: /Reset to Title/i });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);
    expect(slugInput).toHaveValue("gala-night-2026");
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

  it("calls onCancel callback when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<CreateEventForm onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    await user.click(cancelBtn);

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
    dailyFreeVoteLimit: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("successfully submits the form and navigates on success", async () => {
    const user = userEvent.setup();
    vi.mocked(createEventAction).mockResolvedValue({
      success: true,
      data: mockEventData,
    });

    render(<CreateEventForm />);

    await user.type(screen.getByLabelText(/Event Title/i), "Super Star 2026");
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
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createEventAction).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/events/super-star-2026/settings");
    });
  });

  it("invokes onSuccess prop instead of router navigation if provided", async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();
    vi.mocked(createEventAction).mockResolvedValue({
      success: true,
      data: mockEventData,
    });

    render(<CreateEventForm onSuccess={onSuccessMock} />);

    await user.type(screen.getByLabelText(/Event Title/i), "Super Star 2026");
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
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith("super-star-2026");
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
