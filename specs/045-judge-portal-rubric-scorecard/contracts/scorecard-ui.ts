import { z } from "zod";

/**
 * Zod validation schema for individual criterion scoring in the scorecard modal.
 */
export const criterionScoreViewSchema = z.object({
  criterionId: z.string().uuid("Invalid criterion ID"),
  score: z.number().int().min(1, "Score must be at least 1").max(10, "Score cannot exceed 10"),
});

export type CriterionScoreView = z.infer<typeof criterionScoreViewSchema>;

/**
 * Filter mode for judging progress and project lists.
 */
export type JudgingFilterMode = "ALL" | "PENDING" | "COMPLETED";

/**
 * Props contract for JudgingProgressBar component.
 */
export interface JudgingProgressBarProps {
  totalCount: number;
  evaluatedCount: number;
  activeFilter: JudgingFilterMode;
  onFilterChange: (filter: JudgingFilterMode) => void;
  className?: string | undefined;
}

/**
 * Props contract for RubricScorecardModal component.
 */
export interface RubricScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  project: {
    id: string;
    title: string;
    tagline?: string | null | undefined;
    description: string;
    repositoryUrl: string;
    demoUrl?: string | null | undefined;
    videoUrl?: string | null | undefined;
    trackTags: string[];
  };
  criteria: Array<{
    id: string;
    title: string;
    description?: string | null | undefined;
    weight: number;
    maxScore: number;
    displayOrder: number;
  }>;
  existingEvaluation?: {
    compositeScore: number;
    notes?: string | null | undefined;
    isDraft: boolean;
    scores: Array<{
      criterionId: string;
      score: number;
    }>;
  } | undefined;
  onEvaluationSubmitted: (result: {
    submissionId: string;
    compositeScore: number;
    isDraft: boolean;
    scores: Array<{ criterionId: string; score: number }>;
    notes?: string | null | undefined;
  }) => void;
}

/**
 * Props contract for JudgePortal component.
 */
export interface JudgePortalProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  criteria: Array<{
    id: string;
    title: string;
    description?: string | null | undefined;
    weight: number;
    maxScore: number;
    displayOrder: number;
  }>;
  projects: Array<{
    id: string;
    title: string;
    tagline?: string | null | undefined;
    description: string;
    repositoryUrl: string;
    demoUrl?: string | null | undefined;
    videoUrl?: string | null | undefined;
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
    trackTags: string[];
    evaluationStatus: "PENDING" | "DRAFT" | "COMPLETED";
    existingEvaluation?: {
      compositeScore: number;
      notes?: string | null | undefined;
      isDraft: boolean;
      scores: Array<{
        criterionId: string;
        score: number;
      }>;
    } | undefined;
  }>;
  currentJudgeId: string;
}
