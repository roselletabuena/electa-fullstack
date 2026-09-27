"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit3, Trash2, Sparkles } from "lucide-react";
import type { ContestantDto, AwardCategoryDto, ContestantStatus } from "../types";
import { ContestantFormModal } from "./ContestantFormModal";
import { useContestantMutations } from "../hooks/use-contestant-mutations";
import { useContestants } from "../hooks/use-contestants";

interface OrganizerContestantTableProps {
  slug: string;
  contestants: ContestantDto[];
  categories: AwardCategoryDto[];
}

export const OrganizerContestantTable: React.FC<OrganizerContestantTableProps> = ({
  slug,
  contestants: initialContestants,
  categories,
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
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Contestant Roster Management</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Add official participants, adjust profile data, and control voting statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-colors hover:bg-amber-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Contestant</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-[10px] tracking-wider text-slate-400 uppercase">
            <tr>
              <th className="px-2 py-3">No.</th>
              <th className="px-2 py-3">Candidate</th>
              <th className="px-2 py-3">Division</th>
              <th className="px-2 py-3">Nominations</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3 text-right">Votes</th>
              <th className="px-2 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {contestants.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-white/2">
                <td className="px-2 py-3 font-mono font-bold text-amber-300">
                  #{String(c.contestantNumber).padStart(2, "0")}
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-md border border-white/10">
                      <Image
                        src={c.avatarUrl || "/placeholder-contestant.webp"}
                        alt={c.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.hometown || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-slate-300 capitalize">{c.division.toLowerCase()}</td>
                <td className="px-2 py-3">
                  <div className="flex max-w-50 flex-wrap gap-1">
                    {c.categories.length > 0 ? (
                      c.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300"
                        >
                          {cat.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value as ContestantStatus)}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                      c.status === "ACTIVE"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : c.status === "HIDDEN"
                          ? "border-white/10 bg-slate-800 text-slate-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="HIDDEN">HIDDEN</option>
                    <option value="WITHDRAWN">WITHDRAWN</option>
                  </select>
                </td>
                <td className="px-2 py-3 text-right font-mono font-medium text-slate-200">
                  {c.voteCount.toLocaleString()}
                </td>
                <td className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-amber-400"
                      title="Edit Profile"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
                      title="Delete Candidate"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContestantFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
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
