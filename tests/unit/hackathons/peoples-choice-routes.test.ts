import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getPeoplesChoice, POST as postPeoplesChoice } from "@/app/api/events/[slug]/peoples-choice/route";
import { GET as getStageLeaderboard } from "@/app/api/events/[slug]/stage-leaderboard/route";
import * as peoplesChoiceService from "@/features/hackathons/services/peoples-choice-service";
import * as castAction from "@/features/hackathons/actions/cast-peoples-choice-vote";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/features/hackathons/services/peoples-choice-service", () => ({
  getAttendeePeoplesChoiceStatus: vi.fn(),
  getStageLeaderboardData: vi.fn(),
}));

vi.mock("@/features/hackathons/actions/cast-peoples-choice-vote", () => ({
  castPeoplesChoiceVoteAction: vi.fn(),
}));

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
  }),
}));

describe("Peoples Choice Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/events/[slug]/peoples-choice", () => {
    it("returns 404 when event is not found", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/events/unknown/peoples-choice");
      const res = await getPeoplesChoice(req, {
        params: Promise.resolve({ slug: "unknown" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns default voting credits when no voter identity is resolved", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({ id: "evt-1" } as any);

      const req = new NextRequest("http://localhost/api/events/hack-1/peoples-choice");
      const res = await getPeoplesChoice(req, {
        params: Promise.resolve({ slug: "hack-1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.remainingCredits).toBe(1);
      expect(json.data.hasVoted).toBe(false);
    });
  });

  describe("POST /api/events/[slug]/peoples-choice", () => {
    it("returns 200 on successful vote submission", async () => {
      vi.mocked(castAction.castPeoplesChoiceVoteAction).mockResolvedValueOnce({
        success: true,
        data: {
          submissionId: "sub-1",
          totalVotes: 10,
          hasVoted: true,
        },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/events/hack-1/peoples-choice", {
        method: "POST",
        body: JSON.stringify({ submissionId: "sub-1" }),
      });

      const res = await postPeoplesChoice(req, {
        params: Promise.resolve({ slug: "hack-1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.totalVotes).toBe(10);
    });

    it("returns 409 conflict when duplicate vote is detected", async () => {
      vi.mocked(castAction.castPeoplesChoiceVoteAction).mockResolvedValueOnce({
        success: false,
        data: null,
        error: {
          code: "ALREADY_VOTED",
          message: "You have already cast your People's Choice vote for this hackathon.",
        },
      });

      const req = new NextRequest("http://localhost/api/events/hack-1/peoples-choice", {
        method: "POST",
        body: JSON.stringify({ submissionId: "sub-2" }),
      });

      const res = await postPeoplesChoice(req, {
        params: Promise.resolve({ slug: "hack-1" }),
      });

      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("already cast");
    });
  });

  describe("GET /api/events/[slug]/stage-leaderboard", () => {
    it("returns 200 with leaderboard data", async () => {
      vi.mocked(peoplesChoiceService.getStageLeaderboardData).mockResolvedValueOnce({
        eventId: "evt-1",
        eventSlug: "hack-1",
        eventTitle: "Hack 1",
        totalVotesCast: 100,
        totalProjects: 2,
        topProjects: [],
        tracks: ["AI"],
      });

      const req = new NextRequest("http://localhost/api/events/hack-1/stage-leaderboard?track=AI");
      const res = await getStageLeaderboard(req, {
        params: Promise.resolve({ slug: "hack-1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.totalVotesCast).toBe(100);
    });

    it("returns 404 when stage data is not found", async () => {
      vi.mocked(peoplesChoiceService.getStageLeaderboardData).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/events/unknown/stage-leaderboard");
      const res = await getStageLeaderboard(req, {
        params: Promise.resolve({ slug: "unknown" }),
      });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });
});
