"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api/response";
import type {
  EventTaxonomyDto,
  DivisionDto,
  AwardCategoryDto,
  EventPositionDto,
  CreateDivisionInput,
  UpdateDivisionInput,
  CreateAwardCategoryInput,
  UpdateAwardCategoryInput,
} from "../types";
import type {
  CreateEventPositionInput,
  UpdateEventPositionInput,
} from "@/lib/validations/archetypes";
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
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
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
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
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
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
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
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
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
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
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
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useApplyTaxonomyPreset(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preset: TaxonomyPreset,
    ): Promise<{ divisionsCreated: number; awardsCreated: number }> => {
      const divisionPromises = preset.divisions.map(async (div) => {
        const res = await fetch(`/api/events/${slug}/divisions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: div.name,
            description: div.description,
            displayOrder: div.displayOrder,
          }),
        });
        return res.ok;
      });

      const awardPromises = preset.awardCategories.map(async (award) => {
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
        return res.ok;
      });

      const [divisionResults, awardResults] = await Promise.all([
        Promise.all(divisionPromises),
        Promise.all(awardPromises),
      ]);

      const divisionsCreated = divisionResults.filter(Boolean).length;
      const awardsCreated = awardResults.filter(Boolean).length;

      return { divisionsCreated, awardsCreated };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useCreateEventPosition(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventPositionInput): Promise<EventPositionDto> => {
      const response = await fetch(`/api/events/${slug}/positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const result = (await response.json()) as ApiResponse<EventPositionDto>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to create position");
      }

      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useUpdateEventPosition(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
      data,
    }: {
      positionId: string;
      data: UpdateEventPositionInput;
    }): Promise<EventPositionDto> => {
      const response = await fetch(`/api/events/${slug}/positions/${positionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as ApiResponse<EventPositionDto>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to update position");
      }

      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}

export function useDeleteEventPosition(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positionId: string): Promise<{ success: boolean; deletedId: string }> => {
      const response = await fetch(`/api/events/${slug}/positions/${positionId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as ApiResponse<{ success: boolean; deletedId: string }>;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete position");
      }

      return result.data ?? { success: true, deletedId: positionId };
    },
    onSuccess: () => {
      void  queryClient.invalidateQueries({ queryKey: eventTaxonomyQueryKey(slug) });
    },
  });
}
