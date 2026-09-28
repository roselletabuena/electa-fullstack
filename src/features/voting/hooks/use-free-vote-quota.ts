"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVoterQuotaAction } from "../actions/get-voter-quota";
import { formatCooldownCountdown, getRemainingMilliseconds } from "../utils/quota-calculator";
import type { VoterQuotaStateDto } from "../types";

export function useFreeVoteQuota(eventId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<VoterQuotaStateDto | null>({
    queryKey: ["voting-quota", eventId],
    queryFn: async () => {
      const response = await getVoterQuotaAction(eventId);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const quota = query.data ?? null;

  const [msRemaining, setMsRemaining] = useState<number>(() =>
    quota?.nextResetTime ? getRemainingMilliseconds(quota.nextResetTime) : 0,
  );

  // Synchronize countdown timer
  useEffect(() => {
    if (!quota?.isInCooldown || !quota.nextResetTime) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = getRemainingMilliseconds(quota.nextResetTime);
      setMsRemaining(remaining);

      // Auto-invalidate when countdown reaches zero to restore votes
      if (remaining <= 0) {
        clearInterval(interval);
        queryClient.invalidateQueries({ queryKey: ["voting-quota", eventId] });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quota?.isInCooldown, quota?.nextResetTime, eventId, queryClient]);

  const currentMs = quota?.isInCooldown && quota.nextResetTime ? msRemaining : 0;

  const formattedCountdown = formatCooldownCountdown(currentMs);

  return {
    quota,
    isLoading: query.isLoading,
    isError: query.isError,
    msRemaining: currentMs,
    formattedCountdown,
    refetch: query.refetch,
  };
}
