import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/events/[slug]/divisions/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { Prisma, type Event, type Division } from "@/generated/client/client";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    division: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/features/events/utils/ownership-guard", () => ({
  requireEventOwnership: vi.fn(),
}));

describe("GET /api/events/[slug]/divisions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when event is not found", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/events/non-existent/divisions");
    const res = await GET(req, { params: Promise.resolve({ slug: "non-existent" }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Event not found");
  });

  it("returns divisions sorted by displayOrder", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: "evt-123",
      publicationStatus: "PUBLISHED",
      organizerId: "org-1",
    } as unknown as Event);

    vi.mocked(db.division.findMany).mockResolvedValue([
      {
        id: "div-1",
        eventId: "evt-123",
        name: "Teen Division",
        description: "Ages 13-17",
        displayOrder: 1,
        createdAt: new Date("2026-09-27T10:00:00Z"),
        updatedAt: new Date("2026-09-27T10:00:00Z"),
        _count: { contestants: 5 },
      },
    ] as unknown as (Division & { _count: { contestants: number } })[]);

    const req = new NextRequest("http://localhost/api/events/my-event/divisions");
    const res = await GET(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("Teen Division");
    expect(json.data[0].contestantCount).toBe(5);
  });
});

describe("POST /api/events/[slug]/divisions", () => {
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
    takeRatePercentage: new Prisma.Decimal(12.0),
    organizerId: "org-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHENTICATED",
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions", {
      method: "POST",
      body: JSON.stringify({ name: "Adult Division" }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
  });

  it("returns 403 when user does not own the event", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: false,
      reason: "UNAUTHORIZED",
      session: { userId: "org-2", email: "other@example.com", role: "ORGANIZER" },
      eventTitle: "My Event",
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions", {
      method: "POST",
      body: JSON.stringify({ name: "Adult Division" }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.success).toBe(false);
  });

  it("returns 400 when payload is invalid (empty name)", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("returns 409 when division with same name exists for the event", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.division.findFirst).mockResolvedValue({
      id: "existing-div",
      eventId: "evt-123",
      name: "Adult Division",
      description: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions", {
      method: "POST",
      body: JSON.stringify({ name: "Adult Division" }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toContain("already exists");
  });

  it("successfully creates division and returns 201", async () => {
    vi.mocked(requireEventOwnership).mockResolvedValue({
      authorized: true,
      event: mockBaseEvent,
      session: { userId: "org-1", email: "org@example.com", role: "ORGANIZER" },
    });

    vi.mocked(db.division.findFirst).mockResolvedValue(null);
    vi.mocked(db.division.create).mockResolvedValue({
      id: "div-new",
      eventId: "evt-123",
      name: "Miss Teen",
      description: "Teen division",
      displayOrder: 2,
      createdAt: new Date("2026-09-27T12:00:00Z"),
      updatedAt: new Date("2026-09-27T12:00:00Z"),
    });

    const req = new NextRequest("http://localhost/api/events/my-event/divisions", {
      method: "POST",
      body: JSON.stringify({ name: "Miss Teen", description: "Teen division", displayOrder: 2 }),
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Miss Teen");
    expect(json.data.displayOrder).toBe(2);
  });
});
