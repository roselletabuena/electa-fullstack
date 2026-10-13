import { describe, it, expect, vi, beforeEach } from "vitest";
import { castBallotAction } from "@/features/voting/actions/cast-ballot";
import * as getSessionModule from "@/lib/auth/get-session";
import * as votingEngineModule from "@/features/voting/services/voting-engine";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === "cf-connecting-ip") return "198.51.100.1";
      if (name === "x-forwarded-for") return "198.51.100.1, 10.0.0.1";
      return null;
    }),
  }),
}));

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/features/voting/services/voting-engine", () => ({
  castInstitutionalBallot: vi.fn(),
}));

describe("castBallotAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    eventId: "11111111-1111-4111-8111-111111111111",
    selections: [
      {
        positionId: "22222222-2222-4222-8222-222222222222",
        contestantIds: ["33333333-3333-4333-8333-333333333333"],
      },
    ],
  };

  it("returns NOT_AUTHENTICATED if session has no user", async () => {
    vi.mocked(getSessionModule.getSession).mockResolvedValueOnce(null);

    const result = await castBallotAction(validPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NOT_AUTHENTICATED");
    }
    expect(votingEngineModule.castInstitutionalBallot).not.toHaveBeenCalled();
  });

  it("returns INVALID_BALLOT_SELECTIONS if payload fails schema validation", async () => {
    vi.mocked(getSessionModule.getSession).mockResolvedValueOnce({
      userId: "user-123",
      email: "voter@school.edu",
    } as any);

    const invalidPayload = {
      eventId: "not-a-uuid",
      selections: [],
    };

    const result = await castBallotAction(invalidPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_BALLOT_SELECTIONS");
    }
    expect(votingEngineModule.castInstitutionalBallot).not.toHaveBeenCalled();
  });

  it("delegates to castInstitutionalBallot with voterId and clientIp when session is valid", async () => {
    vi.mocked(getSessionModule.getSession).mockResolvedValueOnce({
      userId: "user-abc-456",
      email: "student@school.edu",
    } as any);

    vi.mocked(votingEngineModule.castInstitutionalBallot).mockResolvedValueOnce({
      success: true,
      data: {
        success: true,
        ballotId: "ballot-789",
        eventId: validPayload.eventId,
        voterId: "user-abc-456",
        votesCount: 1,
        votes: [
          {
            voteId: "vote-1",
            contestantId: "33333333-3333-4333-8333-333333333333",
            positionId: "22222222-2222-4222-8222-222222222222",
          },
        ],
        submittedAt: new Date().toISOString(),
      },
      error: null,
    });

    const result = await castBallotAction(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ballotId).toBe("ballot-789");
    }
    expect(votingEngineModule.castInstitutionalBallot).toHaveBeenCalledWith(
      expect.objectContaining({
        voterId: "user-abc-456",
        clientIp: "198.51.100.1",
        eventId: validPayload.eventId,
      }),
    );
  });

  it("catches unhandled exceptions and returns INTERNAL_ERROR", async () => {
    vi.mocked(getSessionModule.getSession).mockRejectedValueOnce(
      new Error("Database connection dropped"),
    );

    const result = await castBallotAction(validPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INTERNAL_ERROR");
      expect(result.error.message).toContain("Database connection dropped");
    }
  });
});
