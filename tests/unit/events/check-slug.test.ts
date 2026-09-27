import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/events/check-slug/route";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import type { Event } from "@/generated/client/client";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findFirst: vi.fn(),
    },
  },
}));

describe("GET /api/events/check-slug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when slug query param is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/events/check-slug");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  it("returns 200 with available: false when slug is in RESERVED_SLUGS", async () => {
    const req = new NextRequest("http://localhost:3000/api/events/check-slug?slug=dashboard");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(false);
    expect(json.data.slug).toBe("dashboard");
    expect(json.data.reason).toBe("RESERVED");
  });

  it("returns 200 with available: false when slug already exists in database (case-insensitive)", async () => {
    vi.mocked(db.event.findFirst).mockResolvedValue({ id: "event_1" } as unknown as Event);

    const req = new NextRequest("http://localhost:3000/api/events/check-slug?slug=MUPH-2026");
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(false);
    expect(json.data.slug).toBe("muph-2026");
    expect(db.event.findFirst).toHaveBeenCalledWith({
      where: {
        slug: {
          equals: "muph-2026",
          mode: "insensitive",
        },
      },
      select: { id: true },
    });
  });

  it("returns 200 with available: true when slug is valid, non-reserved, and unused", async () => {
    vi.mocked(db.event.findFirst).mockResolvedValue(null);

    const req = new NextRequest(
      "http://localhost:3000/api/events/check-slug?slug=summer-gala-2026",
    );
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.available).toBe(true);
    expect(json.data.slug).toBe("summer-gala-2026");
  });
});
