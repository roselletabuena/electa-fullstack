/**
 * API and Component Contracts for Frictionless Voter Authentication Modal (VS-27)
 */

import { z } from "zod";

export const PendingVoteIntentSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  contestantId: z.string().uuid("Invalid contestant ID format"),
  contestantName: z.string().optional(),
  awardCategoryId: z.string().uuid("Invalid award category ID format").optional(),
  voteType: z.enum(["FREE", "BOOST"]).default("FREE"),
  timestamp: z.number().int().positive(),
});

export type PendingVoteIntentContract = z.infer<typeof PendingVoteIntentSchema>;

export interface OmnichannelAuthModalContractProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (() => void) | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  voteIntent?: Omit<PendingVoteIntentContract, "timestamp"> | undefined;
}

export interface AuthPromptModalContractProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string | undefined;
  onSuccess?: (() => void) | undefined;
  voteIntent?: Omit<PendingVoteIntentContract, "timestamp"> | undefined;
}
