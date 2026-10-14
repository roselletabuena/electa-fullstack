import { describe, it, expect, vi, beforeEach } from "vitest";
import { castPeoplesChoiceVoteAction } from "@/features/hackathons/actions/cast-peoples-choice-vote";
import * as peoplesChoiceService from "@/features/hackathons/services/peoples-choice-service";
import * as authSession from "@/lib/auth/get-session";
import { cookies } from "next/headers";

vi.mock("@/features/hackathons/services/peoples-choice-service", () => ({
  castPeoplesChoiceVote: vi.fn(),
  getAttendeePeoplesChoiceStatus: vi.fn(),
  getStageLeaderboardData: vi.fn(),
}));

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

describe("castPeoplesChoiceVoteAction", () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as any);
  });

  it("casts vote using authenticated user session ID", async () => {
    vi.mocked(authSession.getSession).mockResolvedValueOnce({
      userId: "usr_user_123",
      email: "attendee@example.com",
    });

    vi.mocked(peoplesChoiceService.castPeoplesChoiceVote).mockResolvedValueOnce({
      success: true,
      data: {
        submissionId: "sub-101",
        totalVotes: 7,
        hasVoted: true,
      },
      error: null,
    });

    const response = await castPeoplesChoiceVoteAction({
      eventId: "evt-hackathon-1",
      submissionId: "sub-101",
    });

    expect(response.success).toBe(true);
    expect(peoplesChoiceService.castPeoplesChoiceVote).toHaveBeenCalledWith(
      expect.objectContaining({
        eventIdOrSlug: "evt-hackathon-1",
        submissionId: "sub-101",
        voterId: "usr_user_123",
      })
    );
  });

  it("casts vote using attendee cookie when unauthenticated", async () => {
    vi.mocked(authSession.getSession).mockResolvedValueOnce(null);
    mockCookieStore.get.mockReturnValueOnce({ value: "attendee-cookie-uuid" });

    vi.mocked(peoplesChoiceService.castPeoplesChoiceVote).mockResolvedValueOnce({
      success: true,
      data: {
        submissionId: "sub-101",
        totalVotes: 3,
        hasVoted: true,
      },
      error: null,
    });

    const response = await castPeoplesChoiceVoteAction({
      eventId: "evt-hackathon-1",
      submissionId: "sub-101",
    });

    expect(response.success).toBe(true);
    expect(peoplesChoiceService.castPeoplesChoiceVote).toHaveBeenCalledWith(
      expect.objectContaining({
        voterId: "attendee-cookie-uuid",
      })
    );
  });

  it("returns validation error when payload is missing required fields", async () => {
    const response = await castPeoplesChoiceVoteAction({
      eventId: "",
      submissionId: "sub-101",
    });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.code).toBe("INTERNAL_ERROR");
      expect(response.error.message).toContain("required");
    }
  });

  it("propagates duplicate vote conflict error from service", async () => {
    vi.mocked(authSession.getSession).mockResolvedValueOnce({
      userId: "usr_user_123",
      email: "attendee@example.com",
    });

    vi.mocked(peoplesChoiceService.castPeoplesChoiceVote).mockResolvedValueOnce({
      success: false,
      data: null,
      error: {
        code: "ALREADY_VOTED",
        message: "You have already cast your People's Choice vote for this hackathon.",
      },
    });

    const response = await castPeoplesChoiceVoteAction({
      eventId: "evt-hackathon-1",
      submissionId: "sub-202",
    });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.code).toBe("ALREADY_VOTED");
      expect(response.error.message).toBe("You have already cast your People's Choice vote for this hackathon.");
    }
  });
});
