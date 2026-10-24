import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EventThemeProvider } from "@/features/events/theme/EventThemeProvider";
import { THEME_REGISTRY } from "@/features/events/theme";
import { EventCountdown } from "@/features/events/components/EventCountdown";
import { EventBanner } from "@/features/events/components/EventBanner";
import { ContestantCard } from "@/features/contestants/components/ContestantCard";
import { ContestantProfileModal } from "@/features/contestants/components/ContestantProfileModal";
import { BoostVoteModal } from "@/features/payments/components/BoostVoteModal";
import { VoteStoryModal } from "@/features/voting/components/VoteStoryModal";
import type { PublicEventDto } from "@/features/events/types";
import type { ContestantDto } from "@/features/contestants/types";
import type { StoryCardPayload } from "@/features/voting/types/story";
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

const mockStoryPayload: StoryCardPayload = {
  eventSlug: "ms-tala-2026",
  eventTitle: "Ms. Tala 2026 Grand Coronation",
  candidateId: "contestant-1",
  candidateName: "Danielle Patricia Cruz",
  candidateNumber: 1,
  candidateAvatarUrl: "/mock-cover.jpg",
  divisionName: "Pageant",
  votingUrl: "https://electa.app/events/ms-tala-2026?contestantId=contestant-1",
  theme: "midnight",
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
    expect(unitCards).toHaveLength(4);

    const unitValues = container.querySelectorAll(".countdown-unit-value");
    expect(unitValues).toHaveLength(4);

    const separators = container.querySelectorAll(".countdown-separator");
    expect(separators).toHaveLength(3);

    expect(screen.getByText("Live Voting Window")).toBeDefined();
    expect(screen.getByText("Voting Closes In")).toBeDefined();
  });

  it("renders ContestantCard with 4:5 portrait dossier, sash tag, and dual action buttons", () => {
    const onSelect = vi.fn();
    const onVoteClick = vi.fn();

    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <ContestantCard contestant={mockContestant} onSelect={onSelect} onVoteClick={onVoteClick} />
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

  it("renders VoteStoryModal with theme hooks, portaled dialog, and default coronation theme under PAGEANT_EDITORIAL", async () => {
    const onClose = vi.fn();

    await act(async () => {
      render(
        <EventThemeProvider theme="PAGEANT_EDITORIAL">
          <VoteStoryModal isOpen={true} onClose={onClose} payload={mockStoryPayload} />
        </EventThemeProvider>,
      );
    });

    // Portaled dialog attached to document.body
    const dialog = document.querySelector("dialog[data-event-theme='pageant-editorial']");
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-labelledby")).toBe("share-story-title");

    const modalContainer = document.querySelector(".vote-story-modal-container");
    expect(modalContainer).not.toBeNull();

    // Verified badge
    const badge = document.querySelector(".vote-story-verified-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain("Official Ballot Verified");

    // Close button
    const closeBtn = document.querySelector(".vote-story-modal-close-btn");
    expect(closeBtn).not.toBeNull();

    // Theme selector tabs
    const themeBar = document.querySelector(".vote-story-theme-bar");
    expect(themeBar).not.toBeNull();

    const themeTabs = document.querySelectorAll(".vote-story-theme-tab");
    expect(themeTabs).toHaveLength(3);

    // Under PAGEANT_EDITORIAL, the active theme tab defaults to Coronation
    const activeTab = document.querySelector(".vote-story-theme-tab.active");
    expect(activeTab).not.toBeNull();
    expect(activeTab?.textContent).toContain("Coronation");

    // Action buttons
    const shareBtn = document.querySelector(".story-btn-share");
    expect(shareBtn).not.toBeNull();
    expect(shareBtn?.textContent).toContain("Share Story");

    const downloadBtn = document.querySelector(".story-btn-download");
    expect(downloadBtn).not.toBeNull();
    expect(downloadBtn?.textContent).toContain("Download");

    const copyBtn = document.querySelector(".story-btn-copy");
    expect(copyBtn).not.toBeNull();
    expect(copyBtn?.textContent).toContain("Copy Direct Candidate Voting Link");

    // Escape key closes the modal
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders ContestantProfileModal portaled with data-event-theme and clean candidate badge without icon", () => {
    const onClose = vi.fn();

    render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <ContestantProfileModal isOpen={true} onClose={onClose} contestant={mockContestant} />
      </EventThemeProvider>,
    );

    // Portaled dialog attached to document.body
    const dialog = document.querySelector("dialog[data-event-theme='pageant-editorial']");
    expect(dialog).not.toBeNull();

    const modalContainer = document.querySelector(".contestant-profile-modal-container");
    expect(modalContainer).not.toBeNull();

    // Clean candidate number badge without sparkle icon
    const badge = document.querySelector(".contestant-modal-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain("Candidate #01");

    // Accessible labelling
    expect(dialog?.getAttribute("aria-labelledby")).toBe("contestant-modal-title");
    const titleEl = document.getElementById("contestant-modal-title");
    expect(titleEl).not.toBeNull();
    expect(titleEl?.textContent).toBe("Danielle Patricia Cruz");

    // Modal dialog must not hardcode 'dark' class so it seamlessly responds to both Light & Dark modes
    expect(dialog?.classList.contains("dark")).toBe(false);

    // Standing and voting action card is cleanly rendered inside the candidate dossier column
    const footer = modalContainer?.querySelector(".contestant-modal-footer");
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain("Current Standing");

    // Escape key closes the modal
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders PhotoGalleryCarousel with theme hooks and opens Haute-Couture lightbox modal", () => {
    const onClose = vi.fn();

    render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <ContestantProfileModal isOpen={true} onClose={onClose} contestant={mockContestant} />
      </EventThemeProvider>,
    );

    // PhotoGalleryCarousel main display
    const mainDisplay = document.querySelector(".carousel-main-display");
    expect(mainDisplay).not.toBeNull();

    // Expand button (top-left)
    const expandBtn = document.querySelector(".carousel-expand-btn");
    expect(expandBtn).not.toBeNull();
    expect(expandBtn?.getAttribute("aria-label")).toBe("Open Fullscreen Lightbox");

    // Counter badge (top-right)
    const counterBadge = document.querySelector(".carousel-counter-badge");
    expect(counterBadge).not.toBeNull();
    expect(counterBadge?.textContent?.trim()).toBe("1 / 1");

    // Click expand button to open Fullscreen Lightbox Modal
    fireEvent.click(expandBtn!);

    // Portaled Lightbox Dialog
    const lightboxDialog = document.querySelector("dialog.carousel-lightbox-dialog");
    expect(lightboxDialog).not.toBeNull();
    expect(lightboxDialog?.getAttribute("data-event-theme")).toBe("pageant-editorial");

    // Candidate Header Area
    const candidateNameEl = document.querySelector(".carousel-lightbox-candidate-name");
    expect(candidateNameEl?.textContent).toBe("Danielle Patricia Cruz");

    // Framed Photo Stage
    const imageFrame = document.querySelector(".carousel-lightbox-image-frame");
    expect(imageFrame).not.toBeNull();

    // Close Button
    const closeBtn = document.querySelector(".carousel-lightbox-close-btn");
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.getAttribute("aria-label")).toBe("Close fullscreen view");

    // Lightbox Counter Badge
    const lightboxCounter = document.querySelector(".carousel-lightbox-counter-badge");
    expect(lightboxCounter?.textContent).toContain("1");
  });

  it("renders EventBanner with full-bleed backdrop masthead, high-contrast title, and operational timeline", () => {
    const { container } = render(
      <EventThemeProvider theme="PAGEANT_EDITORIAL">
        <EventBanner event={mockEvent} totalVotes={1420} />
      </EventThemeProvider>,
    );

    const bannerHeader = container.querySelector("header.event-banner-card");
    expect(bannerHeader).not.toBeNull();

    // Backdrop image and gradient scrim overlays
    const image = bannerHeader?.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("alt")).toBe(mockEvent.title);

    // High-contrast title and description hooks
    const title = bannerHeader?.querySelector(".event-banner-title");
    expect(title).not.toBeNull();
    expect(title?.textContent).toBe(mockEvent.title);
    expect(title?.className).toContain("text-white");

    const description = bannerHeader?.querySelector(".event-banner-description");
    expect(description).not.toBeNull();
    expect(description?.textContent).toBe(mockEvent.description);

    // Operational schedule timeline
    const timeline = bannerHeader?.querySelector(".event-banner-timeline");
    expect(timeline).not.toBeNull();

    const scheduleIcons = bannerHeader?.querySelectorAll(".event-schedule-icon");
    expect(scheduleIcons).toHaveLength(2);

    const timelineLabels = bannerHeader?.querySelectorAll(".timeline-label");
    expect(timelineLabels).toHaveLength(2);
    expect(timelineLabels?.[0]?.textContent).toBe("Opens:");
    expect(timelineLabels?.[1]?.textContent).toBe("Closes:");
  });

  it("strictly preserves ELECTA_DEFAULT theme tokens, icon colors, and sharp geometry without regression", async () => {
    let container!: HTMLElement;

    await act(async () => {
      const rendered = render(
        <EventThemeProvider theme="ELECTA_DEFAULT">
          <EventCountdown
            operationalState="Active"
            startsAt={mockEvent.startsAt}
            endsAt={mockEvent.endsAt}
          />
          <EventBanner event={mockEvent} totalVotes={1420} />
          <ContestantCard contestant={mockContestant} onSelect={vi.fn()} onVoteClick={vi.fn()} />
          <VoteStoryModal isOpen={true} onClose={vi.fn()} payload={mockStoryPayload} />
        </EventThemeProvider>,
      );
      container = rendered.container;
    });

    const themeContainer = container.firstElementChild as HTMLElement;
    expect(themeContainer.getAttribute("data-event-theme")).toBe("electa-default");
    expect(themeContainer.style.getPropertyValue("--bg-base")).toBe("#F8FAFC");
    expect(themeContainer.style.getPropertyValue("--accent-primary")).toBe("#0284C7");
    expect(themeContainer.style.getPropertyValue("--radius-sm")).toBe("0px");
    expect(themeContainer.style.getPropertyValue("--icon-accent")).toBe("#0284C7");

    // Banner badges retain sharp zero-radius geometry in default theme
    const slugBadge = container.querySelector(".event-slug-badge");
    expect(slugBadge?.className).toContain("rounded-none");

    const officialBadge = container.querySelector(".event-official-badge");
    expect(officialBadge?.className).toContain("rounded-none");

    // Schedule calendar icons in EventBanner do not hardcode gold
    const scheduleIcons = container.querySelectorAll(".event-schedule-icon");
    expect(scheduleIcons).toHaveLength(2);
    for (const icon of scheduleIcons) {
      expect(icon.getAttribute("class")).not.toContain("text-[#CBB279]");
      expect(icon.getAttribute("class")).toContain("text-sky-400");
    }

    // ContestantCard dossier icons do not hardcode gold in default theme
    const dossierIcon = container.querySelector(".contestant-dossier-icon");
    expect(dossierIcon).not.toBeNull();
    expect(dossierIcon?.getAttribute("class")).not.toContain("text-[#CBB279]");

    // VoteStoryModal under ELECTA_DEFAULT defaults to Midnight theme tab
    const defaultDialog = document.querySelector("dialog[data-event-theme='electa-default']");
    expect(defaultDialog).not.toBeNull();
    const defaultActiveTab = defaultDialog?.querySelector(".vote-story-theme-tab.active");
    expect(defaultActiveTab?.textContent).toContain("Midnight");
  });
});
