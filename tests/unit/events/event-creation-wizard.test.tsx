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

describe("EventCreationWizard Component", () => {
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
      target: { value: "Supreme Student Council Election 2026" },
    });
    fireEvent.change(screen.getByLabelText(/Banner Image URL/i), {
      target: { value: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c" },
    });
    fireEvent.change(screen.getByLabelText(/Event Description/i), {
      target: { value: "Campus-wide official voting for executive student leaders." },
    });
  };

  it("Scenario 1: Happy Path - Dynamic Form Adaptation when toggling to STUDENT_COUNCIL", async () => {
    render(<EventCreationWizard />);

    fillStep1();

    // Proceed to Step 2
    const continueBtn = screen.getByRole("button", { name: /Continue to Archetype & Taxonomy/i });
    fireEvent.click(continueBtn);

    // Default is PAGEANT -> Pageant monetization notice is visible
    expect(screen.getByText(/Pageant Monetization & Voting Packs/i)).toBeDefined();

    // Switch archetype to STUDENT_COUNCIL
    const studentCouncilRadio = screen.getByRole("radio", { name: /Student Council Election/i });
    fireEvent.click(studentCouncilRadio);

    // Pageant monetization disappears, Institutional Free Ballot Mode appears
    expect(screen.queryByText(/Pageant Monetization & Voting Packs/i)).toBeNull();
    expect(screen.getByText(/Institutional Free Ballot Mode/i)).toBeDefined();

    // Taxonomy panel shifts to configure Positions / Offices with seat limits
    expect(screen.getByText(/Office \/ Position Configuration/i)).toBeDefined();
    expect(screen.getByText(/Max Seats \/ Selections per Voter/i)).toBeDefined();
  });

  it("Scenario 2: Validation & Error Handling - Incomplete Archetype Taxonomy for HACKATHON", async () => {
    render(<EventCreationWizard />);

    fillStep1();

    // Proceed to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Continue to Archetype & Taxonomy/i }));

    // Switch archetype to HACKATHON
    const hackathonRadio = screen.getByRole("radio", { name: /Hackathon \/ Competition/i });
    fireEvent.click(hackathonRadio);

    // Try to proceed to Step 3 without any tracks defined
    const reviewBtn = screen.getByRole("button", { name: /Review & Finalize/i });
    fireEvent.click(reviewBtn);

    // Expect inline error: "At least one challenge track or category is required for hackathons."
    expect(
      screen.getByText("At least one challenge track or category is required for hackathons.")
    ).toBeDefined();

    // Now load presets or add a track
    const loadPresetsBtn = screen.getByRole("button", { name: /Load Presets/i });
    fireEvent.click(loadPresetsBtn);

    // Click Review again -> Should proceed to Step 3
    fireEvent.click(reviewBtn);
    expect(screen.getByText(/3\. Review Event Configuration/i)).toBeDefined();
  });

  it("Scenario 3: Edge Case / Form Persistence when toggling between archetypes", async () => {
    render(<EventCreationWizard />);

    fillStep1();

    // Step into Step 2
    fireEvent.click(screen.getByRole("button", { name: /Continue to Archetype & Taxonomy/i }));

    // Toggle between archetypes multiple times
    fireEvent.click(screen.getByRole("radio", { name: /Student Council Election/i }));
    fireEvent.click(screen.getByRole("radio", { name: /Hackathon \/ Competition/i }));
    fireEvent.click(screen.getByRole("radio", { name: /Beauty Pageant/i }));

    // Go back to Step 1
    fireEvent.click(screen.getByRole("button", { name: /Back to Details/i }));

    // Verify all common fields remain preserved
    expect(
      (screen.getByLabelText(/Event Title/i) as HTMLInputElement).value
    ).toBe("Supreme Student Council Election 2026");
    expect(
      (screen.getByLabelText(/Banner Image URL/i) as HTMLInputElement).value
    ).toBe("https://images.unsplash.com/photo-1540910419892-4a36d2c3266c");
    expect(
      (screen.getByLabelText(/Event Description/i) as HTMLTextAreaElement).value
    ).toBe("Campus-wide official voting for executive student leaders.");
  });

  it("completes full submission flow with onSuccess callback", async () => {
    const onSuccess = vi.fn();
    render(<EventCreationWizard onSuccess={onSuccess} />);

    fillStep1();

    fireEvent.click(screen.getByRole("button", { name: /Continue to Archetype & Taxonomy/i }));
    fireEvent.click(screen.getByRole("radio", { name: /Student Council Election/i }));

    // Load student council positions presets
    fireEvent.click(screen.getByRole("button", { name: /Load Presets/i }));

    // Proceed to Step 3
    fireEvent.click(screen.getByRole("button", { name: /Review & Finalize/i }));

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Create & Launch Draft Event/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateEventAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Supreme Student Council Election 2026",
          archetype: "STUDENT_COUNCIL",
          positions: expect.arrayContaining([
            expect.objectContaining({ name: "President", maxSelectionsPerVoter: 1 }),
          ]),
        })
      );
      expect(onSuccess).toHaveBeenCalledWith("test-election");
    });
  });
});
