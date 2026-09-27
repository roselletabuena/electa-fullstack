import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateScheduleLifecycleAction } from "@/features/events/actions/update-schedule-lifecycle";
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

describe("updateScheduleLifecycleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEvent: Event = {
    id: "evt_123",
    slug: "miss-visayas-2026",
    title: "Miss Visayas 2026",
    description: "Annual pageant.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01T09:00:00.000Z"),
    endsAt: new Date("2026-10-15T23:59:59.000Z"),
    publicationStatus: "DRAFT",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    dailyFreeVoteLimit: 1,
    organizerId: "usr_organizer_mock_01",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("successfully updates schedule dates and writes audit log", async () => {
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
      startsAt: new Date("2026-10-05T09:00:00.000Z"),
      endsAt: new Date("2026-10-20T23:59:59.000Z"),
    };

    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_sl_1" });
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

    const result = await updateScheduleLifecycleAction("miss-visayas-2026", {
      startsAt: "2026-10-05T09:00:00.000Z",
      endsAt: "2026-10-20T23:59:59.000Z",
      publicationStatus: "DRAFT",
      clearDraftPassphrase: false,
      reason: "Postponed dates by 4 days",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toBe("Schedule and lifecycle settings updated successfully");
    }

    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt_123" },
      data: {
        startsAt: new Date("2026-10-05T09:00:00.000Z"),
        endsAt: new Date("2026-10-20T23:59:59.000Z"),
        publicationStatus: "DRAFT",
        draftPassphraseHash: null,
      },
    });

    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        eventId: "evt_123",
        action: "UPDATE_SCHEDULE_LIFECYCLE",
        changedBy: "usr_organizer_mock_01",
        previousVal: {
          startsAt: "2026-10-01T09:00:00.000Z",
          endsAt: "2026-10-15T23:59:59.000Z",
          publicationStatus: "DRAFT",
          hasDraftPassphrase: false,
        },
        newVal: {
          startsAt: "2026-10-05T09:00:00.000Z",
          endsAt: "2026-10-20T23:59:59.000Z",
          publicationStatus: "DRAFT",
          hasDraftPassphrase: false,
        },
        reason: "Postponed dates by 4 days",
      },
    });
  });

  it("successfully transitions status from DRAFT to PUBLISHED", async () => {
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
      publicationStatus: "PUBLISHED",
    };

    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_sl_2" });
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

    const result = await updateScheduleLifecycleAction("miss-visayas-2026", {
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-15T23:59:59.000Z",
      publicationStatus: "PUBLISHED",
      clearDraftPassphrase: false,
      reason: "Official public launch",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publicationStatus).toBe("PUBLISHED");
    }

    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt_123" },
      data: {
        startsAt: new Date("2026-10-01T09:00:00.000Z"),
        endsAt: new Date("2026-10-15T23:59:59.000Z"),
        publicationStatus: "PUBLISHED",
        draftPassphraseHash: null,
      },
    });
  });

  it("hashes and sets draft review passphrase", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: baseEvent,
      session: {
        userId: "usr_organizer_mock_01",
        email: "organizer@electa.ph",
      },
    });

    let savedHash: string | null = null;
    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_sl_3" });
    const mockEventUpdate = vi
      .fn()
      .mockImplementation(({ data }: { data: { draftPassphraseHash: string | null } }) => {
        savedHash = data.draftPassphraseHash;
        return {
          ...baseEvent,
          draftPassphraseHash: savedHash,
        };
      });

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

    const result = await updateScheduleLifecycleAction("miss-visayas-2026", {
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-15T23:59:59.000Z",
      publicationStatus: "DRAFT",
      draftPassphrase: "secret-preview",
      clearDraftPassphrase: false,
    });

    expect(result.success).toBe(true);
    expect(savedHash).toBeDefined();
    expect(savedHash).toContain(":"); // Salt:Hash format
  });

  it("clears draft review passphrase when clearDraftPassphrase is true", async () => {
    const eventWithPassphrase: Event = {
      ...baseEvent,
      draftPassphraseHash: "mock_salt:mock_hash",
    };

    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: eventWithPassphrase,
      session: {
        userId: "usr_organizer_mock_01",
        email: "organizer@electa.ph",
      },
    });

    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_sl_4" });
    const mockEventUpdate = vi.fn().mockResolvedValue({
      ...eventWithPassphrase,
      draftPassphraseHash: null,
    });

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

    const result = await updateScheduleLifecycleAction("miss-visayas-2026", {
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-15T23:59:59.000Z",
      publicationStatus: "DRAFT",
      clearDraftPassphrase: true,
    });

    expect(result.success).toBe(true);
    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt_123" },
      data: {
        startsAt: new Date("2026-10-01T09:00:00.000Z"),
        endsAt: new Date("2026-10-15T23:59:59.000Z"),
        publicationStatus: "DRAFT",
        draftPassphraseHash: null,
      },
    });
  });

  it("returns validation error when endsAt is before startsAt", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: baseEvent,
      session: { userId: "usr_organizer_mock_01", email: "organizer@electa.ph" },
    });

    const result = await updateScheduleLifecycleAction("miss-visayas-2026", {
      startsAt: "2026-10-20T00:00:00.000Z",
      endsAt: "2026-10-01T00:00:00.000Z",
      publicationStatus: "DRAFT",
      clearDraftPassphrase: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.endsAt).toBeDefined();
    }
  });

  it("returns error when unauthenticated", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHENTICATED",
    });

    const result = await updateScheduleLifecycleAction("miss-visayas-2026", {
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-15T23:59:59.000Z",
      publicationStatus: "DRAFT",
      clearDraftPassphrase: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("signed in");
    }
  });
});
