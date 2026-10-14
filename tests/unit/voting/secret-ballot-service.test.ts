import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  castSecretBallot,
  hasVoterParticipated,
} from "@/features/voting/services/secret-ballot-service";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    eventPosition: {
      findMany: vi.fn(),
    },
    contestant: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    voterParticipation: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    ballotSelection: {
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/features/voting/utils/rate-limiter", () => ({
  checkIpVelocity: vi.fn().mockReturnValue({ allowed: true }),
  checkDeviceAccountLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("@/features/voting/utils/turnstile", () => ({
  verifyTurnstileToken: vi.fn().mockResolvedValue({ success: true }),
}));

describe("Secret Ballot Service (Cryptographic Decoupling Engine)", () => {
  const eventId = "11111111-1111-4111-8111-111111111111";
  const userId = "student-voter-user-id";
  const positionId = "22222222-2222-4222-8222-222222222222";
  const candidateId = "33333333-3333-4333-8333-333333333333";

  const activeEventMock = {
    id: eventId,
    publicationStatus: "PUBLISHED",
    startsAt: new Date(Date.now() - 3600000),
    endsAt: new Date(Date.now() + 3600000),
    positions: [
      {
        id: positionId,
        name: "President",
        isVotingOpen: true,
        minSelectionsPerVoter: 1,
        maxSelectionsPerVoter: 1,
      },
    ],
    contestants: [
      {
        id: candidateId,
        status: "ACTIVE",
        positionId,
      },
    ],
  };

  const validSelections = [
    {
      positionId,
      contestantIds: [candidateId],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValue(null);
  });

  it("checks whether a voter has already participated", async () => {
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValueOnce({
      id: "part-1",
      eventId,
      userId,
      votedAt: new Date(),
    });

    const participated = await hasVoterParticipated(eventId, userId);
    expect(participated).toBe(true);
    expect(db.voterParticipation.findUnique).toHaveBeenCalledWith({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
  });

  it("processes secret ballot submission with strict cryptographic decoupling", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce(activeEventMock as never);
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValueOnce(null);

    const mockTx = {
      voterParticipation: {
        create: vi.fn().mockResolvedValueOnce({
          id: "part-123",
          eventId,
          userId,
          votedAt: new Date(),
        }),
      },
      ballotSelection: {
        createMany: vi.fn().mockResolvedValueOnce({ count: 1 }),
      },
      contestant: {
        update: vi.fn().mockResolvedValueOnce({ id: candidateId, voteCount: 1 }),
      },
    };

    vi.mocked(db.$transaction).mockImplementationOnce(async (callback) => {
      return await callback(mockTx as never);
    });

    const result = await castSecretBallot({
      eventId,
      userId,
      selections: validSelections,
      clientIp: "127.0.0.1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.receiptHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.data.receiptToken).toMatch(/^VOTE-/);
      expect(result.data.votesCount).toBe(1);
    }

    // Verify VoterParticipation record was created with userId
    expect(mockTx.voterParticipation.create).toHaveBeenCalledWith({
      data: {
        eventId,
        userId,
      },
    });

    // CRITICAL DECOUPLING VERIFICATION:
    // Verify BallotSelection was created without any voter or user identifier
    expect(mockTx.ballotSelection.createMany).toHaveBeenCalledTimes(1);
    const createManyArg = mockTx.ballotSelection.createMany.mock.calls[0]?.[0];
    const createdRecords = createManyArg?.data as Array<Record<string, unknown>>;
    expect(createdRecords).toBeDefined();
    expect(createdRecords.length).toBe(1);

    const selectionRecord = createdRecords[0];
    expect(selectionRecord?.eventId).toBe(eventId);
    expect(selectionRecord?.officeId).toBe(positionId);
    expect(selectionRecord?.candidateId).toBe(candidateId);
    expect(selectionRecord?.receiptHash).toBeDefined();

    // STRICT ZERO-LEAKAGE ASSERTION:
    expect(selectionRecord).not.toHaveProperty("userId");
    expect(selectionRecord).not.toHaveProperty("voterId");
    expect(selectionRecord).not.toHaveProperty("user");
    expect(selectionRecord).not.toHaveProperty("clientIp");

    // Verify candidate tally increment
    expect(mockTx.contestant.update).toHaveBeenCalledWith({
      where: { id: candidateId },
      data: { voteCount: { increment: 1 } },
    });
  });

  it("prevents double-voting if voter participation is already recorded", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce(activeEventMock as never);
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValueOnce({
      id: "existing-part",
      eventId,
      userId,
      votedAt: new Date(),
    });

    const result = await castSecretBallot({
      eventId,
      userId,
      selections: validSelections,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("BALLOT_ALREADY_SUBMITTED");
    }
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("handles race-condition duplicate voting via Prisma P2002 error", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce(activeEventMock as never);
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValueOnce(null);

    const prismaError = new Error("Unique constraint failed on the fields: (`eventId`,`userId`)");
    Object.assign(prismaError, { code: "P2002" });

    vi.mocked(db.$transaction).mockRejectedValueOnce(prismaError);

    const result = await castSecretBallot({
      eventId,
      userId,
      selections: validSelections,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("BALLOT_ALREADY_SUBMITTED");
    }
  });

  it("atomically rolls back and returns TRANSACTION_FAILED on database errors", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce(activeEventMock as never);
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValueOnce(null);

    vi.mocked(db.$transaction).mockRejectedValueOnce(new Error("Connection timeout during insert"));

    const result = await castSecretBallot({
      eventId,
      userId,
      selections: validSelections,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("TRANSACTION_FAILED");
      expect(result.error.message).toContain("Connection timeout during insert");
    }
  });

  it("rejects submission if election is closed", async () => {
    const closedEvent = {
      ...activeEventMock,
      endsAt: new Date(Date.now() - 3600000), // Ended 1 hour ago
    };
    vi.mocked(db.event.findUnique).mockResolvedValueOnce(closedEvent as never);

    const result = await castSecretBallot({
      eventId,
      userId,
      selections: validSelections,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("EVENT_NOT_ACTIVE");
    }
  });

  it("rejects submission exceeding position selection limits", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValueOnce(activeEventMock as never);

    const invalidSelections = [
      {
        positionId,
        contestantIds: [candidateId, "44444444-4444-4444-8444-444444444444"], // Max is 1
      },
    ];

    const result = await castSecretBallot({
      eventId,
      userId,
      selections: invalidSelections,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("POSITION_SELECTION_LIMIT_VIOLATION");
    }
  });
});
