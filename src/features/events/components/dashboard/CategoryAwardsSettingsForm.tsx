"use client";

import React, { useState } from "react";
import { Layers, Award, Vote, Sparkles, AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useEventTaxonomy,
  useCreateDivision,
  useDeleteDivision,
  useCreateAwardCategory,
  useUpdateAwardCategory,
  useDeleteAwardCategory,
  useApplyTaxonomyPreset,
} from "../../hooks/useEventTaxonomy";
import { TaxonomyPresetsCard } from "./TaxonomyPresetsCard";
import { DivisionsSection } from "./DivisionsSection";
import { AwardCategoriesSection } from "./AwardCategoriesSection";
import { TaxonomyDeleteDialog, type DeletionTarget } from "./TaxonomyDeleteDialog";
import type { DivisionDto, AwardCategoryDto } from "../../types";
import type { TaxonomyPreset } from "../../constants/taxonomy-presets";
import type { Event } from "@/generated/client/client";
import { cn } from "@/lib/utils";

export interface CategoryAwardsSettingsFormProps {
  event: Event;
  className?: string;
}

export function CategoryAwardsSettingsForm({
  event,
  className,
}: CategoryAwardsSettingsFormProps): React.JSX.Element {
  const { data: taxonomy, isLoading, isError, error, refetch } = useEventTaxonomy(event.slug);

  const createDivisionMutation = useCreateDivision(event.slug);
  const deleteDivisionMutation = useDeleteDivision(event.slug);

  const createAwardCategoryMutation = useCreateAwardCategory(event.slug);
  const updateAwardCategoryMutation = useUpdateAwardCategory(event.slug);
  const deleteAwardCategoryMutation = useDeleteAwardCategory(event.slug);

  const applyPresetMutation = useApplyTaxonomyPreset(event.slug);

  // Deletion guard modal state
  const [deleteTarget, setDeleteTarget] = useState<DeletionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const divisions = taxonomy?.divisions ?? [];
  const awardCategories = taxonomy?.awardCategories ?? [];
  const openVotingAwardsCount = awardCategories.filter((a) => a.isVotingOpen).length;

  const handleApplyPreset = async (preset: TaxonomyPreset) => {
    setNotification(null);
    try {
      const result = await applyPresetMutation.mutateAsync(preset);
      setNotification({
        type: "success",
        message: `Applied "${preset.title}" preset: Created ${result.divisionsCreated} divisions and ${result.awardsCreated} award tracks!`,
      });
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to apply preset",
      });
    }
  };

  const handleOpenDeleteDivision = (division: DivisionDto) => {
    setDeleteTarget({
      type: "division",
      id: division.id,
      name: division.name,
      contestantCount: division.contestantCount ?? 0,
    });
  };

  const handleOpenDeleteAwardCategory = (category: AwardCategoryDto) => {
    setDeleteTarget({
      type: "awardCategory",
      id: category.id,
      name: category.name,
      contestantCount: category.contestantCount ?? 0,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setNotification(null);

    try {
      if (deleteTarget.type === "division") {
        await deleteDivisionMutation.mutateAsync(deleteTarget.id);
        setNotification({
          type: "success",
          message: `Division "${deleteTarget.name}" deleted successfully.`,
        });
      } else {
        await deleteAwardCategoryMutation.mutateAsync(deleteTarget.id);
        setNotification({
          type: "success",
          message: `Award category "${deleteTarget.name}" deleted successfully.`,
        });
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete item.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAwardVoting = async (categoryId: string, isVotingOpen: boolean) => {
    setNotification(null);
    try {
      await updateAwardCategoryMutation.mutateAsync({
        categoryId,
        data: { isVotingOpen },
      });
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update voting status.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="size-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Loading competition categories and awards...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900/60 dark:bg-red-950/20">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
            <h3 className="mt-3 text-sm font-bold text-red-900 dark:text-red-200">
              Failed to load categories
            </h3>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : "An unexpected network error occurred."}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-4 gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="size-3.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Banner Header with Metrics */}
      <Card className="border-slate-200 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Categories & Award Tracks
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                Structure competition brackets, customize award categories, and control public
                voting availability.
              </CardDescription>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                <Layers className="size-3 text-indigo-500" />
                {divisions.length} Divisions
              </Badge>
              <Badge variant="muted" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                <Award className="size-3 text-amber-500" />
                {awardCategories.length} Award Tracks
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 px-2.5 py-1 text-xs font-medium",
                  openVotingAwardsCount > 0
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
                )}
              >
                <Vote className="size-3" />
                {openVotingAwardsCount} Voting Open
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Global Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-center justify-between gap-3 rounded-none border p-4 text-xs font-semibold shadow-xs transition-all",
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
          )}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <Sparkles className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="cursor-pointer text-xs font-bold tracking-wider uppercase underline opacity-75 transition-opacity hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1-Click Presets Selection */}
      <TaxonomyPresetsCard
        onApplyPreset={handleApplyPreset}
        isApplying={applyPresetMutation.isPending}
      />

      {/* Divisions Configuration Section */}
      <DivisionsSection
        slug={event.slug}
        divisions={divisions}
        isLoading={createDivisionMutation.isPending || deleteDivisionMutation.isPending}
        onAddDivision={async (data) => {
          await createDivisionMutation.mutateAsync(data);
          setNotification({
            type: "success",
            message: `Division "${data.name}" added successfully!`,
          });
        }}
        onDeleteRequest={handleOpenDeleteDivision}
      />

      {/* Award Tracks & Voting Availability Section */}
      <AwardCategoriesSection
        slug={event.slug}
        awardCategories={awardCategories}
        isLoading={
          createAwardCategoryMutation.isPending ||
          updateAwardCategoryMutation.isPending ||
          deleteAwardCategoryMutation.isPending
        }
        onAddCategory={async (data) => {
          await createAwardCategoryMutation.mutateAsync(data);
          setNotification({
            type: "success",
            message: `Award category "${data.name}" added successfully!`,
          });
        }}
        onToggleVoting={handleToggleAwardVoting}
        onDeleteRequest={handleOpenDeleteAwardCategory}
      />

      {/* Referential Integrity Deletion Blocker & Confirmation Dialog */}
      <TaxonomyDeleteDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        target={deleteTarget}
        isDeleting={isDeleting}
      />
    </div>
  );
}
