import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/search/route";
import { db } from "@/lib/db";
import { searchQuerySchema } from "@/features/search/types";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findMany: vi.fn(),
    },
    contestant: {
      findMany: vi.fn(),
    },
    awardCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe("Search API & Validation Schema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchQuerySchema", () => {
    it("validates a standard search query", () => {
      const parsed = searchQuerySchema.safeParse({ q: "Miss Universe", limit: 5 });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.q).toBe("Miss Universe");
        expect(parsed.data.limit).toBe(5);
      }
    });

    it("rejects empty or whitespace-only queries", () => {
      const parsed = searchQuerySchema.safeParse({ q: "   " });
      expect(parsed.success).toBe(false);
    });

    it("rejects queries exceeding 100 characters", () => {
      const longQuery = "a".repeat(101);
      const parsed = searchQuerySchema.safeParse({ q: longQuery });
      expect(parsed.success).toBe(false);
    });
  });

  describe("GET /api/search route handler", () => {
    it("returns empty results when query parameter is missing or empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/search");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.totalMatches).toBe(0);
      expect(json.data.events).toEqual([]);
    });

    it("returns 400 when query is invalid (e.g. over 100 characters)", async () => {
      const req = new NextRequest(`http://localhost:3000/api/search?q=${"a".repeat(105)}`);
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it("queries database and returns grouped results when valid query is provided", async () => {
      const mockEvents = [
        {
          id: "ev-1",
          title: "Miss Luzon 2026",
          slug: "miss-luzon-2026",
          description: "Regional beauty pageant",
          bannerUrl: "https://example.com/banner.jpg",
          startsAt: new Date("2026-10-01T00:00:00.000Z"),
          endsAt: new Date("2026-10-31T00:00:00.000Z"),
          publicationStatus: "PUBLISHED",
        },
      ];

      const mockContestants = [
        {
          id: "c-1",
          name: "Maria Santos",
          contestantNumber: 5,
          hometown: "Baguio",
          bio: "Student",
          eventId: "ev-1",
          event: {
            id: "ev-1",
            title: "Miss Luzon 2026",
            slug: "miss-luzon-2026",
          },
        },
      ];

      const mockCategories = [
        {
          id: "cat-1",
          name: "Best in Evening Gown",
          description: "Gown category",
          eventId: "ev-1",
          event: {
            id: "ev-1",
            title: "Miss Luzon 2026",
            slug: "miss-luzon-2026",
          },
        },
      ];

      vi.mocked(db.event.findMany).mockResolvedValue(mockEvents as unknown as never);
      vi.mocked(db.contestant.findMany).mockResolvedValue(mockContestants as unknown as never);
      vi.mocked(db.awardCategory.findMany).mockResolvedValue(mockCategories as unknown as never);

      const req = new NextRequest("http://localhost:3000/api/search?q=Maria&limit=5");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.query).toBe("Maria");
      expect(json.data.totalMatches).toBe(3);
      expect(json.data.events).toHaveLength(1);
      expect(json.data.contestants).toHaveLength(1);
      expect(json.data.categories).toHaveLength(1);
    });
  });
});
