import { useQuery } from "@tanstack/react-query";
import type { ContestantDto, ContestantFilters } from "../types";
import type { ApiResponse } from "@/lib/api/response";

export function useContestants(slug: string, filters?: ContestantFilters) {
  return useQuery({
    queryKey: ["contestants", slug, filters?.division, filters?.categoryId, filters?.status],
    queryFn: async (): Promise<ContestantDto[]> => {
      const params = new URLSearchParams();
      if (filters?.division && filters.division !== "ALL") {
        params.set("division", filters.division);
      }
      if (filters?.categoryId && filters.categoryId !== "ALL") {
        params.set("categoryId", filters.categoryId);
      }
      if (filters?.status) {
        params.set("status", filters.status);
      }

      const queryString = params.toString();
      const url = `/api/events/${encodeURIComponent(slug)}/contestants${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch contestants: ${res.statusText}`);
      }

      const json: ApiResponse<ContestantDto[]> = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Failed to retrieve contestants");
      }

      return json.data;
    },
    enabled: Boolean(slug),
    staleTime: 30_000,
  });
}
