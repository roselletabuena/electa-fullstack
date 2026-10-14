import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  submitJudgeEvaluation,
  getJudgeEvaluation,
  getProjectAggregateScore,
  getEventLeaderboard,
} from "@/features/hackathons/services/rubric-service";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => {
  const mockDb = {
    event: {
      findUnique: vi.fn(),
    },
    rubricCriterion: {
      findMany: vi.fn(),
    },
    judgeEvaluation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    judgeScore: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { db: mockDb };
});

describe("Rubric Domain Service", () => {
  const eventId = "11111111-1111-4111-a111-111111111111";
  const judgeId = "judge-usr-001";
  const submissionId = "submission-prj-42";
  const criterion1Id = "22222222-2222-4222-a222-222222222221";
  const criterion2Id = "22222222-2222-4222-a222-222222222222";

  const mockCriteria = [
    {
      id: criterion1Id,
      eventId,
      title: "Technical Execution",
      weight: 60,
      maxScore: 10,
      displayOrder: 1,
    },
    {
      id: criterion2Id,
      eventId,
      title: "Design & UX",
      weight: 40,
      maxScore: 10,
      displayOrder: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitJudgeEvaluation", () => {
    it("should successfully submit and compute final scorecard (Scenario 1 Happy Path)", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValue({ id: eventId } as unknown as never);
      vi.mocked(db.rubricCriterion.findMany).mockResolvedValue(mockCriteria as unknown as never);

      const mockEvaluationUpsert = {
        id: "eval-101",
        eventId,
        judgeId,
        submissionId,
        isDraft: false,
        notes: "Solid implementation",
        compositeScore: 8.6,
        updatedAt: new Date("2026-10-14T10:00:00Z"),
      };

      vi.mocked(db.$transaction).mockImplementation(async (callback: unknown) => {
        const tx = {
          judgeEvaluation: {
            upsert: vi.fn().mockResolvedValue(mockEvaluationUpsert),
          },
          judgeScore: {
            deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
            createMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return (callback as (t: typeof tx) => Promise<typeof mockEvaluationUpsert>)(tx);
      });

      const result = await submitJudgeEvaluation({
        eventId,
        judgeId,
        submissionId,
        scores: [
          { criterionId: criterion1Id, score: 9 }, // 9 * 0.6 = 5.4
          { criterionId: criterion2Id, score: 8 }, // 8 * 0.4 = 3.2 -> Total = 8.6
        ],
        notes: "Solid implementation",
        isDraft: false,
      });

      expect(result.compositeScore).toBe(8.6);
      expect(result.isDraft).toBe(false);
      expect(result.scores).toHaveLength(2);
      expect(result.scores[0]?.criterionTitle).toBe("Technical Execution");
    });

    it("should allow partial scores when isDraft is true (Scenario 3 Draft Save)", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValue({ id: eventId } as unknown as never);
      vi.mocked(db.rubricCriterion.findMany).mockResolvedValue(mockCriteria as unknown as never);

      const mockEvaluationUpsert = {
        id: "eval-102",
        eventId,
        judgeId,
        submissionId,
        isDraft: true,
        notes: "Evaluating currently...",
        compositeScore: 9.0,
        updatedAt: new Date("2026-10-14T10:05:00Z"),
      };

      vi.mocked(db.$transaction).mockImplementation(async (callback: unknown) => {
        const tx = {
          judgeEvaluation: {
            upsert: vi.fn().mockResolvedValue(mockEvaluationUpsert),
          },
          judgeScore: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
            createMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return (callback as (t: typeof tx) => Promise<typeof mockEvaluationUpsert>)(tx);
      });

      const result = await submitJudgeEvaluation({
        eventId,
        judgeId,
        submissionId,
        scores: [{ criterionId: criterion1Id, score: 9 }],
        notes: "Evaluating currently...",
        isDraft: true,
      });

      expect(result.isDraft).toBe(true);
      expect(result.compositeScore).toBe(9);
    });

    it("should reject final submission when some criteria are not scored", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValue({ id: eventId } as unknown as never);
      vi.mocked(db.rubricCriterion.findMany).mockResolvedValue(mockCriteria as unknown as never);

      await expect(
        submitJudgeEvaluation({
          eventId,
          judgeId,
          submissionId,
          scores: [{ criterionId: criterion1Id, score: 9 }],
          isDraft: false, // final requires all 2 criteria
        })
      ).rejects.toThrow(/all 2 criteria must be scored/i);
    });

    it("should reject submission referencing unknown criterion ID", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValue({ id: eventId } as unknown as never);
      vi.mocked(db.rubricCriterion.findMany).mockResolvedValue(mockCriteria as unknown as never);

      await expect(
        submitJudgeEvaluation({
          eventId,
          judgeId,
          submissionId,
          scores: [
            { criterionId: "99999999-9999-4999-a999-999999999999", score: 9 },
          ],
          isDraft: true,
        })
      ).rejects.toThrow(/does not belong to event/i);
    });
  });

  describe("getJudgeEvaluation", () => {
    it("should return null when no evaluation exists", async () => {
      vi.mocked(db.judgeEvaluation.findUnique).mockResolvedValue(null);

      const result = await getJudgeEvaluation({ eventId, judgeId, submissionId });
      expect(result).toBeNull();
    });

    it("should return formatted evaluation with detailed scores", async () => {
      vi.mocked(db.judgeEvaluation.findUnique).mockResolvedValue({
        id: "eval-101",
        eventId,
        judgeId,
        submissionId,
        isDraft: false,
        compositeScore: 8.6,
        notes: "Great work",
        updatedAt: new Date("2026-10-14T10:00:00Z"),
        scores: [
          {
            criterionId: criterion1Id,
            score: 9,
            criterion: { title: "Technical Execution", weight: 60 },
          },
        ],
      } as unknown as never);

      const result = await getJudgeEvaluation({ eventId, judgeId, submissionId });
      expect(result).not.toBeNull();
      expect(result?.compositeScore).toBe(8.6);
      expect(result?.scores[0]?.criterionTitle).toBe("Technical Execution");
    });
  });

  describe("getProjectAggregateScore", () => {
    it("should return 0 stats when there are no finalized evaluations", async () => {
      vi.mocked(db.judgeEvaluation.findMany).mockResolvedValue([]);

      const result = await getProjectAggregateScore({ eventId, submissionId });
      expect(result.completedEvaluationsCount).toBe(0);
      expect(result.averageCompositeScore).toBe(0);
      expect(result.criteriaBreakdown).toHaveLength(0);
    });

    it("should compute mean composite score across finalized evaluations", async () => {
      // Judge 1: composite 8.5
      // Judge 2: composite 9.5
      // Average: 9.0
      vi.mocked(db.judgeEvaluation.findMany).mockResolvedValue([
        {
          compositeScore: 8.5,
          scores: [
            {
              criterionId: criterion1Id,
              score: 8,
              criterion: { title: "Technical", weight: 50, maxScore: 10 },
            },
          ],
        },
        {
          compositeScore: 9.5,
          scores: [
            {
              criterionId: criterion1Id,
              score: 10,
              criterion: { title: "Technical", weight: 50, maxScore: 10 },
            },
          ],
        },
      ] as unknown as never);

      const result = await getProjectAggregateScore({ eventId, submissionId });
      expect(result.completedEvaluationsCount).toBe(2);
      expect(result.averageCompositeScore).toBe(9.0);
      expect(result.criteriaBreakdown[0]?.averageScore).toBe(9.0);
    });
  });

  describe("getEventLeaderboard", () => {
    it("should sort projects descending by average composite score and assign ranks", async () => {
      vi.mocked(db.judgeEvaluation.findMany).mockResolvedValue([
        { submissionId: "proj-alpha", compositeScore: 9.2 },
        { submissionId: "proj-alpha", compositeScore: 8.8 }, // avg 9.0
        { submissionId: "proj-beta", compositeScore: 9.5 },
        { submissionId: "proj-beta", compositeScore: 9.7 }, // avg 9.6
        { submissionId: "proj-gamma", compositeScore: 7.4 }, // avg 7.4
      ] as unknown as never);

      const leaderboard = await getEventLeaderboard(eventId);
      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0]?.submissionId).toBe("proj-beta");
      expect(leaderboard[0]?.rank).toBe(1);
      expect(leaderboard[0]?.averageCompositeScore).toBe(9.6);

      expect(leaderboard[1]?.submissionId).toBe("proj-alpha");
      expect(leaderboard[1]?.rank).toBe(2);
      expect(leaderboard[1]?.averageCompositeScore).toBe(9.0);

      expect(leaderboard[2]?.submissionId).toBe("proj-gamma");
      expect(leaderboard[2]?.rank).toBe(3);
      expect(leaderboard[2]?.averageCompositeScore).toBe(7.4);
    });
  });
});
