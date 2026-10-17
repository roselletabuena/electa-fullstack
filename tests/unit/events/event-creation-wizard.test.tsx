import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventCreationWizard } from "@/features/events/components/event-creation-wizard";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock createEventAction
const mockCreateEventAction = vi.fn();
vi.mock("@/features/events/actions/create-event", () => ({
  createEventAction: (...args: unknown[]) => mockCreateEventAction(...args),
}));

// Mock useDebouncedSlugCheck
vi.mock("@/features/events/hooks/useDebouncedSlugCheck", () => ({
  useDebouncedSlugCheck: () => ({
    isAvailable: true,
    isUnavailable: false,
    isChecking: false,
    error: null,
  }),
}));

describe("EventCreationWizard Component (VS-117 Non-Pageant Archetypes Disabled)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockCreateEventAction.mockResolvedValue({
      success: true,
      data: { slug: "test-election" },
    });
  });

  const fillStep1 = () => {
    fireEvent.change(screen.getByLabelText(/Event Title/i), {
      target: { value: "Miss Universe Campus 2026" },
    });
    fireEvent.change(screen.getByLabelText(/Banner Image URL/i), {
      target: { value: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c" },
    });
    fireEvent.change(screen.getByLabelText(/Event Description/i), {
      target: { value: "Campus-wide official voting for pageant candidates." },
    });
  };

  it("Scenario 1: Happy Path - Pageant Selection active with monetization notice and divisions/awards taxonomy", async () => {
    render(<EventCreationWizard />);

    fillStep1();

    // Proceed to Step 2
    const continueBtn = screen.getByRole("button", { name: /Continue to Format & Categories/i });
    fireEvent.click(continueBtn);

    // Default is PAGEANT -> Pageant monetization notice is visible
    expect(screen.getByText(/Pageant Monetization & Voting Packs/i)).toBeDefined();

    // Beauty Pageant is active with Selected indicator
    const pageantRadio = screen.getByRole("radio", { name: /Beauty Pageant/i });
    expect(pageantRadio.getAttribute("aria-checked")).toBe("true");

    // All three non-pageant cards have COMING SOON badges
    const comingSoonBadges = screen.getAllByTestId("coming-soon-badge");
    expect(comingSoonBadges.length).toBe(3);
  });

  it("Scenario 2: Disabled Archetypes with COMING SOON state cannot be toggled", async () => {
    render(<EventCreationWizard />);

    fillStep1();

    // Proceed to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Continue to Format & Categories/i }));

    // Try clicking disabled archetypes
    const studentCouncilRadio = screen.getByRole("radio", { name: /Student Council Election/i });
    const hackathonRadio = screen.getByRole("radio", { name: /Hackathon \/ Competition/i });
    const customRadio = screen.getByRole("radio", { name: /Custom Contest/i });

    fireEvent.click(studentCouncilRadio);
    fireEvent.click(hackathonRadio);
    fireEvent.click(customRadio);

    // Archetype remains PAGEANT, Institutional Free Ballot Mode is never shown
    expect(screen.queryByText(/Institutional Free Ballot Mode/i)).toBeNull();
    expect(screen.getByText(/Pageant Monetization & Voting Packs/i)).toBeDefined();

    const pageantRadio = screen.getByRole("radio", { name: /Beauty Pageant/i });
    expect(pageantRadio.getAttribute("aria-checked")).toBe("true");
  });

  it("Scenario 3: Edge Case / Form Persistence when navigating back to Step 1", async () => {
    render(<EventCreationWizard />);

    fillStep1();

    // Step into Step 2
    fireEvent.click(screen.getByRole("button", { name: /Continue to Format & Categories/i }));

    // Go back to Step 1
    fireEvent.click(screen.getByRole("button", { name: /Back to Details/i }));

    // Verify all common fields remain preserved
    expect((screen.getByLabelText(/Event Title/i) as HTMLInputElement).value).toBe(
      "Miss Universe Campus 2026",
    );
    expect((screen.getByLabelText(/Banner Image URL/i) as HTMLInputElement).value).toBe(
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c",
    );
    expect((screen.getByLabelText(/Event Description/i) as HTMLTextAreaElement).value).toBe(
      "Campus-wide official voting for pageant candidates.",
    );
  });

  it("completes full submission flow with PAGEANT archetype and onSuccess callback", async () => {
    const onSuccess = vi.fn();
    render(<EventCreationWizard onSuccess={onSuccess} />);

    fillStep1();

    fireEvent.click(screen.getByRole("button", { name: /Continue to Format & Categories/i }));

    // Proceed to Step 3
    fireEvent.click(screen.getByRole("button", { name: /Review & Finalize/i }));

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Create & Launch Draft Event/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateEventAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Miss Universe Campus 2026",
          archetype: "PAGEANT",
        }),
      );
      expect(onSuccess).toHaveBeenCalledWith("test-election");
    });
  });
}, 15000);
