"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api/response";
import type { PublicEventDto } from "../types";

export function useTrendingEvents() {
  return useQuery<ApiResponse<PublicEventDto[]>>({
    queryKey: ["events", "public"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) {
        throw new Error("Failed to fetch public events");
      }
      return res.json() as Promise<ApiResponse<PublicEventDto[]>>;
    },
    staleTime: 1000 * 60, // 1 minute cache
  });
}
