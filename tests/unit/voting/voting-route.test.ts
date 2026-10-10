import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/voting/route";
import { castVoteAction } from "@/features/voting/actions/cast-vote";
import { getSession } from "@/lib/auth/get-session";
import type { NextRequest } from "next/server";

vi.mock("@/features/voting/actions/cast-vote");
vi.mock("@/lib/auth/get-session");

describe("API Route: /api/voting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/voting", () => {
    it("returns status and capabilities", async () => {
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const req = {} as NextRequest;
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.service).toBe("Electa Core Voting Engine");
      expect(json.data.authenticated).toBe(false);
    });
  });

  describe("POST /api/voting", () => {
    it("returns 200 on successful vote action", async () => {
      vi.mocked(castVoteAction).mockResolvedValueOnce({
        success: true,
        data: {
          success: true,
          voteId: "vote-123",
          contestantId: "contestant-123",
          newContestantVoteCount: 5,
          voteType: "FREE",
          voteWeight: 1,
        },
        error: null,
      });

      const req = {
        json: async () => ({
          eventId: "00000000-0000-4000-8000-000000000001",
          contestantId: "00000000-0000-4000-8000-000000000002",
        }),
      } as unknown as NextRequest;

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.voteId).toBe("vote-123");
    });

    it("maps BOT_DETECTION_FAILED to 403 Forbidden", async () => {
      vi.mocked(castVoteAction).mockResolvedValueOnce({
        success: false,
        data: null,
        error: {
          code: "BOT_DETECTION_FAILED",
          message: "Turnstile bot check failed",
        },
      });

      const req = {
        json: async () => ({}),
      } as unknown as NextRequest;

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Turnstile bot check failed");
    });

    it("maps RATE_LIMIT_EXCEEDED to 429 Too Many Requests", async () => {
      vi.mocked(castVoteAction).mockResolvedValueOnce({
        success: false,
        data: null,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests",
        },
      });

      const req = {
        json: async () => ({}),
      } as unknown as NextRequest;

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.success).toBe(false);
    });
  });
});
