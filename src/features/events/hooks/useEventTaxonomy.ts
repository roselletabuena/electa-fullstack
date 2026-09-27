"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api/response";
import type {
  EventTaxonomyDto,
  DivisionDto,
  AwardCategoryDto,
  CreateDivisionInput,
  UpdateDivisionInput,
  CreateAwardCategoryInput,
  UpdateAwardCategoryInput,
} from "../types";
import type { TaxonomyPreset } from "../constants/taxonomy-presets";

export const eventTaxonomyQueryKey = (slug: string) => ["events", slug, "taxonomy"] as const;

export async function fetchEventTaxonomy(slug: string): Promise<EventTaxonomyDto> {
  const response = await fetch(`/api/events/${slug}/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiResponse<never>;
    throw new Error(errorData.error || `Failed to fetch event taxonomy: ${response.statusText}`);
  }

  const result = (await response.json()) as ApiResponse<EventTaxonomyDto>;
  if (!result.data) {
    throw new Error("Taxonomy payload missing from server response");
  }

  return result.data;
}

export function useEventTaxonomy(slug: string) {
  return useQuery({
    queryKey: eventTaxonomyQueryKey(slug),
    queryFn: () => fetchEventTaxonomy(slug),
    staleTime: 1000 * 10,
  });
}

export function useCreateDivision(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDivisionInput): Promise<DivisionDto> => {
      const response = await fetch(`/api/events/${slug}/divisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const result = (await response.json()) as ApiResponse<DivisionDto>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to create division");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useUpdateDivision(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      divisionId,
      data,
    }: {
      divisionId: string;
      data: UpdateDivisionInput;
    }): Promise<DivisionDto> => {
      const response = await fetch(`/api/events/${slug}/divisions/${divisionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as ApiResponse<DivisionDto>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to update division");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useDeleteDivision(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (divisionId: string): Promise<{ id: string }> => {
      const response = await fetch(`/api/events/${slug}/divisions/${divisionId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as ApiResponse<{ id: string }>;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete division");
      }

      return result.data ?? { id: divisionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useCreateAwardCategory(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAwardCategoryInput): Promise<AwardCategoryDto> => {
      const response = await fetch(`/api/events/${slug}/award-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const result = (await response.json()) as ApiResponse<AwardCategoryDto>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to create award category");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useUpdateAwardCategory(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: UpdateAwardCategoryInput;
    }): Promise<AwardCategoryDto> => {
      const response = await fetch(`/api/events/${slug}/award-categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as ApiResponse<AwardCategoryDto>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to update award category");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useDeleteAwardCategory(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<{ id: string }> => {
      const response = await fetch(`/api/events/${slug}/award-categories/${categoryId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as ApiResponse<{ id: string }>;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete award category");
      }

      return result.data ?? { id: categoryId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useApplyTaxonomyPreset(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preset: TaxonomyPreset,
    ): Promise<{ divisionsCreated: number; awardsCreated: number }> => {
      let divisionsCreated = 0;
      let awardsCreated = 0;

      for (const div of preset.divisions) {
        const res = await fetch(`/api/events/${slug}/divisions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: div.name,
            description: div.description,
            displayOrder: div.displayOrder,
          }),
        });
        if (res.ok) {
          divisionsCreated++;
        }
      }

      for (const award of preset.awardCategories) {
        const res = await fetch(`/api/events/${slug}/award-categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: award.name,
            description: award.description,
            isVotingOpen: award.isVotingOpen,
            displayOrder: award.displayOrder,
          }),
        });
        if (res.ok) {
          awardsCreated++;
        }
      }

      return { divisionsCreated, awardsCreated };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}
