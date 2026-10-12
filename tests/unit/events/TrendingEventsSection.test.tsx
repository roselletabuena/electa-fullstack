import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrendingEventsSection } from "@/features/events/components/trending/TrendingEventsSection";
import * as useTrendingEventsModule from "@/features/events/hooks/useTrendingEvents";
import type { PublicEventDto } from "@/features/events/types";

// Mock nuqs
let mockStatus = "all";
vi.mock("nuqs", () => ({
  parseAsStringLiteral: () => ({
    withDefault: () => ({
      withOptions: () => ({}),
    }),
  }),
  useQueryState: vi.fn(() => [
    mockStatus,
    (newVal: string) => {
      mockStatus = newVal;
    },
  ]),
}));

describe("TrendingEventsSection Component", () => {
  let queryClient: QueryClient;

  const mockEvents: PublicEventDto[] = [
    {
      id: "evt_1",
      slug: "miss-luzon-2026",
      title: "Miss Luzon 2026",
      description: "Northern Luzon pageant",
      bannerUrl: "https://example.com/luzon.jpg",
      location: "Baguio City",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      serverTime: new Date().toISOString(),
      operationalState: "Scheduled",
      showResultsOnClose: true,
      contestants: [],
    },
    {
      id: "evt_2",
      slug: "miss-visayas-2026",
      title: "Miss Visayas 2026",
      description: "Central Visayas pageant",
      bannerUrl: "https://example.com/visayas.jpg",
      location: "Cebu City",
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      serverTime: new Date().toISOString(),
      operationalState: "Active",
      showResultsOnClose: true,
      contestants: [],
    },
    {
      id: "evt_3",
      slug: "miss-mindanao-2026",
      title: "Miss Mindanao 2026",
      description: "Southern Mindanao pageant",
      bannerUrl: "https://example.com/mindanao.jpg",
      location: "Davao City",
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      endsAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      serverTime: new Date().toISOString(),
      operationalState: "Closed",
      showResultsOnClose: true,
      contestants: [],
    },
  ];

  beforeEach(() => {
    mockStatus = "all";
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.spyOn(useTrendingEventsModule, "useTrendingEvents").mockReturnValue({
      data: {
        success: true,
        data: mockEvents,
        timestamp: new Date().toISOString(),
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useTrendingEventsModule.useTrendingEvents>);
  });

  function renderWithClient(ui: React.ReactElement) {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  }

  it("renders section heading, description, and filter tabs", () => {
    renderWithClient(<TrendingEventsSection />);

    expect(screen.getByText("TRENDING COMPETITIONS & ELECTIONS")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /all events/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /live voting/i })).toBeInTheDocument();
  });

  it("displays all published events under 'ALL EVENTS' default filter", () => {
    renderWithClient(<TrendingEventsSection />);

    expect(screen.getByText("Miss Luzon 2026")).toBeInTheDocument();
    expect(screen.getByText("Miss Visayas 2026")).toBeInTheDocument();
    expect(screen.getByText("Miss Mindanao 2026")).toBeInTheDocument();
  });

  it("computes accurate tab counts", () => {
    renderWithClient(<TrendingEventsSection />);

    expect(screen.getByText("3")).toBeInTheDocument(); // All
  });
});
