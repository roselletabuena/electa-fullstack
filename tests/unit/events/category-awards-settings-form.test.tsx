import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CategoryAwardsSettingsForm } from "@/features/events/components/dashboard/CategoryAwardsSettingsForm";
import { type Event, Prisma } from "@/generated/client/client";

describe("CategoryAwardsSettingsForm", () => {
  let queryClient: QueryClient;

  const mockEvent: Event = {
    id: "evt_123",
    slug: "miss-universe-2026",
    title: "Miss Universe 2026",
    description: "Annual beauty pageant",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01T00:00:00Z"),
    endsAt: new Date("2026-10-15T00:00:00Z"),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    isFreeVotingOnly: false,
    allowedEmailDomains: [],
    dailyFreeVoteLimit: 1,
    takeRatePercentage: new Prisma.Decimal(12.0),
    organizerId: "org-1",
    archetype: "PAGEANT",
    theme: "ELECTA_DEFAULT",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it("renders loader during initial taxonomy fetch", () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryAwardsSettingsForm event={mockEvent} />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Loading competition categories/i)).toBeDefined();
  });

  it("renders sections without preset selector when taxonomy loads", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          divisions: [
            {
              id: "div_1",
              eventId: "evt_123",
              name: "Female Category",
              description: "Standard bracket",
              displayOrder: 0,
              contestantCount: 5,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          ],
          awardCategories: [
            {
              id: "cat_1",
              eventId: "evt_123",
              name: "People's Choice Award",
              description: "Public voting track",
              isVotingOpen: true,
              displayOrder: 0,
              contestantCount: 5,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          ],
        },
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryAwardsSettingsForm event={mockEvent} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Categories & Award Categories")).toBeDefined();
      expect(screen.getByText("Female Category")).toBeDefined();
      expect(screen.getByText("People's Choice Award")).toBeDefined();
      // Preset card should be completely removed
      expect(screen.queryByText("1-Click Competition Taxonomy Presets")).toBeNull();
    });
  });

  it("supports in-place inline editing for divisions", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: "div_1",
              eventId: "evt_123",
              name: "Women's Division",
              description: "Updated description",
              displayOrder: 0,
              contestantCount: 5,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            divisions: [
              {
                id: "div_1",
                eventId: "evt_123",
                name: "Female Category",
                description: "Standard bracket",
                displayOrder: 0,
                contestantCount: 5,
                createdAt: "2026-09-27T00:00:00Z",
                updatedAt: "2026-09-27T00:00:00Z",
              },
            ],
            awardCategories: [],
          },
        }),
      });
    });
    global.fetch = fetchMock;

    const { fireEvent } = await import("@testing-library/react");

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryAwardsSettingsForm event={mockEvent} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Female Category")).toBeDefined();
    });

    // Click edit button for division
    const editBtn = screen.getByLabelText("Edit Female Category");
    fireEvent.click(editBtn);

    // Verify inline edit inputs appear
    const nameInput = screen.getByDisplayValue("Female Category");
    expect(nameInput).toBeDefined();

    fireEvent.change(nameInput, { target: { value: "Women's Division" } });

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/miss-universe-2026/divisions/div_1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            name: "Women's Division",
            description: "Standard bracket",
            displayOrder: 0,
          }),
        }),
      );
    });
  });

  it("supports in-place inline editing for award categories", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: "cat_1",
              eventId: "evt_123",
              name: "Fan Favorite Award",
              description: "Updated award description",
              isVotingOpen: true,
              displayOrder: 2,
              contestantCount: 5,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            divisions: [],
            awardCategories: [
              {
                id: "cat_1",
                eventId: "evt_123",
                name: "People's Choice Award",
                description: "Public voting track",
                isVotingOpen: true,
                displayOrder: 1,
                contestantCount: 5,
                createdAt: "2026-09-27T00:00:00Z",
                updatedAt: "2026-09-27T00:00:00Z",
              },
            ],
          },
        }),
      });
    });
    global.fetch = fetchMock;

    const { fireEvent } = await import("@testing-library/react");

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryAwardsSettingsForm event={mockEvent} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("People's Choice Award")).toBeDefined();
    });

    // Click edit button for award category
    const editBtn = screen.getByLabelText("Edit People's Choice Award");
    fireEvent.click(editBtn);

    // Verify inline edit inputs appear
    const nameInput = screen.getByDisplayValue("People's Choice Award");
    expect(nameInput).toBeDefined();

    fireEvent.change(nameInput, { target: { value: "Fan Favorite Award" } });

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/miss-universe-2026/award-categories/cat_1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            name: "Fan Favorite Award",
            description: "Public voting track",
            displayOrder: 1,
            isVotingOpen: true,
          }),
        }),
      );
    });
  });

  it("enforces concurrent edit guard by disabling other section actions when an item is being edited", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          divisions: [
            {
              id: "div_1",
              eventId: "evt_123",
              name: "Female Category",
              description: "Standard bracket",
              displayOrder: 0,
              contestantCount: 5,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          ],
          awardCategories: [
            {
              id: "cat_1",
              eventId: "evt_123",
              name: "People's Choice Award",
              description: "Public voting track",
              isVotingOpen: true,
              displayOrder: 1,
              contestantCount: 5,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          ],
        },
      }),
    });

    const { fireEvent } = await import("@testing-library/react");

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryAwardsSettingsForm event={mockEvent} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Female Category")).toBeDefined();
      expect(screen.getByText("People's Choice Award")).toBeDefined();
    });

    const divisionEditBtn = screen.getByLabelText("Edit Female Category");
    const categoryEditBtn = screen.getByLabelText("Edit People's Choice Award");
    expect((categoryEditBtn as HTMLButtonElement).disabled).toBe(false);

    // Start editing division
    fireEvent.click(divisionEditBtn);

    // Award category edit button should now be disabled to prevent competing form states
    await waitFor(() => {
      expect((categoryEditBtn as HTMLButtonElement).disabled).toBe(true);
    });

    // Cancel editing division
    const cancelBtn = screen.getByRole("button", { name: /^Cancel$/i });
    fireEvent.click(cancelBtn);

    // Award category edit button should be re-enabled
    await waitFor(() => {
      expect((categoryEditBtn as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it("Scenario 4: renders PositionsSection instead of pageant divisions when event is STUDENT_COUNCIL", async () => {
    const studentCouncilEvent: Event = {
      ...mockEvent,
      archetype: "STUDENT_COUNCIL",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          archetype: "STUDENT_COUNCIL",
          positions: [
            {
              id: "pos_1",
              eventId: "evt_123",
              name: "President",
              description: "Executive President",
              maxSelectionsPerVoter: 1,
              minSelectionsPerVoter: 0,
              displayOrder: 1,
              isVotingOpen: true,
              candidateCount: 2,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
            {
              id: "pos_2",
              eventId: "evt_123",
              name: "Senators",
              description: "Legislative senators",
              maxSelectionsPerVoter: 5,
              minSelectionsPerVoter: 1,
              displayOrder: 2,
              isVotingOpen: true,
              candidateCount: 8,
              createdAt: "2026-09-27T00:00:00Z",
              updatedAt: "2026-09-27T00:00:00Z",
            },
          ],
          divisions: [],
          awardCategories: [],
        },
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CategoryAwardsSettingsForm event={studentCouncilEvent} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Student Council Election Taxonomy & Ballot Structure"),
      ).toBeDefined();
      expect(screen.getByText("President")).toBeDefined();
      expect(screen.getByText("Senators")).toBeDefined();
      expect(screen.getByText("Up to 5 Seats")).toBeDefined();
      expect(screen.queryByText("1-Click Competition Taxonomy Presets")).toBeNull();
    });
  });
});
