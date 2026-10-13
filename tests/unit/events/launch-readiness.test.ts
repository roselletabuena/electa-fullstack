import { describe, it, expect } from "vitest";
import { computeLaunchReadinessSnapshot } from "@/features/events/utils/launch-readiness";
import type { Event } from "@/generated/client/client";

const mockBaseEvent: Event = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "mutya-ng-pilipinas-2026",
  title: "Mutya ng Pilipinas 2026",
  description: "Official National Pageant",
  bannerUrl: "https://example.com/banner.jpg",
  startsAt: new Date("2026-11-01T00:00:00.000Z"),
  endsAt: new Date("2026-11-30T23:59:59.000Z"),
  publicationStatus: "DRAFT",
  draftPassphraseHash: null,
  showResultsOnClose: true,
  isFreeVotingEnabled: true,
  dailyFreeVoteLimit: 1,
  takeRatePercentage: "12.00" as unknown as Event["takeRatePercentage"],
  organizerId: "org-123",
  createdAt: new Date("2026-10-13T00:00:00.000Z"),
  updatedAt: new Date("2026-10-13T00:00:00.000Z"),
};

describe("computeLaunchReadinessSnapshot", () => {
  it("computes 1/4 (25%) progress for freshly created event with no divisions or contestants", () => {
    const snapshot = computeLaunchReadinessSnapshot(mockBaseEvent, {
      divisionsCount: 0,
      contestantsCount: 0,
      votingRulesAuditCount: 0,
    });

    expect(snapshot.eventId).toBe(mockBaseEvent.id);
    expect(snapshot.slug).toBe("mutya-ng-pilipinas-2026");
    expect(snapshot.publicationStatus).toBe("DRAFT");
    expect(snapshot.totalMilestones).toBe(4);
    expect(snapshot.completedMilestones).toBe(1);
    expect(snapshot.percentageComplete).toBe(25);
    expect(snapshot.isAllCompleted).toBe(false);

    const [profile, divisions, contestants, votingRules] = snapshot.items;

    expect(profile.id).toBe("event-profile");
    expect(profile.isCompleted).toBe(true);

    expect(divisions.id).toBe("divisions");
    expect(divisions.isCompleted).toBe(false);
    expect(divisions.actionHref).toBe("/events/mutya-ng-pilipinas-2026/settings?tab=categories");

    expect(contestants.id).toBe("contestants");
    expect(contestants.isCompleted).toBe(false);
    expect(contestants.actionHref).toBe("/events/mutya-ng-pilipinas-2026/contestants");

    expect(votingRules.id).toBe("voting-rules");
    expect(votingRules.isCompleted).toBe(false);
    expect(votingRules.actionHref).toBe("/events/mutya-ng-pilipinas-2026/settings?tab=voting-rules");
  });

  it("marks divisions completed when divisionsCount > 0", () => {
    const snapshot = computeLaunchReadinessSnapshot(mockBaseEvent, {
      divisionsCount: 3,
      contestantsCount: 0,
      votingRulesAuditCount: 0,
    });

    expect(snapshot.completedMilestones).toBe(2);
    expect(snapshot.percentageComplete).toBe(50);
    expect(snapshot.items[1].isCompleted).toBe(true);
  });

  it("marks contestants completed when contestantsCount > 0", () => {
    const snapshot = computeLaunchReadinessSnapshot(mockBaseEvent, {
      divisionsCount: 3,
      contestantsCount: 12,
      votingRulesAuditCount: 0,
    });

    expect(snapshot.completedMilestones).toBe(3);
    expect(snapshot.percentageComplete).toBe(75);
    expect(snapshot.items[2].isCompleted).toBe(true);
  });

  it("marks voting rules completed when votingRulesAuditCount > 0", () => {
    const snapshot = computeLaunchReadinessSnapshot(mockBaseEvent, {
      divisionsCount: 3,
      contestantsCount: 12,
      votingRulesAuditCount: 1,
    });

    expect(snapshot.completedMilestones).toBe(4);
    expect(snapshot.percentageComplete).toBe(100);
    expect(snapshot.isAllCompleted).toBe(true);
    expect(snapshot.items[3].isCompleted).toBe(true);
  });

  it("reflects PUBLISHED publication status correctly", () => {
    const publishedEvent: Event = {
      ...mockBaseEvent,
      publicationStatus: "PUBLISHED",
    };

    const snapshot = computeLaunchReadinessSnapshot(publishedEvent, {
      divisionsCount: 2,
      contestantsCount: 10,
      votingRulesAuditCount: 1,
    });

    expect(snapshot.publicationStatus).toBe("PUBLISHED");
    expect(snapshot.isAllCompleted).toBe(true);
  });
});
