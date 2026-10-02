"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { getPendingVoteIntent, clearPendingVoteIntent } from "../utils/vote-intent";
import { useCastFreeVote } from "./use-cast-free-vote";
import type { CastFreeVoteResultDto, VotingErrorDto } from "../types";

export interface UsePendingVoteIntentOptions {
  eventId: string;
  onSuccess?: ((result: CastFreeVoteResultDto) => void) | undefined;
  onError?: ((error: VotingErrorDto) => void) | undefined;
}

/**
 * Hook to automatically resume and execute pending vote intents upon returning from OAuth redirects.
 */
export function usePendingVoteIntent({ eventId, onSuccess, onError }: UsePendingVoteIntentOptions) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasExecutedRef = useRef(false);

  const { mutate: castVote, isPending } = useCastFreeVote(eventId, {
    onSuccess: (result) => {
      clearPendingVoteIntent();
      onSuccess?.(result);
    },
    onError: (err) => {
      clearPendingVoteIntent();
      onError?.(err);
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !user || hasExecutedRef.current) return;

    const pendingIntent = getPendingVoteIntent();
    if (!pendingIntent) return;

    if (pendingIntent.eventId === eventId) {
      hasExecutedRef.current = true;
      castVote({
        eventId: pendingIntent.eventId,
        contestantId: pendingIntent.contestantId,
        awardCategoryId: pendingIntent.awardCategoryId,
      });
    }
  }, [isAuthenticated, user, eventId, castVote]);

  return {
    isExecutingPendingVote: isPending,
  };
}
