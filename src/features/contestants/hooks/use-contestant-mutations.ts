import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateContestantInput, UpdateContestantInput, ContestantStatus } from "../types";
import type { ApiResponse } from "@/lib/api/response";

export function useContestantMutations(slug: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["contestants", slug] });
  };

  const createContestant = useMutation({
    mutationFn: async (input: CreateContestantInput) => {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/contestants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create contestant");
      }
      return json.data;
    },
    onSuccess: invalidate,
  });

  const updateContestant = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContestantInput }) => {
      const res = await fetch(
        `/api/events/${encodeURIComponent(slug)}/contestants/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const json: ApiResponse<unknown> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update contestant");
      }
      return json.data;
    },
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContestantStatus }) => {
      const res = await fetch(
        `/api/events/${encodeURIComponent(slug)}/contestants/${encodeURIComponent(id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const json: ApiResponse<unknown> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update contestant status");
      }
      return json.data;
    },
    onSuccess: invalidate,
  });

  const deleteContestant = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/events/${encodeURIComponent(slug)}/contestants/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );
      const json: ApiResponse<unknown> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete contestant");
      }
      return json.data;
    },

    onSuccess: invalidate,
  });

  return {
    createContestant,
    updateContestant,
    updateStatus,
    deleteContestant,
  };
}
