"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, Plus, Trash2, Users, Loader2, AlertCircle, Hash, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createDivisionSchema,
  type CreateDivisionInput,
  type CreateDivisionFormInput,
  type UpdateDivisionInput,
} from "@/lib/validations/division";
import type { DivisionDto } from "../../types";
import { cn } from "@/lib/utils";

export interface DivisionsSectionProps {
  slug: string;
  divisions: DivisionDto[];
  isLoading: boolean;
  onAddDivision: (input: CreateDivisionInput) => Promise<void>;
  onUpdateDivision?: (divisionId: string, input: UpdateDivisionInput) => Promise<void>;
  onDeleteRequest: (division: DivisionDto) => void;
  disabled?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

export function DivisionsSection({
  divisions,
  isLoading,
  onAddDivision,
  onUpdateDivision,
  onDeleteRequest,
  disabled = false,
  onEditingChange,
}: Readonly<DivisionsSectionProps>): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingDivisionId, setEditingDivisionId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDivisionFormInput, unknown, CreateDivisionInput>({
    resolver: zodResolver(createDivisionSchema),
    defaultValues: {
      name: "",
      description: "",
      displayOrder: divisions.length,
    },
  });

  const handleStartAdding = () => {
    if (isBusy || editingDivisionId !== null) return;
    setIsAdding(true);
    onEditingChange?.(true);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
    reset();
    onEditingChange?.(false);
  };

  const onSubmit = async (data: CreateDivisionInput) => {
    setSubmitError(null);
    try {
      await onAddDivision({
        name: data.name,
        description: data.description || null,
        displayOrder: data.displayOrder ?? divisions.length,
      });
      reset({ name: "", description: "", displayOrder: divisions.length + 1 });
      setIsAdding(false);
      onEditingChange?.(false);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add division");
    }
  };

  const handleStartEdit = (division: DivisionDto) => {
    if (isBusy || editingDivisionId !== null || isAdding) return;
    setEditingDivisionId(division.id);
    setEditName(division.name);
    setEditDescription(division.description ?? "");
    setEditDisplayOrder(division.displayOrder);
    setEditError(null);
    onEditingChange?.(true);
  };

  const handleCancelEdit = () => {
    setEditingDivisionId(null);
    setEditError(null);
    onEditingChange?.(false);
  };

  const handleSaveEdit = async (divisionId: string) => {
    if (!editName.trim()) {
      setEditError("Division name is required");
      return;
    }
    setEditError(null);
    setIsSavingEdit(true);
    try {
      if (onUpdateDivision) {
        await onUpdateDivision(divisionId, {
          name: editName.trim(),
          description: editDescription.trim() || null,
          displayOrder: Number(editDisplayOrder) || 0,
        });
      }
      setEditingDivisionId(null);
      onEditingChange?.(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update division");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const isBusy = isLoading || isSubmitting || disabled;
  const isAnyActionBlocked = isBusy || editingDivisionId !== null || isAdding;

  return (
    <Card className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Competition Divisions & Brackets
            </CardTitle>
            <CardDescription className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Define gender, age, or skill divisions (e.g., &quot;Female&quot;, &quot;Male&quot;,
              &quot;Teen&quot;, &quot;Varsity&quot;).
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-none border-slate-300 bg-slate-50 font-mono text-xs font-semibold dark:border-slate-800 dark:bg-slate-800"
            >
              {divisions.length} Active Division{divisions.length !== 1 ? "s" : ""}
            </Badge>
            {!isAdding && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isAnyActionBlocked}
                onClick={handleStartAdding}
                className="font-heading gap-1.5 rounded-none text-xs font-extrabold tracking-wider uppercase"
              >
                <Plus className="size-3.5" />
                Add Division
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Inline Division Creation Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-none border border-slate-300 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-slate-950/40"
          >
            <div className="flex items-center justify-between pb-3">
              <h4 className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                New Division
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  reset();
                }}
                className="font-sans text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            {submitError && (
              <div className="mb-3 flex items-center gap-2 rounded-none border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="space-y-1 sm:col-span-6">
                <label className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Division Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Female Division, Junior Bracket"
                  {...register("name")}
                  className={cn(
                    "w-full rounded-none border border-slate-300 bg-white px-3 py-1.5 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
                    errors.name && "border-red-500",
                  )}
                />
                {errors.name && <p className="text-[10px] text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-1 sm:col-span-4">
                <label className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Description{" "}
                  <span className="font-sans font-normal text-slate-400 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ages 13-17"
                  {...register("description")}
                  className="w-full rounded-none border border-slate-300 bg-white px-3 py-1.5 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Order
                </label>
                <input
                  type="number"
                  min={0}
                  {...register("displayOrder", { valueAsNumber: true })}
                  className="w-full rounded-none border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelAdding}
                className="rounded-none font-sans text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="font-heading gap-1.5 rounded-none bg-slate-900 px-4 py-1.5 text-xs font-extrabold tracking-wider text-white uppercase shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Save Division
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Division List / Empty State */}
        {divisions.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
            <div className="flex size-10 items-center justify-center rounded-none border border-slate-300 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <Layers className="size-5" />
            </div>
            <h4 className="font-heading mt-3 text-xs font-bold text-slate-900 dark:text-slate-100">
              No Divisions Configured
            </h4>
            <p className="mt-1 max-w-sm font-sans text-[11px] text-slate-500 dark:text-slate-400">
              Define custom competition brackets to group your contestants.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isAnyActionBlocked}
              onClick={handleStartAdding}
              className="font-heading mt-4 gap-1.5 rounded-none text-xs font-extrabold tracking-wider uppercase"
            >
              <Plus className="size-3.5" />
              Add First Division
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((division) => {
              const isEditing = editingDivisionId === division.id;

              if (isEditing) {
                return (
                  <div
                    key={division.id}
                    className="relative flex flex-col justify-between rounded-none border border-sky-400 bg-sky-50/30 p-3.5 shadow-xs transition-all dark:border-sky-800 dark:bg-sky-950/20"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                          Edit Division
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          {division.contestantCount ?? 0} contestants
                        </span>
                      </div>

                      {editError && (
                        <div className="flex items-center gap-1.5 rounded-none border border-red-200 bg-red-50 p-2 text-[11px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                          <AlertCircle className="size-3 shrink-0" />
                          <span>{editError}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="font-heading text-[10px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                          Division Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          aria-label="Division Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isSavingEdit}
                          className="w-full rounded-none border border-slate-300 bg-white px-2.5 py-1 font-sans text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-heading text-[10px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                          Description{" "}
                          <span className="font-sans font-normal text-slate-400 lowercase">
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          aria-label="Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          disabled={isSavingEdit}
                          className="w-full rounded-none border border-slate-300 bg-white px-2.5 py-1 font-sans text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-heading text-[10px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                          Order
                        </label>
                        <input
                          type="number"
                          min={0}
                          aria-label="Display Order"
                          value={editDisplayOrder}
                          onChange={(e) => setEditDisplayOrder(Number(e.target.value))}
                          disabled={isSavingEdit}
                          className="w-full rounded-none border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200/70 pt-2.5 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSavingEdit}
                        onClick={handleCancelEdit}
                        className="h-7 rounded-none font-sans text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingEdit || !editName.trim()}
                        onClick={() => handleSaveEdit(division.id)}
                        className="font-heading h-7 gap-1 rounded-none bg-slate-900 px-3 text-xs font-extrabold tracking-wider text-white uppercase hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        {isSavingEdit ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={division.id}
                  className="group relative flex flex-col justify-between rounded-none border border-slate-200/90 bg-white p-3.5 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
                          {division.name}
                        </span>
                      </div>
                      {division.description && (
                        <p className="line-clamp-2 font-sans text-[11px] text-slate-500 dark:text-slate-400">
                          {division.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${division.name}`}
                        disabled={isAnyActionBlocked}
                        onClick={() => handleStartEdit(division)}
                        className="size-7 rounded-none text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Edit division"
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit division {division.name}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isAnyActionBlocked}
                        onClick={() => onDeleteRequest(division)}
                        className="size-7 rounded-none text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Delete division"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete division {division.name}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      <span>{division.contestantCount ?? 0} contestants</span>
                    </span>
                    <span className="flex items-center gap-0.5 font-mono text-[10px] text-slate-400">
                      <Hash className="size-2.5" />
                      <span>Order: {division.displayOrder}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
