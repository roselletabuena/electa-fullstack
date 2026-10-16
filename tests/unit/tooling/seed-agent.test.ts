import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enforceSafeEnvironment,
  seedAgentDatabase,
  AGENT_FIXTURE_IDS,
} from "../../../prisma/seed-agent";
import type { PrismaClient } from "@/generated/client/client";

describe("Headless Agent Mock DB Seeder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Environment safety checks", () => {
    it("strictly refuses execution in production environment", () => {
      expect(() => enforceSafeEnvironment("production")).toThrow(
        /Refusing to run agent database seeder in production environment!/,
      );
    });

    it("allows execution in development and test environments", () => {
      expect(() => enforceSafeEnvironment("development")).not.toThrow();
      expect(() => enforceSafeEnvironment("test")).not.toThrow();
    });
  });

  describe("Deterministic seed execution & idempotency", () => {
    function createMockPrisma(): PrismaClient {
      const deleteMany = vi.fn().mockResolvedValue({ count: 1 });

      const mockEventCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          slug: data.slug,
          title: data.title,
          publicationStatus: data.publicationStatus,
        }),
      );

      const mockDivisionCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          name: data.name,
        }),
      );

      const mockPositionCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          name: data.name,
        }),
      );

      const mockCategoryCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          name: data.name,
        }),
      );

      const mockCriterionCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          title: data.title,
          weight: data.weight,
          maxScore: data.maxScore,
        }),
      );

      const mockContestantCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          name: data.name,
          contestantNumber: data.contestantNumber,
          avatarUrl: data.avatarUrl,
          voteCount: data.voteCount,
        }),
      );

      const mockMediaCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
        }),
      );

      const mockCategoryAssignmentCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
        }),
      );

      const mockTxCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          referenceNumber: data.referenceNumber,
          status: data.status,
          amountInPhp: data.amountInPhp,
        }),
      );

      const mockVoteCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          voteType: data.voteType,
          voteWeight: data.voteWeight,
          contestantId: data.contestantId,
          voterId: data.voterId,
        }),
      );

      const mockParticipationCreate = vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: data.id,
          userId: data.userId,
        }),
      );

      return {
        vote: { deleteMany, create: mockVoteCreate },
        paymentTransaction: { deleteMany, create: mockTxCreate },
        voterParticipation: { deleteMany, create: mockParticipationCreate },
        judgeScore: { deleteMany },
        judgeEvaluation: { deleteMany },
        rubricCriterion: { deleteMany, create: mockCriterionCreate },
        contestantCategoryAssignment: { deleteMany, create: mockCategoryAssignmentCreate },
        contestantMedia: { deleteMany, create: mockMediaCreate },
        contestant: { deleteMany, create: mockContestantCreate },
        awardCategory: { deleteMany, create: mockCategoryCreate },
        eventPosition: { deleteMany, create: mockPositionCreate },
        division: { deleteMany, create: mockDivisionCreate },
        event: { deleteMany, create: mockEventCreate },
      } as unknown as PrismaClient;
    }

    it("cleans existing fixtures in reverse dependency order before seeding", async () => {
      const mockPrisma = createMockPrisma();

      await seedAgentDatabase(mockPrisma);

      // Verify clean-up was called across related models
      expect(mockPrisma.vote.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.paymentTransaction.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.voterParticipation.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.contestantCategoryAssignment.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.contestantMedia.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.contestant.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.awardCategory.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.division.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.event.deleteMany).toHaveBeenCalled();
    });

    it("seeds exact known IDs for live event, draft event, and related fixtures", async () => {
      const mockPrisma = createMockPrisma();

      const manifest = await seedAgentDatabase(mockPrisma);

      expect(manifest.events.live.id).toBe(AGENT_FIXTURE_IDS.events.live);
      expect(manifest.events.live.slug).toBe(AGENT_FIXTURE_IDS.slugs.live);
      expect(manifest.events.live.publicationStatus).toBe("PUBLISHED");

      expect(manifest.events.draft.id).toBe(AGENT_FIXTURE_IDS.events.draft);
      expect(manifest.events.draft.slug).toBe(AGENT_FIXTURE_IDS.slugs.draft);
      expect(manifest.events.draft.publicationStatus).toBe("DRAFT");

      // Verify users in manifest
      expect(manifest.users.admin.userId).toBe("usr_admin_mock_01");
      expect(manifest.users.organizer.userId).toBe("usr_organizer_mock_01");
      expect(manifest.users.voter1.userId).toBe("usr_voter_mock_01");
      expect(manifest.users.voter2.userId).toBe("usr_voter_mock_02");

      // Verify contestants
      expect(manifest.events.live.contestants).toHaveLength(2);
      expect(manifest.events.live.contestants[0]?.id).toBe(AGENT_FIXTURE_IDS.contestants.live1);
      expect(manifest.events.draft.contestants).toHaveLength(1);

      // Verify award categories & criteria
      expect(manifest.events.live.awardCategories).toHaveLength(2);
      expect(manifest.events.live.rubricCriteria).toHaveLength(2);

      // Verify transactions and votes
      expect(manifest.events.live.paymentTransactions).toHaveLength(1);
      expect(manifest.events.live.paymentTransactions[0]?.referenceNumber).toBe("REF-AGENT-TX-001");
      expect(manifest.events.live.votes).toHaveLength(2);
    });

    it("runs idempotently without errors on repeated executions", async () => {
      const mockPrisma = createMockPrisma();

      const run1 = await seedAgentDatabase(mockPrisma);
      const run2 = await seedAgentDatabase(mockPrisma);

      expect(run1.events.live.id).toBe(run2.events.live.id);
      expect(run1.events.draft.id).toBe(run2.events.draft.id);
      expect(run1.users.admin.userId).toBe(run2.users.admin.userId);
    });
  });
});
