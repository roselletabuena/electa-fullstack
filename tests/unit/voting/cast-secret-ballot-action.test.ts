import { describe, it, expect, vi, beforeEach } from "vitest";
import { castSecretBallotAction } from "@/features/voting/actions/cast-secret-ballot";
import * as getSessionModule from "@/lib/auth/get-session";
import * as secretBallotModule from "@/features/voting/services/secret-ballot-service";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === "cf-connecting-ip") return "198.51.100.42";
      if (name === "x-forwarded-for") return "198.51.100.42, 10.0.0.1";
      return null;
    }),
  }),
}));

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/features/voting/services/secret-ballot-service", () => ({
  castSecretBallot: vi.fn(),
}));

describe("castSecretBallotAction", () => {
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

  it("returns NOT_AUTHENTICATED if voter session does not exist", async () => {
    vi.mocked(getSessionModule.getSession).mockResolvedValueOnce(null);

    const result = await castSecretBallotAction(validPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NOT_AUTHENTICATED");
    }
    expect(secretBallotModule.castSecretBallot).not.toHaveBeenCalled();
  });

  it("returns INVALID_BALLOT_SELECTIONS if payload is malformed", async () => {
    vi.mocked(getSessionModule.getSession).mockResolvedValueOnce({
      userId: "student-user-456",
      email: "voter@school.edu",
    } as never);

    const invalidPayload = {
      eventId: "not-a-valid-uuid",
      selections: [],
    };

    const result = await castSecretBallotAction(invalidPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_BALLOT_SELECTIONS");
    }
    expect(secretBallotModule.castSecretBallot).not.toHaveBeenCalled();
  });

  it("delegates to castSecretBallot with userId and clientIp when session is valid", async () => {
    vi.mocked(getSessionModule.getSession).mockResolvedValueOnce({
      userId: "student-user-456",
      email: "voter@school.edu",
    } as never);

    vi.mocked(secretBallotModule.castSecretBallot).mockResolvedValueOnce({
      success: true,
      data: {
        success: true,
        receiptHash: "a".repeat(64),
        receiptToken: "VOTE-AAAA-AAAA-AAAA-AAAA",
        eventId: validPayload.eventId,
        votesCount: 1,
        submittedAt: new Date().toISOString(),
      },
      error: null,
    });

    const result = await castSecretBallotAction(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.receiptToken).toBe("VOTE-AAAA-AAAA-AAAA-AAAA");
      expect(result.data.receiptHash).toBe("a".repeat(64));
    }

    expect(secretBallotModule.castSecretBallot).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "student-user-456",
        clientIp: "198.51.100.42",
        eventId: validPayload.eventId,
      }),
    );
  });

  it("handles unexpected server action exceptions safely", async () => {
    vi.mocked(getSessionModule.getSession).mockRejectedValueOnce(
      new Error("Unexpected session provider timeout"),
    );

    const result = await castSecretBallotAction(validPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INTERNAL_ERROR");
      expect(result.error.message).toContain("Unexpected session provider timeout");
    }
  });
});
