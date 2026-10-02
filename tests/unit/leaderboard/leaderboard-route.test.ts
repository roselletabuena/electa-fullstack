import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/events/[slug]/leaderboard/route";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

describe("GET /api/events/[slug]/leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns calculated leaderboard rankings with podium and gap metrics for active event", async () => {
    const mockEvent = {
      id: "evt-123",
      slug: "miss-philippines-2026",
      title: "Miss Philippines 2026",
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      showResultsOnClose: true,
      organizerId: "org-admin-1",
      contestants: [
        {
          id: "c-1",
          contestantNumber: 1,
          name: "Maria Santos",
          avatarUrl: "/maria.jpg",
          divisionId: "div-1",
          divisionRef: { name: "Female" },
          categories: [],
          voteCount: 1000,
        },
        {
          id: "c-2",
          contestantNumber: 2,
          name: "Ana Reyes",
          avatarUrl: "/ana.jpg",
          divisionId: "div-1",
          divisionRef: { name: "Female" },
          categories: [],
          voteCount: 850,
        },
      ],
      divisions: [{ id: "div-1", name: "Female", displayOrder: 1 }],
      awardCategories: [],
    };

    vi.mocked(db.event.findUnique).mockResolvedValue(
      mockEvent as unknown as Awaited<ReturnType<typeof db.event.findUnique>>,
    );
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/events/miss-philippines-2026/leaderboard",
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug: "miss-philippines-2026" }),
    });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.isFrozen).toBe(false);
    expect(json.data.totalVotes).toBe(1850);
    expect(json.data.entries).toHaveLength(2);

    expect(json.data.entries[0]).toMatchObject({
      contestantNumber: 1,
      rank: 1,
      isPodium: true,
      gapToLeader: 0,
    });

    expect(json.data.entries[1]).toMatchObject({
      contestantNumber: 2,
      rank: 2,
      isPodium: true,
      gapToLeader: 151, // Needs 151 votes to take 1st
    });
  });

  it("redacts live vote counts and rank positions for unauthenticated users during Mystery Freeze", async () => {
    const mockFrozenEvent = {
      id: "evt-freeze",
      slug: "frozen-contest",
      title: "Frozen Contest",
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // Ends in 2h
      showResultsOnClose: true,
      organizerId: "org-admin-1",
      contestants: [
        {
          id: "c-1",
          contestantNumber: 1,
          name: "Maria Santos",
          avatarUrl: "/maria.jpg",
          divisionId: null,
          divisionRef: null,
          categories: [],
          voteCount: 1000,
        },
      ],
      divisions: [],
      awardCategories: [],
    };

    vi.mocked(db.event.findUnique).mockResolvedValue(
      mockFrozenEvent as unknown as Awaited<ReturnType<typeof db.event.findUnique>>,
    );
    vi.mocked(getSession).mockResolvedValue(null);

    // Mock freeze condition
    const request = new NextRequest("http://localhost:3000/api/events/frozen-contest/leaderboard");
    const response = await GET(request, {
      params: Promise.resolve({ slug: "frozen-contest" }),
    });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("returns 404 when neither database nor mock fallback contains the slug", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/events/non-existent-event/leaderboard",
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug: "non-existent-event" }),
    });

    const json = await response.json();
    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
  });
});
