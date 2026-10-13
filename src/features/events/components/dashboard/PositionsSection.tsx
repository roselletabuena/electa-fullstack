"use client";

import React, { useState } from "react";
import { Plus, Trash2, Layers, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EVENT_ARCHETYPE_CONFIGS, type EventArchetype, type EventPositionDto } from "../../types/archetype";
import type { CreateEventPositionInput } from "@/lib/validations/archetypes";
import { cn } from "@/lib/utils";

export interface PositionsSectionProps {
  slug: string;
  archetype: EventArchetype;
  positions: EventPositionDto[];
  isLoading?: boolean;
  onAddPosition: (data: CreateEventPositionInput) => Promise<void>;
  onDeletePosition: (positionId: string) => Promise<void>;
  className?: string;
}

export function PositionsSection({
  slug: _slug,
  archetype,
  positions,
  isLoading = false,
  onAddPosition,
  onDeletePosition,
  className,
}: Readonly<PositionsSectionProps>): React.JSX.Element {
  const config = EVENT_ARCHETYPE_CONFIGS[archetype];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxSelections, setMaxSelections] = useState(1);
  const [minSelections, setMinSelections] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError(`${config.groupingTerm} name is required.`);
      return;
    }

    if (minSelections > maxSelections) {
      setError("Minimum selections cannot exceed maximum selections.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPosition({
        name: trimmed,
        description: description.trim() || undefined,
        maxSelectionsPerVoter: maxSelections,
        minSelectionsPerVoter: minSelections,
        displayOrder: positions.length + 1,
        isVotingOpen: true,
      });

      setName("");
      setDescription("");
      setMaxSelections(1);
      setMinSelections(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("border-slate-200 dark:border-slate-800 rounded-none shadow-xs", className)}>
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-sky-600 dark:text-sky-400" />
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            {config.groupingTerm}s & Ballot Limits
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Manage {config.groupingTerm.toLowerCase()}s for this {config.label.toLowerCase()}. Each voter is constrained by maximum seat limits.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-900 rounded-none dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Item Form */}
        <form onSubmit={handleAdd} className="border border-slate-200 bg-slate-50/50 p-4 space-y-4 rounded-none dark:border-slate-800 dark:bg-slate-900/50">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Add New {config.groupingTerm}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pos-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {config.groupingTerm} Name <span className="text-red-500">*</span>
              </label>
              <input
                id="pos-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={archetype === "HACKATHON" ? "e.g. AI Innovation Track" : "e.g. President, Senator"}
                disabled={isSubmitting || isLoading}
                className="mt-1 block w-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden rounded-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="pos-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Description (Optional)
              </label>
              <input
                id="pos-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description or requirements"
                disabled={isSubmitting || isLoading}
                className="mt-1 block w-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-hidden rounded-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pos-max" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Max Seats / Selections per Voter
              </label>
              <input
                id="pos-max"
                type="number"
                min={1}
                max={50}
                value={maxSelections}
                onChange={(e) => setMaxSelections(Number.parseInt(e.target.value, 10) || 1)}
                disabled={isSubmitting || isLoading}
                className="mt-1 block w-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-600 focus:outline-hidden rounded-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="pos-min" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Min Selections
              </label>
              <input
                id="pos-min"
                type="number"
                min={0}
                max={50}
                value={minSelections}
                onChange={(e) => setMinSelections(Number.parseInt(e.target.value, 10) || 0)}
                disabled={isSubmitting || isLoading}
                className="mt-1 block w-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-600 focus:outline-hidden rounded-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-slate-800 rounded-none dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span>Add {config.groupingTerm}</span>
          </button>
        </form>

        {/* Existing Positions List */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Configured {config.groupingTerm}s ({positions.length})
          </div>

          {positions.length === 0 ? (
            <div className="border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 rounded-none dark:border-slate-800 dark:text-slate-400">
              No {config.groupingTerm.toLowerCase()}s configured yet. Add your first {config.groupingTerm.toLowerCase()} above.
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map((pos, idx) => (
                <div
                  key={pos.id}
                  className="flex items-center justify-between border border-slate-200 bg-white p-3.5 rounded-none shadow-2xs dark:border-slate-800 dark:bg-[#0d1424]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                        {pos.name}
                      </div>
                      {pos.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {pos.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 rounded-none dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                      {pos.maxSelectionsPerVoter > 1
                        ? `Up to ${pos.maxSelectionsPerVoter} Seats`
                        : "Single Seat (1)"}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeletePosition(pos.id)}
                      disabled={isLoading}
                      aria-label={`Delete ${pos.name}`}
                      className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center text-slate-400 hover:text-red-600 transition dark:text-slate-500 dark:hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
