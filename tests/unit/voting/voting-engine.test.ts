import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  isZeroCostElection,
  hasVoterSubmittedBallot,
  castInstitutionalBallot,
} from "@/features/voting/services/voting-engine";
import * as rateLimiter from "@/features/voting/utils/rate-limiter";
import * as turnstile from "@/features/voting/utils/turnstile";

// Mock dependencies
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
    },
    voterParticipation: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    ballotSubmission: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    vote: {
      createMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/features/voting/utils/rate-limiter", () => ({
  checkIpVelocity: vi.fn(),
  checkDeviceAccountLimit: vi.fn(),
}));

vi.mock("@/features/voting/utils/turnstile", () => ({
  verifyTurnstileToken: vi.fn(),
}));

describe("voting-engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.voterParticipation.findUnique).mockResolvedValue(null);
    vi.mocked(rateLimiter.checkIpVelocity).mockReturnValue({ allowed: true, error: null });
    vi.mocked(rateLimiter.checkDeviceAccountLimit).mockReturnValue({ allowed: true, error: null });
    vi.mocked(turnstile.verifyTurnstileToken).mockResolvedValue({ success: true, error: null });
  });

  describe("isZeroCostElection", () => {
    it("returns true when isFreeVotingOnly is true regardless of archetype", () => {
      expect(isZeroCostElection({ isFreeVotingOnly: true, archetype: "PAGEANT" })).toBe(true);
      expect(isZeroCostElection({ isFreeVotingOnly: true, archetype: "CUSTOM" })).toBe(true);
    });

    it("returns true for STUDENT_COUNCIL or HACKATHON archetype even if isFreeVotingOnly is false", () => {
      expect(isZeroCostElection({ isFreeVotingOnly: false, archetype: "STUDENT_COUNCIL" })).toBe(true);
      expect(isZeroCostElection({ isFreeVotingOnly: false, archetype: "HACKATHON" })).toBe(true);
    });

    it("returns false for PAGEANT or CUSTOM when isFreeVotingOnly is false", () => {
      expect(isZeroCostElection({ isFreeVotingOnly: false, archetype: "PAGEANT" })).toBe(false);
      expect(isZeroCostElection({ isFreeVotingOnly: false, archetype: "CUSTOM" })).toBe(false);
    });
  });

  describe("hasVoterSubmittedBallot", () => {
    it("returns true when a BallotSubmission record exists", async () => {
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce({
        id: "sub-1",
        eventId: "event-1",
        voterId: "voter-1",
        createdAt: new Date(),
      } as any);

      const result = await hasVoterSubmittedBallot("event-1", "voter-1");
      expect(result).toBe(true);
      expect(db.ballotSubmission.findUnique).toHaveBeenCalledWith({
        where: {
          eventId_voterId: {
            eventId: "event-1",
            voterId: "voter-1",
          },
        },
      });
    });

    it("returns false when no BallotSubmission record exists", async () => {
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce(null);
      const result = await hasVoterSubmittedBallot("event-1", "voter-1");
      expect(result).toBe(false);
    });
  });

  describe("castInstitutionalBallot", () => {
    const validEventId = "11111111-1111-4111-8111-111111111111";
    const validVoterId = "22222222-2222-4222-8222-222222222222";
    const validPositionId = "33333333-3333-4333-8333-333333333333";
    const validContestantId = "44444444-4444-4444-8444-444444444444";

    const mockEvent = {
      id: validEventId,
      publicationStatus: "PUBLISHED",
      startsAt: new Date(Date.now() - 3600000), // 1 hour ago
      endsAt: new Date(Date.now() + 3600000), // 1 hour from now
      isFreeVotingOnly: true,
      archetype: "STUDENT_COUNCIL" as const,
      isFreeVotingEnabled: true,
    };

    const mockPosition = {
      id: validPositionId,
      eventId: validEventId,
      name: "President",
      minSelectionsPerVoter: 1,
      maxSelectionsPerVoter: 1,
      isVotingOpen: true,
      displayOrder: 0,
    };

    const mockContestant = {
      id: validContestantId,
      eventId: validEventId,
      positionId: validPositionId,
      status: "ACTIVE",
      name: "Alice Candidate",
      voteCount: 10,
    };

    it("returns NOT_AUTHENTICATED if voterId is empty", async () => {
      const response = await castInstitutionalBallot({
        voterId: "",
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("NOT_AUTHENTICATED");
      }
    });

    it("returns EVENT_NOT_ACTIVE if event is not published or outside schedule", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        ...mockEvent,
        publicationStatus: "DRAFT",
      } as any);

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("EVENT_NOT_ACTIVE");
      }
    });

    it("returns BALLOT_ALREADY_SUBMITTED with 409 status if voter already submitted ballot", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(mockEvent as any);
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce({
        id: "existing-sub",
        eventId: validEventId,
        voterId: validVoterId,
        createdAt: new Date(),
      } as any);

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("BALLOT_ALREADY_SUBMITTED");
        expect(response.error.message).toBe("Ballot already submitted for this election.");
      }
    });

    it("rejects when position selection limits are violated (too few selections)", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(mockEvent as any);
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.eventPosition.findMany).mockResolvedValueOnce([
        { ...mockPosition, minSelectionsPerVoter: 2, maxSelectionsPerVoter: 3 },
      ] as any);

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("POSITION_SELECTION_LIMIT_VIOLATION");
      }
    });

    it("rejects when position selection limits are violated (too many selections)", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(mockEvent as any);
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.eventPosition.findMany).mockResolvedValueOnce([
        { ...mockPosition, minSelectionsPerVoter: 1, maxSelectionsPerVoter: 1 },
      ] as any);

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [
          {
            positionId: validPositionId,
            contestantIds: [validContestantId, "55555555-5555-4555-8555-555555555555"],
          },
        ],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("POSITION_SELECTION_LIMIT_VIOLATION");
      }
    });

    it("rejects when a selected contestant is inactive or not found", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(mockEvent as any);
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.eventPosition.findMany).mockResolvedValueOnce([mockPosition] as any);
      vi.mocked(db.contestant.findMany).mockResolvedValueOnce([]); // No contestant found

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("CONTESTANT_NOT_ELIGIBLE");
      }
    });

    it("successfully casts ballot atomically without calling payment rails (Happy Path)", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(mockEvent as any);
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.eventPosition.findMany).mockResolvedValueOnce([mockPosition] as any);
      vi.mocked(db.contestant.findMany).mockResolvedValueOnce([mockContestant] as any);

      const createdBallotId = "ballot-sub-999";
      vi.mocked(db.$transaction).mockImplementationOnce(async (callback: any) => {
        const tx = {
          ballotSubmission: {
            create: vi.fn().mockResolvedValue({ id: createdBallotId, eventId: validEventId, voterId: validVoterId }),
          },
          vote: {
            create: vi.fn().mockResolvedValue({ id: "vote-123", contestantId: validContestantId, positionId: validPositionId }),
          },
          contestant: {
            update: vi.fn().mockResolvedValue({ id: validContestantId, voteCount: 11 }),
          },
        };
        return callback(tx);
      });

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.ballotId).toBe(createdBallotId);
        expect(response.data.votesCount).toBe(1);
        expect(response.data.votes[0]?.contestantId).toBe(validContestantId);
      }
    });

    it("handles concurrent double-vote race conditions gracefully (Prisma P2002 unique constraint)", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce(mockEvent as any);
      vi.mocked(db.ballotSubmission.findUnique).mockResolvedValueOnce(null); // Passed initial check
      vi.mocked(db.eventPosition.findMany).mockResolvedValueOnce([mockPosition] as any);
      vi.mocked(db.contestant.findMany).mockResolvedValueOnce([mockContestant] as any);

      // Simulate concurrent transaction throwing P2002 on BallotSubmission creation
      const prismaUniqueError: any = new Error("Unique constraint failed on the fields: (`eventId`,`voterId`)");
      prismaUniqueError.code = "P2002";
      prismaUniqueError.meta = { target: ["eventId", "voterId"] };

      vi.mocked(db.$transaction).mockRejectedValueOnce(prismaUniqueError);

      const response = await castInstitutionalBallot({
        voterId: validVoterId,
        eventId: validEventId,
        selections: [{ positionId: validPositionId, contestantIds: [validContestantId] }],
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe("BALLOT_ALREADY_SUBMITTED");
        expect(response.error.message).toBe("Ballot already submitted for this election.");
      }
    });
  });
});
