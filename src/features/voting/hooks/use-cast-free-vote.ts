"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { castFreeVoteAction } from "../actions/cast-free-vote";
import type {
  CastFreeVoteInput,
  CastFreeVoteResultDto,
  VotingErrorDto,
  VoterQuotaStateDto,
} from "../types";

interface UseCastFreeVoteOptions {
  onSuccess?: (result: CastFreeVoteResultDto) => void;
  onError?: (error: VotingErrorDto) => void;
}

export function useCastFreeVote(eventId: string, options?: UseCastFreeVoteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CastFreeVoteInput) => {
      const response = await castFreeVoteAction(input);
      if (!response.success) {
        throw response.error;
      }
      return response.data;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["voting-quota", eventId] });

      const previousQuota = queryClient.getQueryData<VoterQuotaStateDto>(["voting-quota", eventId]);

      // Optimistic update
      if (previousQuota && previousQuota.remainingVotes > 0) {
        const nextRemaining = previousQuota.remainingVotes - 1;
        queryClient.setQueryData<VoterQuotaStateDto>(["voting-quota", eventId], {
          ...previousQuota,
          votesUsedIn24h: previousQuota.votesUsedIn24h + 1,
          remainingVotes: nextRemaining,
          isInCooldown: nextRemaining === 0,
        });
      }

      return { previousQuota };
    },
    onError: (err: VotingErrorDto, _variables, context) => {
      // Rollback on error
      if (context?.previousQuota) {
        queryClient.setQueryData(["voting-quota", eventId], context.previousQuota);
      }
      options?.onError?.(err);
    },
    onSuccess: (result) => {
      // Sync fresh quota from server
      queryClient.setQueryData(["voting-quota", eventId], result.quotaState);
      // Invalidate contestant and event roster queries so vote counts update
      queryClient.invalidateQueries({ queryKey: ["contestants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      options?.onSuccess?.(result);
    },
  });
}
