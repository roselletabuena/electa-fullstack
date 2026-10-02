import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/events/[slug]/vote/route";
import { castVoteAction } from "@/features/voting/actions/cast-vote";
import { getSession } from "@/lib/auth/get-session";
import type { NextRequest } from "next/server";

vi.mock("@/features/voting/actions/cast-vote");
vi.mock("@/lib/auth/get-session");

describe("API Route: /api/events/[slug]/vote", () => {
  const mockContext = {
    params: Promise.resolve({ slug: "miss-universe-ph-2026" }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/events/[slug]/vote", () => {
    it("returns status, slug and authentication state", async () => {
      vi.mocked(getSession).mockResolvedValueOnce({
        userId: "user-abc-123",
        email: "voter@example.com",
        role: "VOTER",
      });

      const req = {} as NextRequest;
      const res = await GET(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.slug).toBe("miss-universe-ph-2026");
      expect(json.data.authenticated).toBe(true);
      expect(json.data.userId).toBe("user-abc-123");
    });
  });

  describe("POST /api/events/[slug]/vote", () => {
    it("returns 200 on successful vote submission", async () => {
      vi.mocked(castVoteAction).mockResolvedValueOnce({
        success: true,
        data: {
          success: true,
          voteId: "vote-456",
          contestantId: "cnt-789",
          newContestantVoteCount: 15,
          voteType: "FREE",
          voteWeight: 1,
        },
        error: null,
      });

      const req = {
        json: async () => ({
          contestantId: "cnt-789",
          turnstileToken: "mock-valid-turnstile-token",
        }),
      } as unknown as NextRequest;

      const res = await POST(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.voteId).toBe("vote-456");
      expect(castVoteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          contestantId: "cnt-789",
          eventSlug: "miss-universe-ph-2026",
          turnstileToken: "mock-valid-turnstile-token",
        }),
      );
    });

    it("maps BOT_DETECTION_FAILED to 403 Forbidden", async () => {
      vi.mocked(castVoteAction).mockResolvedValueOnce({
        success: false,
        data: null,
        error: {
          code: "BOT_DETECTION_FAILED",
          message: "Turnstile bot challenge verification failed.",
        },
      });

      const req = {
        json: async () => ({
          contestantId: "cnt-789",
          turnstileToken: "bad-token",
        }),
      } as unknown as NextRequest;

      const res = await POST(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Turnstile bot challenge verification failed.");
    });

    it("maps RATE_LIMIT_EXCEEDED to 429 Too Many Requests", async () => {
      vi.mocked(castVoteAction).mockResolvedValueOnce({
        success: false,
        data: null,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many voting attempts from this IP.",
        },
      });

      const req = {
        json: async () => ({ contestantId: "cnt-789" }),
      } as unknown as NextRequest;

      const res = await POST(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.success).toBe(false);
    });
  });
});
