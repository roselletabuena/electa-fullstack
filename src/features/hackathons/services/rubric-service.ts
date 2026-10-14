import { db } from "@/lib/db";
import type {
  ScorecardResultDto,
  JudgeScoreDto,
  ProjectAggregateScoreDto,
  LeaderboardRankEntryDto,
  CriterionAggregateBreakdown,
} from "../types/rubric";

export interface CalculateScoreCriterion {
  score: number;
  weight: number;
  maxScore?: number | undefined;
}

/**
 * Calculates a normalized weighted composite score on a 10-point scale.
 * Formula: Sum((Score_i / MaxScore_i) * 10 * (Weight_i / TotalWeight))
 */
export function calculateWeightedScore(scores: CalculateScoreCriterion[]): number {
  if (!scores.length) return 0;

  const totalWeight = scores.reduce(
    (sum, item) => sum + (item.weight > 0 ? item.weight : 0),
    0
  );
  if (totalWeight <= 0) return 0;

  const weightedSum = scores.reduce((sum, item) => {
    const effectiveMax = item.maxScore && item.maxScore > 0 ? item.maxScore : 10;
    const scaledScore = (item.score / effectiveMax) * 10;
    const normalizedWeight = item.weight / totalWeight;
    return sum + scaledScore * normalizedWeight;
  }, 0);

  return Math.round(weightedSum * 100) / 100;
}

export interface SubmitJudgeEvaluationParams {
  eventId: string;
  judgeId: string;
  submissionId: string;
  scores: Array<{ criterionId: string; score: number }>;
  notes?: string | undefined;
  isDraft?: boolean | undefined;
}

/**
 * Submits or saves draft for a judge's rubric evaluation of a submission.
 */
export async function submitJudgeEvaluation(
  params: SubmitJudgeEvaluationParams
): Promise<ScorecardResultDto> {
  const { eventId, judgeId, submissionId, scores, notes } = params;
  const isDraft = params.isDraft ?? false;

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    throw new Error(`Event with ID "${eventId}" not found.`);
  }

  const criteria = await db.rubricCriterion.findMany({
    where: { eventId },
    orderBy: { displayOrder: "asc" },
  });

  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  // Validate that all submitted criteria belong to this event
  for (const s of scores) {
    if (!criteriaMap.has(s.criterionId)) {
      throw new Error(`Criterion "${s.criterionId}" does not belong to event "${eventId}".`);
    }
  }

  // If final submission, all defined criteria must be scored
  if (!isDraft && criteria.length > 0 && scores.length < criteria.length) {
    throw new Error(
      `All ${criteria.length} criteria must be scored for final submission. Received ${scores.length}.`
    );
  }

  const scoreCalculationItems: CalculateScoreCriterion[] = scores.map((s) => {
    const criterion = criteriaMap.get(s.criterionId);
    return {
      score: s.score,
      weight: criterion ? Number(criterion.weight) : 1,
      maxScore: criterion ? criterion.maxScore : 10,
    };
  });

  const compositeScore = calculateWeightedScore(scoreCalculationItems);

  const evaluation = await db.$transaction(async (tx) => {
    const upserted = await tx.judgeEvaluation.upsert({
      where: {
        eventId_judgeId_submissionId: {
          eventId,
          judgeId,
          submissionId,
        },
      },
      create: {
        eventId,
        judgeId,
        submissionId,
        isDraft,
        notes: notes ?? null,
        compositeScore,
      },
      update: {
        isDraft,
        notes: notes ?? null,
        compositeScore,
      },
    });

    // Replace score items
    await tx.judgeScore.deleteMany({
      where: { evaluationId: upserted.id },
    });

    await tx.judgeScore.createMany({
      data: scores.map((s) => ({
        evaluationId: upserted.id,
        criterionId: s.criterionId,
        score: s.score,
      })),
    });

    return upserted;
  });

  const detailedScores: JudgeScoreDto[] = scores.map((s) => {
    const criterion = criteriaMap.get(s.criterionId);
    return {
      criterionId: s.criterionId,
      score: s.score,
      criterionTitle: criterion?.title,
      weight: criterion ? Number(criterion.weight) : 1,
    };
  });

  return {
    evaluationId: evaluation.id,
    eventId: evaluation.eventId,
    submissionId: evaluation.submissionId,
    judgeId: evaluation.judgeId,
    isDraft: evaluation.isDraft,
    compositeScore: Number(evaluation.compositeScore ?? compositeScore),
    notes: evaluation.notes,
    scores: detailedScores,
    submittedAt: evaluation.updatedAt.toISOString(),
  };
}

/**
 * Retrieves a judge's evaluation for a specific submission if it exists.
 */
export async function getJudgeEvaluation(params: {
  eventId: string;
  judgeId: string;
  submissionId: string;
}): Promise<ScorecardResultDto | null> {
  const evaluation = await db.judgeEvaluation.findUnique({
    where: {
      eventId_judgeId_submissionId: {
        eventId: params.eventId,
        judgeId: params.judgeId,
        submissionId: params.submissionId,
      },
    },
    include: {
      scores: {
        include: {
          criterion: true,
        },
      },
    },
  });

  if (!evaluation) {
    return null;
  }

  const scores: JudgeScoreDto[] = evaluation.scores.map((s) => ({
    criterionId: s.criterionId,
    score: Number(s.score),
    criterionTitle: s.criterion.title,
    weight: Number(s.criterion.weight),
  }));

  return {
    evaluationId: evaluation.id,
    eventId: evaluation.eventId,
    submissionId: evaluation.submissionId,
    judgeId: evaluation.judgeId,
    isDraft: evaluation.isDraft,
    compositeScore: Number(evaluation.compositeScore ?? 0),
    notes: evaluation.notes,
    scores,
    submittedAt: evaluation.updatedAt.toISOString(),
  };
}

/**
 * Calculates aggregate score statistics across all finalized (non-draft) evaluations for a submission.
 */
export async function getProjectAggregateScore(params: {
  eventId: string;
  submissionId: string;
}): Promise<ProjectAggregateScoreDto> {
  const evaluations = await db.judgeEvaluation.findMany({
    where: {
      eventId: params.eventId,
      submissionId: params.submissionId,
      isDraft: false,
    },
    include: {
      scores: {
        include: {
          criterion: true,
        },
      },
    },
  });

  if (!evaluations.length) {
    return {
      submissionId: params.submissionId,
      completedEvaluationsCount: 0,
      averageCompositeScore: 0,
      criteriaBreakdown: [],
    };
  }

  const totalComposite = evaluations.reduce(
    (sum, ev) => sum + Number(ev.compositeScore ?? 0),
    0
  );
  const averageCompositeScore =
    Math.round((totalComposite / evaluations.length) * 100) / 100;

  // Breakdown per criterion
  const criterionScoresMap = new Map<
    string,
    { title: string; weight: number; maxScore: number; scores: number[] }
  >();

  for (const ev of evaluations) {
    for (const sc of ev.scores) {
      const existing = criterionScoresMap.get(sc.criterionId);
      if (existing) {
        existing.scores.push(Number(sc.score));
      } else {
        criterionScoresMap.set(sc.criterionId, {
          title: sc.criterion.title,
          weight: Number(sc.criterion.weight),
          maxScore: sc.criterion.maxScore,
          scores: [Number(sc.score)],
        });
      }
    }
  }

  const criteriaBreakdown: CriterionAggregateBreakdown[] = Array.from(
    criterionScoresMap.entries()
  ).map(([criterionId, data]) => {
    const avg =
      data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
    return {
      criterionId,
      criterionTitle: data.title,
      averageScore: Math.round(avg * 100) / 100,
      weight: data.weight,
      maxScore: data.maxScore,
    };
  });

  return {
    submissionId: params.submissionId,
    completedEvaluationsCount: evaluations.length,
    averageCompositeScore,
    criteriaBreakdown,
  };
}

/**
 * Computes ranked leaderboard of submissions for an event based on finalized judge evaluations.
 */
export async function getEventLeaderboard(
  eventId: string
): Promise<LeaderboardRankEntryDto[]> {
  const evaluations = await db.judgeEvaluation.findMany({
    where: {
      eventId,
      isDraft: false,
    },
    select: {
      submissionId: true,
      compositeScore: true,
    },
  });

  const submissionMap = new Map<
    string,
    { totalScore: number; count: number }
  >();

  for (const ev of evaluations) {
    const existing = submissionMap.get(ev.submissionId);
    const score = Number(ev.compositeScore ?? 0);
    if (existing) {
      existing.totalScore += score;
      existing.count += 1;
    } else {
      submissionMap.set(ev.submissionId, { totalScore: score, count: 1 });
    }
  }

  const entries: Array<{
    submissionId: string;
    averageCompositeScore: number;
    evaluationsCount: number;
  }> = [];

  for (const [submissionId, data] of submissionMap.entries()) {
    const avg = Math.round((data.totalScore / data.count) * 100) / 100;
    entries.push({
      submissionId,
      averageCompositeScore: avg,
      evaluationsCount: data.count,
    });
  }

  // Sort descending by average score, then descending by evaluation count
  entries.sort((a, b) => {
    if (b.averageCompositeScore !== a.averageCompositeScore) {
      return b.averageCompositeScore - a.averageCompositeScore;
    }
    return b.evaluationsCount - a.evaluationsCount;
  });

  return entries.map((entry, index) => ({
    rank: index + 1,
    submissionId: entry.submissionId,
    averageCompositeScore: entry.averageCompositeScore,
    evaluationsCount: entry.evaluationsCount,
  }));
}
