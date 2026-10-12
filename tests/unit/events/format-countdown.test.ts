import { describe, it, expect } from "vitest";
import {
  formatLifecycleCountdown,
  getActionLabelForStatus,
  filterEventsByLifecycle,
} from "@/features/events/utils/trending-helpers";
import type { PublicEventDto } from "@/features/events/types";

describe("Trending Events Helpers & Formatters", () => {
  const baseEvent: PublicEventDto = {
    id: "evt_test",
    slug: "test-pageant",
    title: "Test Pageant 2026",
    description: "Annual test pageant event",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-15T10:00:00Z").toISOString(),
    endsAt: new Date("2026-10-20T10:00:00Z").toISOString(),
    serverTime: new Date("2026-10-12T00:00:00Z").toISOString(),
    operationalState: "Scheduled",
    showResultsOnClose: true,
    location: "Baguio City, Northern Luzon",
    contestants: [
      {
        id: "cst_1",
        contestantNumber: 1,
        name: "Contestant One",
        bio: "Bio",
        avatarUrl: "https://example.com/c1.jpg",
        voteCount: null,
      },
    ],
  };

  describe("getActionLabelForStatus", () => {
    it("returns 'VIEW EVENT →' for Active operational state", () => {
      expect(getActionLabelForStatus("Active")).toBe("VIEW EVENT →");
    });

    it("returns 'PREVIEW EVENT →' for Scheduled operational state", () => {
      expect(getActionLabelForStatus("Scheduled")).toBe("PREVIEW EVENT →");
    });

    it("returns 'VIEW FINAL TALLIES →' for Closed operational state", () => {
      expect(getActionLabelForStatus("Closed")).toBe("VIEW FINAL TALLIES →");
    });

    it("returns 'PREVIEW DRAFT →' for Draft operational state", () => {
      expect(getActionLabelForStatus("Draft")).toBe("PREVIEW DRAFT →");
    });
  });

  describe("formatLifecycleCountdown", () => {
    it("formats countdown for Closed event as 'FINAL TALLIES'", () => {
      const closedEvent: PublicEventDto = {
        ...baseEvent,
        operationalState: "Closed",
      };
      const res = formatLifecycleCountdown(closedEvent, new Date("2026-10-21T00:00:00Z"));
      expect(res.pillLabel).toBe("FINAL TALLIES");
      expect(res.pillVariant).toBe("closed");
      expect(res.actionLabel).toBe("VIEW FINAL TALLIES →");
    });

    it("formats countdown for Scheduled event with remaining days and hours", () => {
      const scheduledEvent: PublicEventDto = {
        ...baseEvent,
        startsAt: new Date("2026-10-15T12:00:00Z").toISOString(),
        operationalState: "Scheduled",
      };
      // 2 days and 12 hours before start
      const now = new Date("2026-10-13T00:00:00Z");
      const res = formatLifecycleCountdown(scheduledEvent, now);
      expect(res.pillLabel).toBe("OPENS IN 2D 12H");
      expect(res.pillVariant).toBe("scheduled");
      expect(res.actionLabel).toBe("PREVIEW EVENT →");
    });

    it("formats countdown for Active event with remaining days and hours", () => {
      const activeEvent: PublicEventDto = {
        ...baseEvent,
        startsAt: new Date("2026-10-10T00:00:00Z").toISOString(),
        endsAt: new Date("2026-10-14T11:00:00Z").toISOString(),
        operationalState: "Active",
      };
      // 2 days and 11 hours remaining before endsAt
      const now = new Date("2026-10-12T00:00:00Z");
      const res = formatLifecycleCountdown(activeEvent, now);
      expect(res.pillLabel).toBe("⏳ 2D 11H LEFT");
      expect(res.pillVariant).toBe("active");
      expect(res.actionLabel).toBe("VIEW EVENT →");
    });

    it("formats countdown for Active event ending in less than 24 hours", () => {
      const activeEvent: PublicEventDto = {
        ...baseEvent,
        endsAt: new Date("2026-10-12T05:30:00Z").toISOString(),
        operationalState: "Active",
      };
      const now = new Date("2026-10-12T00:00:00Z");
      const res = formatLifecycleCountdown(activeEvent, now);
      expect(res.pillLabel).toBe("⏳ 5H 30M LEFT");
      expect(res.pillVariant).toBe("active");
    });

    it("formats countdown for Active event ending in less than 1 hour as closing soon", () => {
      const activeEvent: PublicEventDto = {
        ...baseEvent,
        endsAt: new Date("2026-10-12T00:45:00Z").toISOString(),
        operationalState: "Active",
      };
      const now = new Date("2026-10-12T00:00:00Z");
      const res = formatLifecycleCountdown(activeEvent, now);
      expect(res.pillLabel).toBe("⏳ 45M LEFT");
      expect(res.isUrgent).toBe(true);
    });
  });

  describe("filterEventsByLifecycle", () => {
    const list: PublicEventDto[] = [
      { ...baseEvent, id: "1", operationalState: "Active" },
      { ...baseEvent, id: "2", operationalState: "Scheduled" },
      { ...baseEvent, id: "3", operationalState: "Closed" },
      { ...baseEvent, id: "4", operationalState: "Draft" },
    ];

    it("filters 'all' returning published events (Active, Scheduled, Closed) and excludes Draft", () => {
      const res = filterEventsByLifecycle(list, "all");
      expect(res.map((e) => e.id)).toEqual(["1", "2", "3"]);
    });

    it("filters 'active' returning only Active events", () => {
      const res = filterEventsByLifecycle(list, "active");
      expect(res.map((e) => e.id)).toEqual(["1"]);
    });

    it("filters 'scheduled' returning only Scheduled events", () => {
      const res = filterEventsByLifecycle(list, "scheduled");
      expect(res.map((e) => e.id)).toEqual(["2"]);
    });

    it("filters 'closed' returning only Closed events", () => {
      const res = filterEventsByLifecycle(list, "closed");
      expect(res.map((e) => e.id)).toEqual(["3"]);
    });
  });
});
