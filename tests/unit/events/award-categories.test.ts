import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/events/[slug]/award-categories/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import type { Event, AwardCategory } from "@/generated/client/client";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    awardCategory: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/features/events/utils/ownership-guard", () => ({
  requireEventOwnership: vi.fn(),
}));

describe("GET /api/events/[slug]/award-categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when event is not found", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/events/non-existent/award-categories");
    const res = await GET(req, { params: Promise.resolve({ slug: "non-existent" }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it("returns categories sorted by displayOrder", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({ id: "evt-123" } as unknown as Event);
    vi.mocked(db.awardCategory.findMany).mockResolvedValue([
      {
        id: "cat-1",
        eventId: "evt-123",
        name: "People's Choice",
        description: "Public voting award",
        isVotingOpen: true,
        displayOrder: 1,
        createdAt: new Date("2026-09-27T10:00:00Z"),
        updatedAt: new Date("2026-09-27T10:00:00Z"),
        _count: { contestants: 10 },
      },
    ] as unknown as (AwardCategory & { _count: { contestants: number } })[]);

    const req = new NextRequest("http://localhost/api/events/my-event/award-categories");
    const res = await GET(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data[0].name).toBe("People's Choice");
    expect(json.data[0].isVotingOpen).toBe(true);
    expect(json.data[0].contestantCount).toBe(10);
  });
});

describe("POST /api/events/[slug]/award-categories", () => {
  const mockBaseEvent: Event = {
    id: "evt-123",
    slug: "my-event",
    title: "My Event",
    description: "Description",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: new Date("2026-10-01"),
    endsAt: new Date("2026-10-02"),
    publicationStatus: "PUBLISHED",
    draftPassphraseHash: null,
    showResultsOnClose: true,
    isFreeVotingEnabled: true,
    dailyFreeVoteLimit: 1,
    organizerId: "org-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHENTICATED",
    });

    const req = new NextRequest("http://localhost/api/events/my-event/award-categories", {
      method: "POST",
      body: JSON.stringify({ name: "Best Costume" }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 409 when category with same name exists for event", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.awardCategory.findFirst).mockResolvedValue({
      id: "existing-cat",
      eventId: "evt-123",
      name: "Best Costume",
      description: null,
      isVotingOpen: true,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/award-categories", {
      method: "POST",
      body: JSON.stringify({ name: "Best Costume" }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toContain("already exists");
  });

  it("creates award category successfully and returns 201", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.awardCategory.findFirst).mockResolvedValue(null);
    vi.mocked(db.awardCategory.create).mockResolvedValue({
      id: "cat-new",
      eventId: "evt-123",
      name: "Best Evening Gown",
      description: "Gown craftsmanship",
      isVotingOpen: false,
      displayOrder: 3,
      createdAt: new Date("2026-09-27T12:00:00Z"),
      updatedAt: new Date("2026-09-27T12:00:00Z"),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/award-categories", {
      method: "POST",
      body: JSON.stringify({
        name: "Best Evening Gown",
        description: "Gown craftsmanship",
        isVotingOpen: false,
        displayOrder: 3,
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Best Evening Gown");
    expect(json.data.isVotingOpen).toBe(false);
    expect(json.data.displayOrder).toBe(3);
  });
});
