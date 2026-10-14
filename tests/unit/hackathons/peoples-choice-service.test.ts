import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { EventArchetype, EventPublicationStatus, Prisma } from "@/generated/client/client";
import {
  castPeoplesChoiceVote,
  getAttendeePeoplesChoiceStatus,
  getStageLeaderboardData,
} from "@/features/hackathons/services/peoples-choice-service";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    projectSubmission: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    projectVote: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("peoples-choice-service", () => {
  const mockNow = new Date("2026-10-15T10:00:00Z");

  const mockActiveEvent = {
    id: "evt-hackathon-1",
    slug: "hack-surge-2026",
    title: "HackSurge 2026",
    archetype: EventArchetype.HACKATHON,
    publicationStatus: EventPublicationStatus.PUBLISHED,
    startsAt: new Date("2026-10-14T00:00:00Z"),
    endsAt: new Date("2026-10-16T23:59:59Z"),
    positions: [{ id: "pos-1", name: "AI & Agents" }],
  };

  const mockSubmission = {
    id: "sub-101",
    eventId: "evt-hackathon-1",
    title: "NeuroPulse AI",
    tagline: "Brainwave-powered IDE",
    description: "Real-time EEG agent assistant.",
    repositoryUrl: "https://github.com/neuropulse/ide",
    demoUrl: "https://neuropulse.live",
    videoUrl: null,
    status: "ACCEPTED",
    voteCount: 5,
    members: [{ name: "Sarah Connor" }],
    trackTags: [{ trackName: "AI & Agents" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("castPeoplesChoiceVote", () => {
    it("successfully casts a vote, increments vote count, and returns result", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(mockActiveEvent as unknown as any);
      vi.mocked(db.projectSubmission.findUnique).mockResolvedValueOnce(mockSubmission as unknown as any);

      vi.mocked(db.$transaction).mockImplementation(async (callback) => {
        return callback({
          projectVote: {
            create: vi.fn().mockResolvedValueOnce({
              id: "vote-1",
              eventId: "evt-hackathon-1",
              submissionId: "sub-101",
              voterId: "voter-abc",
            }),
          },
          projectSubmission: {
            update: vi.fn().mockResolvedValueOnce({
              ...mockSubmission,
              voteCount: 6,
            }),
          },
        } as unknown as any);
      });

      const result = await castPeoplesChoiceVote({
        eventIdOrSlug: "hack-surge-2026",
        submissionId: "sub-101",
        voterId: "voter-abc",
        now: mockNow,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.submissionId).toBe("sub-101");
        expect(result.data.totalVotes).toBe(6);
        expect(result.data.hasVoted).toBe(true);
      }
    });

    it("rejects duplicate votes with standard conflict error message (Scenario 2)", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(mockActiveEvent as unknown as any);
      vi.mocked(db.projectSubmission.findUnique).mockResolvedValueOnce(mockSubmission as unknown as any);

      const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint violation", {
        code: "P2002",
        clientVersion: "7.9.1",
      });

      vi.mocked(db.$transaction).mockRejectedValueOnce(prismaError);

      const result = await castPeoplesChoiceVote({
        eventIdOrSlug: "hack-surge-2026",
        submissionId: "sub-101",
        voterId: "voter-abc",
        now: mockNow,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("ALREADY_VOTED");
        expect(result.error.message).toBe("You have already cast your People's Choice vote for this hackathon.");
      }
    });

    it("rejects voting when event does not exist", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(null);

      const result = await castPeoplesChoiceVote({
        eventIdOrSlug: "non-existent-event",
        submissionId: "sub-101",
        voterId: "voter-abc",
        now: mockNow,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("EVENT_NOT_ACTIVE");
      }
    });

    it("rejects voting when event is not a hackathon", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce({
        ...mockActiveEvent,
        archetype: EventArchetype.PAGEANT,
      } as unknown as any);

      const result = await castPeoplesChoiceVote({
        eventIdOrSlug: "pageant-event",
        submissionId: "sub-101",
        voterId: "voter-abc",
        now: mockNow,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("EVENT_NOT_ACTIVE");
        expect(result.error.message).toContain("Hackathon");
      }
    });

    it("rejects voting when submission does not exist", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(mockActiveEvent as unknown as any);
      vi.mocked(db.projectSubmission.findUnique).mockResolvedValueOnce(null);

      const result = await castPeoplesChoiceVote({
        eventIdOrSlug: "hack-surge-2026",
        submissionId: "sub-missing",
        voterId: "voter-abc",
        now: mockNow,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("SUBMISSION_NOT_FOUND");
      }
    });
  });

  describe("getAttendeePeoplesChoiceStatus", () => {
    it("returns hasVoted: false and remainingCredits: 1 when attendee has not voted", async () => {
      vi.mocked(db.projectVote.findUnique).mockResolvedValueOnce(null);

      const status = await getAttendeePeoplesChoiceStatus("evt-hackathon-1", "voter-new");
      expect(status.hasVoted).toBe(false);
      expect(status.remainingCredits).toBe(1);
      expect(status.votedSubmissionId).toBeNull();
    });

    it("returns hasVoted: true and remainingCredits: 0 when attendee has voted", async () => {
      vi.mocked(db.projectVote.findUnique).mockResolvedValueOnce({
        id: "v-1",
        eventId: "evt-hackathon-1",
        submissionId: "sub-101",
        voterId: "voter-voted",
        createdAt: new Date(),
      });

      const status = await getAttendeePeoplesChoiceStatus("evt-hackathon-1", "voter-voted");
      expect(status.hasVoted).toBe(true);
      expect(status.remainingCredits).toBe(0);
      expect(status.votedSubmissionId).toBe("sub-101");
    });
  });

  describe("getStageLeaderboardData", () => {
    it("calculates accurate ranks, total votes, and percentage shares sorted descending", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValueOnce(mockActiveEvent as unknown as any);

      const mockSubmissionsList = [
        {
          id: "sub-1",
          title: "Team Alpha AI",
          tagline: "Alpha product",
          repositoryUrl: "https://github.com/alpha",
          demoUrl: "https://alpha.dev",
          voteCount: 30,
          trackTags: [{ trackName: "AI & Agents" }],
          members: [{ name: "Alice" }],
        },
        {
          id: "sub-2",
          title: "Team Beta Web3",
          tagline: "Beta rollup",
          repositoryUrl: "https://github.com/beta",
          demoUrl: null,
          voteCount: 50,
          trackTags: [{ trackName: "Web3" }],
          members: [{ name: "Bob" }],
        },
        {
          id: "sub-3",
          title: "Team Gamma DevTools",
          tagline: "Gamma tools",
          repositoryUrl: "https://github.com/gamma",
          demoUrl: "https://gamma.dev",
          voteCount: 20,
          trackTags: [{ trackName: "Developer Tooling" }],
          members: [{ name: "Charlie" }],
        },
      ];

      vi.mocked(db.projectSubmission.findMany).mockResolvedValueOnce(mockSubmissionsList as unknown as any);

      const leaderboard = await getStageLeaderboardData("hack-surge-2026");

      expect(leaderboard).not.toBeNull();
      if (leaderboard) {
        expect(leaderboard.totalVotesCast).toBe(100);
        expect(leaderboard.totalProjects).toBe(3);
        // Rank 1: Team Beta with 50 votes (50%)
        expect(leaderboard.topProjects[0]?.id).toBe("sub-2");
        expect(leaderboard.topProjects[0]?.rank).toBe(1);
        expect(leaderboard.topProjects[0]?.votePercentage).toBe(50);
        // Rank 2: Team Alpha with 30 votes (30%)
        expect(leaderboard.topProjects[1]?.id).toBe("sub-1");
        expect(leaderboard.topProjects[1]?.rank).toBe(2);
        expect(leaderboard.topProjects[1]?.votePercentage).toBe(30);
        // Rank 3: Team Gamma with 20 votes (20%)
        expect(leaderboard.topProjects[2]?.id).toBe("sub-3");
        expect(leaderboard.topProjects[2]?.rank).toBe(3);
        expect(leaderboard.topProjects[2]?.votePercentage).toBe(20);
      }
    });
  });
});
