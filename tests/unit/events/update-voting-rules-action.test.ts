import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateVotingRulesAction } from "@/features/events/actions/update-voting-rules";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { db } from "@/lib/db";
import type { Event } from "@/generated/client/client";

vi.mock("@/features/events/utils/ownership-guard", () => ({
  requireEventOwnership: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: vi.fn(),
  },
}));

describe("updateVotingRulesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEvent: Event = {
    id: "evt_123",
    slug: "miss-visayas-2026",
    title: "Miss Visayas 2026",
    description: "Annual pageant.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01"),
    endsAt: new Date("2026-10-02"),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    dailyFreeVoteLimit: 1,
    organizerId: "usr_organizer_mock_01",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("successfully updates voting rules and records audit log", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: baseEvent,
      session: {
        userId: "usr_organizer_mock_01",
        email: "organizer@electa.ph",
      },
    });

    const updatedMockEvent: Event = {
      ...baseEvent,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 3,
    };

    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_vr_1" });
    const mockEventUpdate = vi.fn().mockResolvedValue(updatedMockEvent);

    vi.mocked(db.$transaction).mockImplementation((async (
      callback: (tx: {
        event: { update: typeof mockEventUpdate };
        eventAuditLog: { create: typeof mockAuditLogCreate };
      }) => Promise<unknown>,
    ) => {
      return callback({
        event: { update: mockEventUpdate },
        eventAuditLog: { create: mockAuditLogCreate },
      });
    }) as unknown as typeof db.$transaction);

    const result = await updateVotingRulesAction("miss-visayas-2026", {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 3,
      reason: "Increased free vote quota for preliminary round",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dailyFreeVoteLimit).toBe(3);
      expect(result.data.isFreeVotingEnabled).toBe(true);
      expect(result.message).toBe("Voting rules updated successfully");
    }

    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt_123" },
      data: {
        isFreeVotingEnabled: true,
        dailyFreeVoteLimit: 3,
      },
    });

    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        eventId: "evt_123",
        action: "UPDATE_VOTING_RULES",
        changedBy: "usr_organizer_mock_01",
        previousVal: {
          isFreeVotingEnabled: true,
          dailyFreeVoteLimit: 1,
        },
        newVal: {
          isFreeVotingEnabled: true,
          dailyFreeVoteLimit: 3,
        },
        reason: "Increased free vote quota for preliminary round",
      },
    });
  });

  it("successfully disables free daily voting for coronation grand finals", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: baseEvent,
      session: {
        userId: "usr_organizer_mock_01",
        email: "organizer@electa.ph",
      },
    });

    const updatedMockEvent: Event = {
      ...baseEvent,
      isFreeVotingEnabled: false,
      dailyFreeVoteLimit: 1,
    };

    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_vr_2" });
    const mockEventUpdate = vi.fn().mockResolvedValue(updatedMockEvent);

    vi.mocked(db.$transaction).mockImplementation((async (
      callback: (tx: {
        event: { update: typeof mockEventUpdate };
        eventAuditLog: { create: typeof mockAuditLogCreate };
      }) => Promise<unknown>,
    ) => {
      return callback({
        event: { update: mockEventUpdate },
        eventAuditLog: { create: mockAuditLogCreate },
      });
    }) as unknown as typeof db.$transaction);

    const result = await updateVotingRulesAction("miss-visayas-2026", {
      isFreeVotingEnabled: false,
      dailyFreeVoteLimit: 1,
      reason: "Free voting disabled for Grand Coronation Finals",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFreeVotingEnabled).toBe(false);
    }

    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt_123" },
      data: {
        isFreeVotingEnabled: false,
        dailyFreeVoteLimit: 1,
      },
    });
  });

  it("returns error when unauthenticated", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHENTICATED",
    });

    const result = await updateVotingRulesAction("miss-visayas-2026", {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("signed in");
    }
  });

  it("returns error when unauthorized", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHORIZED",
      session: { userId: "intruder_user", email: "intruder@example.com" },
      eventTitle: "Miss Visayas 2026",
    });

    const result = await updateVotingRulesAction("miss-visayas-2026", {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Forbidden");
    }
  });

  it("returns validation errors for out-of-range quota", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: baseEvent,
      session: { userId: "usr_organizer_mock_01", email: "organizer@electa.ph" },
    });

    const result = await updateVotingRulesAction("miss-visayas-2026", {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 6, // Exceeds max 5
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.dailyFreeVoteLimit).toBeDefined();
    }
  });
});
