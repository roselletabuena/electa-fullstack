import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CategoryAwardsSettingsForm } from "@/features/events/components/dashboard/CategoryAwardsSettingsForm";
import type { Event } from "@/generated/client/client";

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
    dailyFreeVoteLimit: 1,
    organizerId: "org-1",
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

  it("renders preset selector and sections when taxonomy loads", async () => {
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
      expect(screen.getByText("Categories & Award Tracks")).toBeDefined();
      expect(screen.getByText("Female Category")).toBeDefined();
      expect(screen.getByText("People's Choice Award")).toBeDefined();
      expect(screen.getByText("1-Click Competition Taxonomy Presets")).toBeDefined();
    });
  });
});
