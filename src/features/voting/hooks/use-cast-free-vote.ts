"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { castFreeVoteAction } from "../actions/cast-free-vote";
import type { CastFreeVoteInput, CastFreeVoteResultDto, VotingErrorDto } from "../types";

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
    onError: (err: VotingErrorDto) => {
      options?.onError?.(err);
    },
    onSuccess: (result) => {
      // Sync fresh quota from server
      queryClient.setQueryData(["voting-quota", eventId], result.quotaState);
      // Invalidate contestant and event roster queries so vote counts update immediately
      void queryClient.invalidateQueries({ queryKey: ["contestants"] });
      void queryClient.invalidateQueries({ queryKey: ["event"] });
      options?.onSuccess?.(result);
    },
  });
}
