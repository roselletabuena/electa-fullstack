import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ContestantRoster } from "@/features/contestants/components/ContestantRoster";
import type { ContestantDto, DynamicDivisionItem } from "@/features/contestants/types";

// Mock next/navigation so ContestantRoster can run in jsdom
const mockReplace = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/events/test-event"),
  useSearchParams: () => mockUseSearchParams(),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

const mockDivisions: DynamicDivisionItem[] = [
  { id: "div-kids", name: "Kids" },
  { id: "div-teens", name: "Teens" },
  { id: "div-adults", name: "Adults" },
];

const makeContestant = (
  id: string,
  name: string,
  division: string,
  divisionName: string,
): ContestantDto => ({
  id,
  eventId: "ev1",
  contestantNumber: Number(id.replace("c", "")),
  name,
  division,
  divisionId: `div-${division.toLowerCase()}`,
  divisionName,
  status: "ACTIVE",
  avatarUrl: "https://example.com/avatar.jpg",
  voteCount: 0,
  media: [],
  categories: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mockContestants: ContestantDto[] = [
  makeContestant("c1", "Ana Reyes", "Kids", "Kids"),
  makeContestant("c2", "Ben Cruz", "Teens", "Teens"),
  makeContestant("c3", "Cara Lim", "Adults", "Adults"),
];

describe("ContestantRoster - URL-Driven Division Pre-selection (VS-38 US2/AC4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to empty search params by default
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("pre-selects 'All Candidates' pill and shows all candidates when no division param in URL", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    renderWithClient(
      <ContestantRoster
        initialContestants={mockContestants}
        divisions={mockDivisions}
        categories={[]}
      />,
    );

    const allPill = screen.getByRole("button", { name: "All Candidates" });
    expect(allPill.getAttribute("aria-pressed")).toBe("true");

    // All 3 active contestants should appear
    expect(screen.getByText("Ana Reyes")).toBeDefined();
    expect(screen.getByText("Ben Cruz")).toBeDefined();
    expect(screen.getByText("Cara Lim")).toBeDefined();
  });

  it("pre-selects 'Kids' pill and shows only Kids candidates when URL has ?division=Kids", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("division=Kids"));

    renderWithClient(
      <ContestantRoster
        initialContestants={mockContestants}
        divisions={mockDivisions}
        categories={[]}
      />,
    );

    const kidsPill = screen.getByRole("button", { name: "Kids" });
    expect(kidsPill.getAttribute("aria-pressed")).toBe("true");

    const teensPill = screen.getByRole("button", { name: "Teens" });
    expect(teensPill.getAttribute("aria-pressed")).toBe("false");

    // Only the Kids contestant should be visible
    expect(screen.getByText("Ana Reyes")).toBeDefined();
    expect(screen.queryByText("Ben Cruz")).toBeNull();
    expect(screen.queryByText("Cara Lim")).toBeNull();
  });

  it("pre-selects 'Teens' pill and shows only Teens candidates when URL has ?division=Teens", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("division=Teens"));

    renderWithClient(
      <ContestantRoster
        initialContestants={mockContestants}
        divisions={mockDivisions}
        categories={[]}
      />,
    );

    const teensPill = screen.getByRole("button", { name: "Teens" });
    expect(teensPill.getAttribute("aria-pressed")).toBe("true");

    const kidsPill = screen.getByRole("button", { name: "Kids" });
    expect(kidsPill.getAttribute("aria-pressed")).toBe("false");

    expect(screen.getByText("Ben Cruz")).toBeDefined();
    expect(screen.queryByText("Ana Reyes")).toBeNull();
    expect(screen.queryByText("Cara Lim")).toBeNull();
  });
});
