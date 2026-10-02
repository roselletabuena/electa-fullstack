import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvent } from "@/features/events/services/create-event";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import type { CreateEventInput } from "@/lib/validations/event";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    eventAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("createEvent Service - Unified Authentication (VS-53)", () => {
  const payload: CreateEventInput = {
    title: "Miss Electa 2026",
    slug: "miss-electa-2026",
    description: "Pageant event created by an authenticated Electa user.",
    bannerUrl: "https://example.com/electa.jpg",
    startsAt: "2026-11-01T00:00:00.000Z",
    endsAt: "2026-11-30T23:59:59.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows any authenticated user (voter or organizer) to create an event with their userId as organizerId", async () => {
    const voterSession = {
      userId: "usr_voter_12345",
      email: "voter@electa.ph",
      name: "Juan Dela Cruz",
      role: "USER",
    };

    vi.mocked(getSession).mockResolvedValue(voterSession);
    vi.mocked(db.event.findFirst).mockResolvedValue(null);

    const mockCreatedEvent = {
      id: "ev_test_123",
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      bannerUrl: payload.bannerUrl,
      startsAt: new Date(payload.startsAt),
      endsAt: new Date(payload.endsAt),
      publicationStatus: "DRAFT" as const,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      showResultsOnClose: true,
      organizerId: voterSession.userId,
      draftPassphraseHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.$transaction).mockImplementation((async (
      fn: (tx: unknown) => Promise<unknown>,
    ) => {
      return fn({
        event: {
          create: vi.fn().mockResolvedValue(mockCreatedEvent),
        },
        eventAuditLog: {
          create: vi.fn().mockResolvedValue({ id: "log_1" }),
        },
      });
    }) as unknown as typeof db.$transaction);

    const result = await createEvent(payload);

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.organizerId).toBe("usr_voter_12345");
      expect(result.data.title).toBe("Miss Electa 2026");
    }
  });
});
