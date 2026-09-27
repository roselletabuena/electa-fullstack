import { describe, it, expect } from "vitest";
import { dashboardQuerySchema } from "@/lib/validations/dashboard-query";
import {
  computeEventStatus,
  computeDashboardMetrics,
  filterAndPaginateEvents,
} from "@/features/events/utils/dashboard-metrics";
import type { OrganizerEventItemDto } from "@/features/events/types/dashboard-overview";

describe("Dashboard Query Schema Validation", () => {
  it("parses valid default query params", () => {
    const parsed = dashboardQuerySchema.parse({});
    expect(parsed.status).toBe("ALL");
    expect(parsed.q).toBe("");
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(12);
  });

  it("coerces and validates explicit status and query", () => {
    const parsed = dashboardQuerySchema.parse({
      status: "PUBLISHED",
      q: "  Philippine Pageant  ",
      page: "2",
      limit: "10",
    });
    expect(parsed.status).toBe("PUBLISHED");
    expect(parsed.q).toBe("Philippine Pageant");
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(10);
  });

  it("rejects invalid status filter", () => {
    const result = dashboardQuerySchema.safeParse({ status: "INVALID_STATUS" });
    expect(result.success).toBe(false);
  });
});

describe("Dashboard Metrics Calculation", () => {
  const referenceDate = new Date("2026-09-27T12:00:00Z");

  it("computes live, draft, and ended statuses correctly", () => {
    // 1. Live event
    const liveStatus = computeEventStatus(
      {
        publicationStatus: "PUBLISHED",
        startsAt: "2026-09-20T00:00:00Z",
        endsAt: "2026-09-30T00:00:00Z",
      },
      referenceDate,
    );
    expect(liveStatus.isLive).toBe(true);
    expect(liveStatus.isEnded).toBe(false);

    // 2. Draft event
    const draftStatus = computeEventStatus(
      {
        publicationStatus: "DRAFT",
        startsAt: "2026-09-20T00:00:00Z",
        endsAt: "2026-09-30T00:00:00Z",
      },
      referenceDate,
    );
    expect(draftStatus.isLive).toBe(false);
    expect(draftStatus.isEnded).toBe(false);

    // 3. Past / Ended event
    const endedStatus = computeEventStatus(
      {
        publicationStatus: "PUBLISHED",
        startsAt: "2026-08-01T00:00:00Z",
        endsAt: "2026-08-15T00:00:00Z",
      },
      referenceDate,
    );
    expect(endedStatus.isLive).toBe(false);
    expect(endedStatus.isEnded).toBe(true);
  });

  it("aggregates total events, candidates, and votes", () => {
    const mockEvents: OrganizerEventItemDto[] = [
      {
        id: "1",
        slug: "event-1",
        title: "Event One",
        description: "Desc",
        bannerUrl: "",
        startsAt: "2026-09-20T00:00:00Z",
        endsAt: "2026-09-30T00:00:00Z",
        publicationStatus: "PUBLISHED",
        isLive: true,
        isEnded: false,
        contestantsCount: 15,
        votesCount: 300,
        createdAt: "2026-09-19T00:00:00Z",
      },
      {
        id: "2",
        slug: "event-2",
        title: "Event Two",
        description: "Desc",
        bannerUrl: "",
        startsAt: "2026-10-01T00:00:00Z",
        endsAt: "2026-10-10T00:00:00Z",
        publicationStatus: "DRAFT",
        isLive: false,
        isEnded: false,
        contestantsCount: 5,
        votesCount: 0,
        createdAt: "2026-09-25T00:00:00Z",
      },
      {
        id: "3",
        slug: "event-3",
        title: "Event Three",
        description: "Desc",
        bannerUrl: "",
        startsAt: "2026-08-01T00:00:00Z",
        endsAt: "2026-08-10T00:00:00Z",
        publicationStatus: "ARCHIVED",
        isLive: false,
        isEnded: true,
        contestantsCount: 20,
        votesCount: 1200,
        createdAt: "2026-07-20T00:00:00Z",
      },
    ];

    const metrics = computeDashboardMetrics(mockEvents);
    expect(metrics.totalEvents).toBe(3);
    expect(metrics.liveEvents).toBe(1);
    expect(metrics.totalCandidates).toBe(40);
    expect(metrics.totalVotesCast).toBe(1500);
  });
});

describe("Event Filtering and Pagination", () => {
  const sampleEvents: OrganizerEventItemDto[] = Array.from({ length: 25 }, (_, i) => ({
    id: `ev-${i + 1}`,
    slug: `pageant-${i + 1}`,
    title: i % 2 === 0 ? `National Pageant ${i + 1}` : `Talent Quest ${i + 1}`,
    description: `Description for event ${i + 1}`,
    bannerUrl: "",
    startsAt: "2026-09-20T00:00:00Z",
    endsAt: "2026-09-30T00:00:00Z",
    publicationStatus: i % 3 === 0 ? "PUBLISHED" : i % 3 === 1 ? "DRAFT" : "ARCHIVED",
    isLive: i % 3 === 0,
    isEnded: i % 3 === 2,
    contestantsCount: 10,
    votesCount: 100,
    createdAt: "2026-09-01T00:00:00Z",
  }));

  it("filters by keyword search (case-insensitive across title and slug)", () => {
    const result = filterAndPaginateEvents(sampleEvents, { q: "talent", status: "ALL" });
    expect(result.totalFiltered).toBe(12);
    expect(result.items.every((e) => e.title.includes("Talent"))).toBe(true);
  });

  it("filters by status", () => {
    const liveResult = filterAndPaginateEvents(sampleEvents, { status: "PUBLISHED" });
    expect(liveResult.items.every((e) => e.isLive)).toBe(true);

    const draftResult = filterAndPaginateEvents(sampleEvents, { status: "DRAFT" });
    expect(draftResult.items.every((e) => e.publicationStatus === "DRAFT")).toBe(true);
  });

  it("paginates properly with 12 items per page", () => {
    const page1 = filterAndPaginateEvents(sampleEvents, { page: 1, limit: 12 });
    expect(page1.items.length).toBe(12);
    expect(page1.totalPages).toBe(3);
    expect(page1.currentPage).toBe(1);

    const page2 = filterAndPaginateEvents(sampleEvents, { page: 2, limit: 12 });
    expect(page2.items.length).toBe(12);
    expect(page2.currentPage).toBe(2);

    const page3 = filterAndPaginateEvents(sampleEvents, { page: 3, limit: 12 });
    expect(page3.items.length).toBe(1);
    expect(page3.currentPage).toBe(3);
  });
});
