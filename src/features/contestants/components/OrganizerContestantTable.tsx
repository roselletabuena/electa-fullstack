"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit3, Trash2, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContestantDto, AwardCategoryDto, ContestantStatus, DynamicDivisionItem } from "../types";
import { ContestantFormModal } from "./ContestantFormModal";
import { useContestantMutations } from "../hooks/use-contestant-mutations";
import { useContestants } from "../hooks/use-contestants";
import { cn } from "@/lib/utils";

interface OrganizerContestantTableProps {
  slug: string;
  contestants: ContestantDto[];
  categories: AwardCategoryDto[];
  divisions?: DynamicDivisionItem[] | undefined;
}

export const OrganizerContestantTable: React.FC<OrganizerContestantTableProps> = ({
  slug,
  contestants: initialContestants,
  categories,
  divisions,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContestant, setEditingContestant] = useState<ContestantDto | null>(null);

  const { data: contestants = initialContestants } = useContestants(slug, { status: "ALL" });
  const { createContestant, updateContestant, updateStatus, deleteContestant } =
    useContestantMutations(slug);

  const handleOpenAdd = () => {
    setEditingContestant(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: ContestantDto) => {
    setEditingContestant(c);
    setModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: ContestantStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete candidate ${name}?`)) {
      try {
        await deleteContestant.mutateAsync(id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-none border border-slate-300 shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="size-5 text-sky-600 dark:text-sky-400" />
                <CardTitle className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  Contestant Management
                </CardTitle>
              </div>
              <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Add official participants, adjust profile data, and control voting statuses.
              </CardDescription>
            </div>

            <Button
              type="button"
              onClick={handleOpenAdd}
              className="btn-primary gap-1.5 px-4 py-2 text-xs"
            >
              <Plus className="size-4" />
              <span>Add Contestant</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {contestants.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-none border border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-400">
                <Users className="size-6" />
              </div>
              <h4 className="mt-3 font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100">
                No contestants registered yet
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-400">
                Start by adding your first candidate profile and photos.
              </p>
              <Button
                type="button"
                onClick={handleOpenAdd}
                className="btn-primary mt-4 gap-1.5 px-4 py-2 text-xs"
              >
                <Plus className="size-3.5" />
                <span>Add First Contestant</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-3.5">No.</th>
                    <th className="px-5 py-3.5">Candidate</th>
                    <th className="px-5 py-3.5">Division</th>
                    <th className="px-5 py-3.5">Nominations</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Votes</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {contestants.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                        #{String(c.contestantNumber).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-none border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                            <Image
                              src={c.avatarUrl || "/placeholder-contestant.webp"}
                              alt={c.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400">
                              {c.hometown || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700 capitalize dark:text-slate-300">
                        {c.divisionRef?.name || c.divisionName || c.division.toLowerCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex max-w-56 flex-wrap gap-1">
                          {c.categories.length > 0 ? (
                            c.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="rounded-none border border-slate-300 bg-slate-100/80 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(c.id, e.target.value as ContestantStatus)
                          }
                          className={cn(
                            "rounded-none border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none",
                            c.status === "ACTIVE"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : c.status === "HIDDEN"
                                ? "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
                          )}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="HIDDEN">HIDDEN</option>
                          <option value="WITHDRAWN">WITHDRAWN</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {c.voteCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="rounded-none p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Edit Profile"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.name)}
                            className="rounded-none p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                            title="Delete Candidate"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ContestantFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        divisions={divisions}
        initialData={editingContestant}
        onSubmit={async (data) => {
          await (editingContestant
            ? updateContestant.mutateAsync({ id: editingContestant.id, data })
            : createContestant.mutateAsync(data));
        }}
      />
    </div>
  );
};
