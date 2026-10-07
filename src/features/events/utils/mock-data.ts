import type { PublicEventDto } from "../types";
import { deriveEventState } from "./derive-event-state";

export const mockScheduledEvent: PublicEventDto = {
  id: "evt_scheduled_01",
  slug: "miss-luzon-2026",
  title: "Miss Luzon 2026",
  description:
    "The official premier beauty, cultural heritage, and advocacy pageant of Northern and Central Luzon. Support your favorite candidate through authenticated online voting.",
  bannerUrl:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
  startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
  endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
  serverTime: new Date().toISOString(),
  operationalState: "Scheduled",
  showResultsOnClose: true,
  isFreeVotingEnabled: true,
  dailyFreeVoteLimit: 1,
  organizerId: "usr_org_01",
  contestants: [
    {
      id: "cst_01",
      contestantNumber: 1,
      name: "Maria Angelica Santos",
      bio: "Advocate for marine conservation, sustainable coastal ecotourism, and youth literacy.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      voteCount: null,
    },
    {
      id: "cst_02",
      contestantNumber: 2,
      name: "Bea Christine Ramos",
      bio: "Software engineering graduate championing STEM education for underprivileged young women.",
      avatarUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      voteCount: null,
    },
    {
      id: "cst_03",
      contestantNumber: 3,
      name: "Camille Joy Navarro",
      bio: "Heritage preservation advocate dedicated to indigenous textile weaving and community livelihoods.",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      voteCount: null,
    },
    {
      id: "cst_04",
      contestantNumber: 4,
      name: "Danica Rose Flores",
      bio: "Public health educator promoting preventive pediatric care and community mental wellness.",
      avatarUrl:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
      voteCount: null,
    },
  ],
};

export const mockActiveEvent: PublicEventDto = {
  ...mockScheduledEvent,
  id: "evt_active_01",
  slug: "miss-visayas-2026",
  title: "Miss Visayas 2026",
  startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // started 1 day ago
  endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // ends in 2 days
  operationalState: "Active",
};

export const mockClosedEvent: PublicEventDto = {
  ...mockScheduledEvent,
  id: "evt_closed_01",
  slug: "miss-mindanao-2026",
  title: "Miss Mindanao 2026",
  startsAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  endsAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  operationalState: "Closed",
  contestants: mockScheduledEvent.contestants.map((c, index) => ({
    ...c,
    voteCount: (4 - index) * 1420 + 85,
  })),
};

export const mockDraftEvent: PublicEventDto = {
  ...mockScheduledEvent,
  id: "evt_draft_01",
  slug: "preview-draft-contest",
  title: "Miss Global Philippines 2026 (Internal Preview)",
  operationalState: "Draft",
};

export function getMockEventBySlug(slug: string): PublicEventDto | null {
  const events = [mockScheduledEvent, mockActiveEvent, mockClosedEvent, mockDraftEvent];
  const found = events.find((e) => e.slug === slug);
  if (!found) {
    return null;
  }

  const state = deriveEventState(
    {
      publicationStatus: found.operationalState === "Draft" ? "DRAFT" : "PUBLISHED",
      startsAt: found.startsAt,
      endsAt: found.endsAt,
    },
    new Date(),
  );

  return {
    ...found,
    operationalState: state,
    serverTime: new Date().toISOString(),
  };
}
