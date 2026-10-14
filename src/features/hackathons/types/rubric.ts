import type {
  CriterionScoreInput,
  SubmitScorecardInput,
  RubricCriterionInput,
} from "@/lib/validations/rubric";

export type { CriterionScoreInput, SubmitScorecardInput, RubricCriterionInput };

export interface JudgeScoreDto {
  criterionId: string;
  score: number;
  criterionTitle?: string | undefined;
  weight?: number | undefined;
}

export interface ScorecardResultDto {
  evaluationId: string;
  eventId: string;
  submissionId: string;
  judgeId: string;
  isDraft: boolean;
  compositeScore: number;
  notes?: string | null | undefined;
  scores: JudgeScoreDto[];
  submittedAt: string;
}

export interface CriterionAggregateBreakdown {
  criterionId: string;
  criterionTitle: string;
  averageScore: number;
  weight: number;
  maxScore: number;
}

export interface ProjectAggregateScoreDto {
  submissionId: string;
  completedEvaluationsCount: number;
  averageCompositeScore: number;
  criteriaBreakdown: CriterionAggregateBreakdown[];
}

export interface LeaderboardRankEntryDto {
  rank: number;
  submissionId: string;
  averageCompositeScore: number;
  evaluationsCount: number;
}

export interface SubmitScorecardErrorDto {
  code:
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "INTERNAL_ERROR";
  message: string;
}

export interface SubmitScorecardResponse {
  success: boolean;
  data: ScorecardResultDto | null;
  error?: SubmitScorecardErrorDto | null | undefined;
}
