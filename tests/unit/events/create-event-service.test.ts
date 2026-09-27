import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvent } from "@/features/events/services/create-event";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import type { CreateEventInput } from "@/lib/validations/event";
import type { Event, EventAuditLog } from "@/generated/client/client";

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

describe("createEvent Service", () => {
  const validPayload: CreateEventInput = {
    title: "Miss Universe Philippines 2026",
    slug: "muph-2026",
    description: "Official national voting competition for Miss Universe Philippines 2026.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: "2026-10-01T00:00:00.000Z",
    endsAt: "2026-10-31T23:59:59.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UNAUTHORIZED error when user has no active session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await createEvent(validPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Unauthorized: Organizer session required");
    }
  });

  it("returns validation error when payload fails schema requirements", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "org_user_123",
      email: "organizer@example.com",
    });

    const invalidPayload = {
      ...validPayload,
      title: "ab", // Too short
    };

    const result = await createEvent(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.title).toBeDefined();
    }
  });

  it("returns error when slug is already taken (case-insensitive collision)", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "org_user_123",
      email: "organizer@example.com",
    });

    vi.mocked(db.event.findFirst).mockResolvedValue({
      id: "existing_event_id",
    } as unknown as Event);

    const result = await createEvent(validPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("already exists");
      expect(result.fieldErrors?.slug).toBeDefined();
    }
  });

  it("creates Event and initial EventAuditLog in a transaction", async () => {
    const mockSession = {
      userId: "org_user_123",
      email: "organizer@example.com",
    };
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(db.event.findFirst).mockResolvedValue(null);

    const mockCreatedEvent: Event = {
      id: "evt_new_123",
      slug: "muph-2026",
      title: "Miss Universe Philippines 2026",
      description: "Official national voting competition for Miss Universe Philippines 2026.",
      bannerUrl: "https://example.com/banner.jpg",
      startsAt: new Date("2026-10-01T00:00:00.000Z"),
      endsAt: new Date("2026-10-31T23:59:59.000Z"),
      publicationStatus: "DRAFT",
      draftPassphraseHash: null,
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      organizerId: "org_user_123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAuditLog: EventAuditLog = {
      id: "audit_123",
      eventId: "evt_new_123",
      action: "EVENT_CREATED",
      changedBy: "org_user_123",
      previousVal: {},
      newVal: {},
      reason: "Initial event record creation",
      createdAt: new Date(),
    };

    vi.mocked(db.$transaction).mockImplementation(async (callback) => {
      const tx = {
        event: {
          create: vi.fn().mockResolvedValue(mockCreatedEvent),
        },
        eventAuditLog: {
          create: vi.fn().mockResolvedValue(mockAuditLog),
        },
      };
      return (callback as unknown as (prisma: typeof tx) => Promise<Event>)(tx);
    });

    const result = await createEvent(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.id).toBe("evt_new_123");
      expect(result.data?.organizerId).toBe("org_user_123");
      expect(result.data?.publicationStatus).toBe("DRAFT");
      expect(result.data?.isFreeVotingEnabled).toBe(true);
      expect(result.data?.dailyFreeVoteLimit).toBe(1);
      expect(result.data?.showResultsOnClose).toBe(true);
    }
  });
});
