"use client";

import { useQuery } from "@tanstack/react-query";
import type { LeaderboardPayload } from "../types";

export interface UseLeaderboardRealtimeOptions {
  slug: string;
  divisionId?: string | null | undefined;
  categoryId?: string | null | undefined;
  initialData?: LeaderboardPayload | undefined;
}

export function useLeaderboardRealtime({
  slug,
  divisionId,
  categoryId,
  initialData,
}: UseLeaderboardRealtimeOptions) {
  return useQuery<LeaderboardPayload>({
    queryKey: ["leaderboard", slug, divisionId ?? "all", categoryId ?? "overall"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (divisionId) params.set("divisionId", divisionId);
      if (categoryId) params.set("categoryId", categoryId);

      const url = `/api/events/${slug}/leaderboard${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Invalid leaderboard response");
      }
      return json.data as LeaderboardPayload;
    },
    ...(initialData ? { initialData } : {}),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}
