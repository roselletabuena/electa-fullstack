import { z } from "zod";

/**
 * Zod schema for single criterion evaluation score input
 */
export const criterionScoreInputSchema = z.object({
  criterionId: z.string().uuid("Invalid criterion ID format"),
  score: z.number().min(1, "Score must be at least 1").max(10, "Score cannot exceed 10"),
});

/**
 * Zod schema for scorecard submission payload
 */
export const submitScorecardSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  submissionId: z.string().min(1, "Submission ID is required"),
  scores: z.array(criterionScoreInputSchema).min(1, "At least one criterion score is required"),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
  isDraft: z.boolean().default(false),
});

/**
 * Zod schema for creating or configuring a rubric criterion
 */
export const rubricCriterionSchema = z.object({
  title: z.string().min(2, "Criterion title must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  weight: z.number().positive("Weight must be greater than zero").default(1),
  maxScore: z.number().int().positive().default(10),
  displayOrder: z.number().int().nonnegative().default(0),
});

export type CriterionScoreInput = z.infer<typeof criterionScoreInputSchema>;
export type SubmitScorecardInput = z.infer<typeof submitScorecardSchema>;
export type RubricCriterionInput = z.infer<typeof rubricCriterionSchema>;
