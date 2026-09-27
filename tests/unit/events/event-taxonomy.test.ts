import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/events/[slug]/categories/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { Event, Division, AwardCategory } from "@/generated/client/client";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    division: {
      findMany: vi.fn(),
    },
    awardCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/events/[slug]/categories (Unified Taxonomy)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when event is not found", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/events/non-existent/categories");
    const res = await GET(req, { params: Promise.resolve({ slug: "non-existent" }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it("returns both divisions and award categories grouped together", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({ id: "evt-123" } as unknown as Event);
    vi.mocked(db.division.findMany).mockResolvedValue([
      {
        id: "div-1",
        eventId: "evt-123",
        name: "Miss",
        description: null,
        displayOrder: 1,
        createdAt: new Date("2026-09-27T10:00:00Z"),
        updatedAt: new Date("2026-09-27T10:00:00Z"),
        _count: { contestants: 3 },
      },
    ] as unknown as (Division & { _count: { contestants: number } })[]);

    vi.mocked(db.awardCategory.findMany).mockResolvedValue([
      {
        id: "cat-1",
        eventId: "evt-123",
        name: "People's Choice",
        description: null,
        isVotingOpen: true,
        displayOrder: 1,
        createdAt: new Date("2026-09-27T10:00:00Z"),
        updatedAt: new Date("2026-09-27T10:00:00Z"),
        _count: { contestants: 3 },
      },
    ] as unknown as (AwardCategory & { _count: { contestants: number } })[]);

    const req = new NextRequest("http://localhost/api/events/my-event/categories");
    const res = await GET(req, { params: Promise.resolve({ slug: "my-event" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.divisions).toHaveLength(1);
    expect(json.data.divisions[0].name).toBe("Miss");
    expect(json.data.awardCategories).toHaveLength(1);
    expect(json.data.awardCategories[0].name).toBe("People's Choice");
  });
});
