"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Plus, Trash2, Users, Loader2, AlertCircle, Hash, Vote, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createAwardCategorySchema,
  type CreateAwardCategoryInput,
  type CreateAwardCategoryFormInput,
  type UpdateAwardCategoryInput,
} from "@/lib/validations/category-awards";
import type { AwardCategoryDto } from "../../types";
import { cn } from "@/lib/utils";

export interface AwardCategoriesSectionProps {
  slug: string;
  awardCategories: AwardCategoryDto[];
  isLoading: boolean;
  onAddCategory: (input: CreateAwardCategoryInput) => Promise<void>;
  onUpdateCategory?: (categoryId: string, input: UpdateAwardCategoryInput) => Promise<void>;
  onToggleVoting: (categoryId: string, isVotingOpen: boolean) => Promise<void>;
  onDeleteRequest: (category: AwardCategoryDto) => void;
  disabled?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

export function AwardCategoriesSection({
  awardCategories,
  isLoading,
  onAddCategory,
  onUpdateCategory,
  onToggleVoting,
  onDeleteRequest,
  disabled = false,
  onEditingChange,
}: Readonly<AwardCategoriesSectionProps>): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);
  const [editIsVotingOpen, setEditIsVotingOpen] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Compute next sequential 1-based display order
  const nextDisplayOrder =
    awardCategories.length > 0 ? Math.max(...awardCategories.map((c) => c.displayOrder)) + 1 : 1;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAwardCategoryFormInput, unknown, CreateAwardCategoryInput>({
    resolver: zodResolver(createAwardCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isVotingOpen: true,
      displayOrder: nextDisplayOrder,
    },
  });

  const watchedIsVotingOpen = useWatch({
    control,
    name: "isVotingOpen",
    defaultValue: true,
  });

  const handleStartAdding = () => {
    if (isBusy || editingCategoryId !== null) return;
    setValue("displayOrder", nextDisplayOrder);
    setIsAdding(true);
    onEditingChange?.(true);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
    reset();
    onEditingChange?.(false);
  };

  const onSubmit = async (data: CreateAwardCategoryInput) => {
    setSubmitError(null);
    try {
      await onAddCategory({
        name: data.name,
        description: data.description || null,
        isVotingOpen: data.isVotingOpen ?? true,
        displayOrder: Number(data.displayOrder) || nextDisplayOrder,
      });
      reset({
        name: "",
        description: "",
        isVotingOpen: true,
        displayOrder: nextDisplayOrder + 1,
      });
      setIsAdding(false);
      onEditingChange?.(false);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add award category");
    }
  };

  const handleStartEdit = (category: AwardCategoryDto) => {
    if (isBusy || editingCategoryId !== null || isAdding) return;
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    setEditDisplayOrder(category.displayOrder);
    setEditIsVotingOpen(category.isVotingOpen);
    setEditError(null);
    onEditingChange?.(true);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditError(null);
    onEditingChange?.(false);
  };

  const handleSaveEdit = async (categoryId: string) => {
    if (!editName.trim()) {
      setEditError("Category name is required");
      return;
    }
    setEditError(null);
    setIsSavingEdit(true);
    try {
      if (onUpdateCategory) {
        await onUpdateCategory(categoryId, {
          name: editName.trim(),
          description: editDescription.trim() || null,
          displayOrder: Number(editDisplayOrder) || 0,
          isVotingOpen: editIsVotingOpen,
        });
      }
      setEditingCategoryId(null);
      onEditingChange?.(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update award category");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggle = async (category: AwardCategoryDto) => {
    if (disabled || togglingId === category.id) return;
    setTogglingId(category.id);
    try {
      await onToggleVoting(category.id, !category.isVotingOpen);
    } finally {
      setTogglingId(null);
    }
  };

  const isBusy = isLoading || isSubmitting || disabled;
  const isAnyActionBlocked = isBusy || editingCategoryId !== null || isAdding;

  // Deterministically sort categories by displayOrder ascending, then name
  const sortedCategories = React.useMemo(() => {
    return [...awardCategories].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }, [awardCategories]);

  return (
    <Card className="rounded-none border-slate-200 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Award Categories
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Configure specialized award categories and toggle live public voting availability per
              award category.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-none border-slate-200 bg-slate-50 text-xs font-semibold dark:border-slate-800 dark:bg-slate-800"
            >
              {awardCategories.length} Award Categor{awardCategories.length !== 1 ? "ies" : "y"}
            </Badge>
            {!isAdding && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isAnyActionBlocked}
                onClick={handleStartAdding}
                className="gap-1.5 rounded-none text-xs font-semibold"
              >
                <Plus className="size-3.5" />
                Add Award Category
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Inline Award Creation Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-none border border-indigo-200 bg-indigo-50/40 p-4 transition-all dark:border-indigo-900/60 dark:bg-indigo-950/20"
          >
            <div className="flex items-center justify-between pb-3">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                New Award Category
              </h4>
              <button
                type="button"
                onClick={handleCancelAdding}
                className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              <div className="space-y-1 sm:col-span-5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Award Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. People's Choice, Best Talent"
                  {...register("name")}
                  className={cn(
                    "w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
                    errors.name && "border-red-500",
                  )}
                />
                {errors.name && <p className="text-[10px] text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-1 sm:col-span-4">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Description <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open public voting category"
                  {...register("description")}
                  className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Voting Availability
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={watchedIsVotingOpen}
                    onClick={() => setValue("isVotingOpen", !watchedIsVotingOpen)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
                      watchedIsVotingOpen ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-4 transform rounded-none bg-white shadow-sm transition duration-200 ease-in-out",
                        watchedIsVotingOpen ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {watchedIsVotingOpen ? "Voting Open" : "Judged Only"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelAdding}
                className="rounded-none text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5 rounded-none bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Save Award Category
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Award Categories List / Empty State */}
        {sortedCategories.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <div className="flex size-10 items-center justify-center rounded-none bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Award className="size-5" />
            </div>
            <h4 className="mt-3 text-xs font-bold text-slate-900 dark:text-slate-100">
              No Award Categories Configured
            </h4>
            <p className="mt-1 max-w-sm text-[11px] text-slate-500 dark:text-slate-400">
              Define custom award categories to organize competition recognitions.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isAnyActionBlocked}
              onClick={handleStartAdding}
              className="mt-4 gap-1.5 rounded-none text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              Add First Award Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map((category) => {
              const isEditing = editingCategoryId === category.id;
              const isToggling = togglingId === category.id;

              if (isEditing) {
                return (
                  <div
                    key={category.id}
                    className="relative flex flex-col justify-between rounded-none border border-indigo-300 bg-indigo-50/30 p-3.5 shadow-xs transition-all dark:border-indigo-800 dark:bg-indigo-950/30"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          Edit Award Category
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {category.contestantCount ?? 0} contestants
                        </span>
                      </div>

                      {editError && (
                        <div className="flex items-center gap-1.5 rounded-none border border-red-200 bg-red-50 p-2 text-[11px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                          <AlertCircle className="size-3 shrink-0" />
                          <span>{editError}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                          Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          aria-label="Category Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isSavingEdit}
                          className="w-full rounded-none border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                          Description <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          aria-label="Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          disabled={isSavingEdit}
                          className="w-full rounded-none border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                          Order
                        </label>
                        <input
                          type="number"
                          min={0}
                          aria-label="Display Order"
                          value={editDisplayOrder}
                          onChange={(e) => setEditDisplayOrder(Number(e.target.value))}
                          disabled={isSavingEdit}
                          className="w-full rounded-none border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Voting Toggle Row inside Edit Mode */}
                      <div className="flex items-center justify-between rounded-none border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Vote className="size-3 text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Voting Status:
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-none px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors",
                              editIsVotingOpen
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
                            )}
                          >
                            {editIsVotingOpen ? "VOTING OPEN" : "JUDGED ONLY"}
                          </Badge>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={editIsVotingOpen}
                            disabled={isSavingEdit}
                            onClick={() => setEditIsVotingOpen(!editIsVotingOpen)}
                            className={cn(
                              "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
                              editIsVotingOpen
                                ? "bg-emerald-600"
                                : "bg-slate-300 dark:bg-slate-700",
                            )}
                          >
                            <span className="sr-only">Toggle voting for {category.name}</span>
                            <span
                              className={cn(
                                "pointer-events-none inline-block size-3 transform rounded-none bg-white shadow-sm transition duration-200 ease-in-out",
                                editIsVotingOpen ? "translate-x-3" : "translate-x-0",
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200/70 pt-2.5 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSavingEdit}
                        onClick={handleCancelEdit}
                        className="h-7 rounded-none text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingEdit || !editName.trim()}
                        onClick={() => handleSaveEdit(category.id)}
                        className="h-7 gap-1 rounded-none bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
                  key={category.id}
                  className="group relative flex flex-col justify-between rounded-none border border-slate-200/90 bg-white p-3.5 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {category.name}
                          </span>
                        </div>
                        {category.description && (
                          <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${category.name}`}
                          disabled={isAnyActionBlocked}
                          onClick={() => handleStartEdit(category)}
                          className="size-7 rounded-none text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          title="Edit award category"
                        >
                          <Pencil className="size-3.5" />
                          <span className="sr-only">Edit award {category.name}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isAnyActionBlocked}
                          onClick={() => onDeleteRequest(category)}
                          className="size-7 rounded-none text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          title="Delete award category"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete award {category.name}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Voting Toggle Row */}
                    <div className="mt-3 flex items-center justify-between rounded-none border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Vote className="size-3 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Voting Status:
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-none px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors",
                            category.isVotingOpen
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
                          )}
                        >
                          {category.isVotingOpen ? "VOTING OPEN" : "JUDGED ONLY"}
                        </Badge>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={category.isVotingOpen}
                          disabled={isAnyActionBlocked || isToggling}
                          onClick={() => handleToggle(category)}
                          className={cn(
                            "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
                            category.isVotingOpen
                              ? "bg-emerald-600"
                              : "bg-slate-300 dark:bg-slate-700",
                          )}
                        >
                          <span className="sr-only">Toggle voting for {category.name}</span>
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-3 transform rounded-none bg-white shadow-sm transition duration-200 ease-in-out",
                              category.isVotingOpen ? "translate-x-3" : "translate-x-0",
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      <span>{category.contestantCount ?? 0} assigned</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <Hash className="size-2.5" />
                      <span>Order: {category.displayOrder}</span>
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
