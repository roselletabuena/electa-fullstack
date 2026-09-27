import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import type { Event } from "@/generated/client/client";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
  },
}));

describe("requireEventOwnership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UNAUTHENTICATED when session is null", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await requireEventOwnership("test-slug");
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toBe("UNAUTHENTICATED");
    }
  });

  it("returns NOT_FOUND when event does not exist", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "org_123",
      email: "org@example.com",
    });
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    const result = await requireEventOwnership("missing-slug");
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toBe("NOT_FOUND");
    }
  });

  it("returns UNAUTHORIZED when session user is not event organizer", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "user_other_456",
      email: "other@example.com",
    });
    const mockEvent: Event = {
      id: "event_1",
      slug: "test-slug",
      title: "Pageant 2026",
      description: "Annual pageant",
      bannerUrl: "https://example.com/banner.jpg",
      startsAt: new Date("2026-10-01"),
      endsAt: new Date("2026-10-02"),
      publicationStatus: "PUBLISHED",
      draftPassphraseHash: null,
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      organizerId: "org_owner_123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent);

    const result = await requireEventOwnership("test-slug");
    expect(result.authorized).toBe(false);
    if (!result.authorized && result.reason === "UNAUTHORIZED") {
      expect(result.session.userId).toBe("user_other_456");
      expect(result.eventTitle).toBe("Pageant 2026");
    }
  });

  it("returns authorized true when session user is event organizer", async () => {
    const mockEvent: Event = {
      id: "event_1",
      slug: "test-slug",
      title: "Pageant 2026",
      description: "Annual pageant",
      bannerUrl: "https://example.com/banner.jpg",
      startsAt: new Date("2026-10-01"),
      endsAt: new Date("2026-10-02"),
      publicationStatus: "PUBLISHED",
      draftPassphraseHash: null,
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      organizerId: "org_owner_123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(getSession).mockResolvedValue({
      userId: "org_owner_123",
      email: "owner@example.com",
    });
    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent);

    const result = await requireEventOwnership("test-slug");
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.event.slug).toBe("test-slug");
      expect(result.session.userId).toBe("org_owner_123");
    }
  });
});
