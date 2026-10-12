import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SearchResultsView } from "@/features/search/components/SearchResultsView";
import type { SearchResultsDto } from "@/features/search/types";

describe("SearchResultsView component", () => {
  it("renders loading message when isLoading is true", () => {
    render(<SearchResultsView results={null} isLoading={true} />);
    expect(screen.getByText(/searching events, categories, and contestants/i)).toBeDefined();
  });

  it("renders null when results is null or empty query", () => {
    const { container } = render(<SearchResultsView results={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders empty state when totalMatches is 0", () => {
    const emptyResults: SearchResultsDto = {
      query: "Nonexistent",
      events: [],
      contestants: [],
      categories: [],
      totalMatches: 0,
    };

    const handleClear = vi.fn();
    render(<SearchResultsView results={emptyResults} onClearQuery={handleClear} />);

    expect(screen.getByText(/no matches found for “Nonexistent”/i)).toBeDefined();

    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("renders matched events, contestants, and categories", () => {
    const mockResults: SearchResultsDto = {
      query: "Luzon",
      events: [
        {
          id: "ev-1",
          title: "Miss Luzon 2026",
          slug: "miss-luzon-2026",
          description: "Regional beauty pageant",
          bannerUrl: "https://example.com/banner.jpg",
          startsAt: "2026-10-01T00:00:00.000Z",
          endsAt: "2026-10-31T00:00:00.000Z",
          publicationStatus: "PUBLISHED",
        },
      ],
      contestants: [
        {
          id: "c-1",
          name: "Maria Santos",
          contestantNumber: 5,
          hometown: "Pangasinan",
          bio: "Nursing student",
          eventId: "ev-1",
          eventTitle: "Miss Luzon 2026",
          eventSlug: "miss-luzon-2026",
        },
      ],
      categories: [
        {
          id: "cat-1",
          name: "Best in Swimsuit",
          description: "Swimsuit competition award",
          eventId: "ev-1",
          eventTitle: "Miss Luzon 2026",
          eventSlug: "miss-luzon-2026",
        },
      ],
      totalMatches: 3,
    };

    render(<SearchResultsView results={mockResults} />);

    expect(screen.getByText(/search results for “Luzon” \(3\)/i)).toBeDefined();
    expect(screen.getByRole("heading", { name: "Miss Luzon 2026" })).toBeDefined();
    expect(screen.getByText(/#5 Maria Santos/i)).toBeDefined();
    expect(screen.getByText("Best in Swimsuit")).toBeDefined();
  });
});
