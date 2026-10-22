import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventThemeProvider } from "@/features/events/theme/EventThemeProvider";
import { THEME_REGISTRY } from "@/features/events/theme";
import { EventCountdown } from "@/features/events/components/EventCountdown";
import { EventBanner } from "@/features/events/components/EventBanner";
import { ContestantCard } from "@/features/contestants/components/ContestantCard";
import { BoostVoteModal } from "@/features/payments/components/BoostVoteModal";
import type { PublicEventDto } from "@/features/events/types";
import type { ContestantDto } from "@/features/contestants/types";
import { pageantEditorialThemeSchema } from "../../../specs/049-pageant-editorial-theme/contracts/pageant-editorial-theme";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/events/ms-tala-2026",
}));

// Mock voting hooks for FreeVoteButton
vi.mock("@/features/voting/hooks/use-free-vote-quota", () => ({
  useFreeVoteQuota: () => ({
    quota: {
      remainingVotes: 1,
      dailyLimit: 1,
      isFreeVotingEnabled: true,
      isInCooldown: false,
    },
    isLoading: false,
    formattedCountdown: "",
  }),
}));

vi.mock("@/features/voting/hooks/use-cast-free-vote", () => ({
  useCastFreeVote: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const mockEvent: PublicEventDto = {
  id: "evt-pageant-1",
  slug: "ms-tala-2026",
  title: "Ms. Tala 2026 Grand Coronation",
  description: "Official People's Choice Ballot for Miss Tala 2026",
  bannerUrl: "/mock-banner.jpg",
  startsAt: new Date(Date.now() - 3600000).toISOString(),
  endsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
  serverTime: new Date().toISOString(),
  operationalState: "Active",
  showResultsOnClose: true,
  theme: "PAGEANT_EDITORIAL",
  contestants: [],
};

const mockContestant: ContestantDto = {
  id: "contestant-1",
  eventId: "evt-pageant-1",
  contestantNumber: 1,
  name: "Danielle Patricia Cruz",
  hometown: "Miss Mandaluyong",
  division: "PAGEANT",
  divisionName: "Pageant",
  divisionRef: { id: "div-1", name: "Pageant" },
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bio: "Advocating for mental health awareness in public schools.",
  avatarUrl: "/mock-avatar.jpg",
  voteCount: 1420,
  media: [
    {
      id: "m-1",
      url: "/mock-cover.jpg",
      mediaType: "PHOTO",
      isCover: true,
      embedPlatform: "NONE",
      displayOrder: 1,
      aspectRatio: "4/5",
    },
  ],
  categories: [
    {
      id: "cat-1",
      name: "Evening Gown",
      eventId: "evt-pageant-1",
      isVotingOpen: true,
    },
  ],
};

describe("Haute-Couture Pageant Editorial Theme Skin (VS-121)", () => {
  it("validates PAGEANT_EDITORIAL theme configuration against the contract schema", () => {
    const pageantDef = THEME_REGISTRY.PAGEANT_EDITORIAL;
    const result = pageantEditorialThemeSchema.safeParse({
      theme: pageantDef.id,
      slug: pageantDef.slug,
      tokens: pageantDef.tokens,
    });
    expect(result.success).toBe(true);
  });

  it("renders public event components under PAGEANT_EDITORIAL theme with correct tokens and data attribute", () => {
    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <EventBanner event={mockEvent} totalVotes={1420} />
      </EventThemeProvider>,
    );

    const themeContainer = container.firstElementChild as HTMLElement;
    expect(themeContainer).not.toBeNull();
    expect(themeContainer.getAttribute("data-event-theme")).toBe("pageant-editorial");
    expect(themeContainer.style.getPropertyValue("--bg-base")).toBe("#0B0C10");
    expect(themeContainer.style.getPropertyValue("--accent-primary")).toBe("#CBB279");
    expect(screen.getByText("Ms. Tala 2026 Grand Coronation")).toBeDefined();
  });

  it("renders EventCountdown with architectural countdown classes and semantic structure", () => {
    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <EventCountdown
          operationalState="Active"
          startsAt={mockEvent.startsAt}
          endsAt={mockEvent.endsAt}
        />
      </EventThemeProvider>,
    );

    const countdownContainer = container.querySelector(".event-countdown-container");
    expect(countdownContainer).not.toBeNull();

    const unitCards = container.querySelectorAll(".countdown-unit-card");
    expect(unitCards.length).toBe(4);

    const unitValues = container.querySelectorAll(".countdown-unit-value");
    expect(unitValues.length).toBe(4);

    const separators = container.querySelectorAll(".countdown-separator");
    expect(separators.length).toBe(3);

    expect(screen.getByText("Live Voting Window")).toBeDefined();
    expect(screen.getByText("Voting Closes In")).toBeDefined();
  });

  it("renders ContestantCard with 4:5 portrait dossier, sash tag, and dual action buttons", () => {
    const onSelect = vi.fn();
    const onVoteClick = vi.fn();

    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <ContestantCard
          contestant={mockContestant}
          onSelect={onSelect}
          onVoteClick={onVoteClick}
        />
      </EventThemeProvider>,
    );

    const card = container.querySelector(".contestant-card");
    expect(card).not.toBeNull();

    // 4:5 aspect ratio image wrapper
    const portraitWrapper = container.querySelector(".aspect-4\\/5");
    expect(portraitWrapper).not.toBeNull();

    // Candidate number badge
    const numberBadge = container.querySelector(".contestant-num-badge");
    expect(numberBadge).not.toBeNull();
    expect(numberBadge?.textContent).toContain("#01");

    // Sash tag
    const sashBadge = container.querySelector(".contestant-sash-badge");
    expect(sashBadge).not.toBeNull();
    expect(sashBadge?.textContent).toBe("Miss Mandaluyong");

    // Name
    const nameEl = container.querySelector(".contestant-name");
    expect(nameEl?.textContent).toBe("Danielle Patricia Cruz");

    // Dual action buttons: free vote & boost outline
    const boostOutlineBtn = container.querySelector(".btn-pageant-boost-outline");
    expect(boostOutlineBtn).not.toBeNull();
    expect(boostOutlineBtn?.textContent).toContain("Boost");

    // Vote count metrics
    const voteCount = container.querySelector(".contestant-vote-count");
    expect(voteCount?.textContent).toBe("1,420");
  });

  it("renders BoostVoteModal with boost-modal-dialog and boost-tier-card hooks", () => {
    const onClose = vi.fn();

    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <BoostVoteModal
          isOpen={true}
          onClose={onClose}
          eventId="evt-pageant-1"
          eventTitle="Ms. Tala 2026"
          contestantId="contestant-1"
          contestantName="Danielle Patricia Cruz"
          contestantNumber={1}
        />
      </EventThemeProvider>,
    );

    const modalDialog = container.querySelector(".boost-modal-dialog");
    expect(modalDialog).not.toBeNull();

    const tierCards = container.querySelectorAll(".boost-tier-card");
    expect(tierCards.length).toBeGreaterThan(0);
  });

  it("strictly preserves ELECTA_DEFAULT theme tokens and sharp geometry without regression", () => {
    const { container } = render(
      <EventThemeProvider theme="ELECTA_DEFAULT">
        <EventCountdown
          operationalState="Active"
          startsAt={mockEvent.startsAt}
          endsAt={mockEvent.endsAt}
        />
      </EventThemeProvider>,
    );

    const themeContainer = container.firstElementChild as HTMLElement;
    expect(themeContainer.getAttribute("data-event-theme")).toBe("electa-default");
    expect(themeContainer.style.getPropertyValue("--bg-base")).toBe("#F8FAFC");
    expect(themeContainer.style.getPropertyValue("--accent-primary")).toBe("#0284C7");
    expect(themeContainer.style.getPropertyValue("--radius-sm")).toBe("0px");
  });
});
