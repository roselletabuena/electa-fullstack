import { z } from "zod";

export const votingRulesFormSchema = z.object({
  isFreeVotingEnabled: z.boolean(),
  dailyFreeVoteLimit: z
    .number()
    .int("Daily free vote limit must be an integer")
    .min(1, "Daily free vote limit must be between 1 and 5")
    .max(5, "Daily free vote limit must be between 1 and 5"),
  reason: z.string().trim().max(500, "Reason for change must not exceed 500 characters").optional(),
});

export const updateVotingRulesInputSchema = votingRulesFormSchema.extend({
  slug: z.string().trim().min(1, "Event slug is required"),
});

export type VotingRulesFormValues = z.infer<typeof votingRulesFormSchema>;
export type UpdateVotingRulesInput = z.infer<typeof updateVotingRulesInputSchema>;
