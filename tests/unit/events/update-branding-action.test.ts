import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateEventBrandingAction } from "@/features/events/actions/update-event-branding";
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

describe("updateEventBrandingAction", () => {
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
    organizerId: "usr_organizer_mock_01",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("successfully updates event branding and creates audit log", async () => {
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
      title: "Miss Visayas 2026 Coronation",
      description: "Updated pageant description.",
      bannerUrl: "https://example.com/new-banner.jpg",
    };

    const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit_1" });
    const mockEventUpdate = vi.fn().mockResolvedValue(updatedMockEvent);

    vi.mocked(db.$transaction).mockImplementation(
      async (
        callback: (tx: {
          event: { update: typeof mockEventUpdate };
          eventAuditLog: { create: typeof mockAuditLogCreate };
        }) => Promise<unknown>,
      ) => {
        return callback({
          event: { update: mockEventUpdate },
          eventAuditLog: { create: mockAuditLogCreate },
        });
      },
    );

    const result = await updateEventBrandingAction("miss-visayas-2026", {
      title: "Miss Visayas 2026 Coronation",
      description: "Updated pageant description.",
      bannerUrl: "https://example.com/new-banner.jpg",
      reason: "Updated title and imagery",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Miss Visayas 2026 Coronation");
      expect(result.message).toBe("Event branding updated successfully");
    }

    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt_123" },
      data: {
        title: "Miss Visayas 2026 Coronation",
        description: "Updated pageant description.",
        bannerUrl: "https://example.com/new-banner.jpg",
      },
    });

    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        eventId: "evt_123",
        action: "UPDATE_BRANDING",
        changedBy: "usr_organizer_mock_01",
        previousVal: {
          title: "Miss Visayas 2026",
          description: "Annual pageant.",
          bannerUrl: "https://example.com/banner.jpg",
        },
        newVal: {
          title: "Miss Visayas 2026 Coronation",
          description: "Updated pageant description.",
          bannerUrl: "https://example.com/new-banner.jpg",
        },
        reason: "Updated title and imagery",
      },
    });
  });

  it("returns error when unauthenticated", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHENTICATED",
    });

    const result = await updateEventBrandingAction("miss-visayas-2026", {
      title: "New Title",
      description: "Description",
      bannerUrl: "https://example.com/banner.jpg",
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
      session: { userId: "other_user", email: "other@example.com" },
      eventTitle: "Miss Visayas 2026",
    });

    const result = await updateEventBrandingAction("miss-visayas-2026", {
      title: "New Title",
      description: "Description",
      bannerUrl: "https://example.com/banner.jpg",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Forbidden");
    }
  });

  it("returns validation errors for invalid input", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: baseEvent,
      session: { userId: "usr_organizer_mock_01", email: "organizer@electa.ph" },
    });

    const result = await updateEventBrandingAction("miss-visayas-2026", {
      title: "Ab", // Too short
      description: "Valid description",
      bannerUrl: "invalid-url",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.title).toBeDefined();
      expect(result.fieldErrors?.bannerUrl).toBeDefined();
    }
  });
});
