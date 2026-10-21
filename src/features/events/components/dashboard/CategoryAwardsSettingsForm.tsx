"use client";

import React, { useState } from "react";
import { Sparkles, AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useEventTaxonomy,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
  useCreateAwardCategory,
  useUpdateAwardCategory,
  useDeleteAwardCategory,
  useCreateEventPosition,
  useDeleteEventPosition,
} from "../../hooks/useEventTaxonomy";
import { DivisionsSection } from "./DivisionsSection";
import { AwardCategoriesSection } from "./AwardCategoriesSection";
import { PositionsSection } from "./PositionsSection";
import { TaxonomyDeleteDialog, type DeletionTarget } from "./TaxonomyDeleteDialog";
import type { DivisionDto, AwardCategoryDto } from "../../types";
import { EVENT_ARCHETYPE_CONFIGS, type EventArchetype } from "../../types/archetype";
import type { UpdateDivisionInput } from "@/lib/validations/division";
import type { UpdateAwardCategoryInput } from "@/lib/validations/category-awards";
import type { Event } from "@/generated/client/client";
import { cn } from "@/lib/utils";

export interface CategoryAwardsSettingsFormProps {
  event: Event;
  className?: string;
}

export function CategoryAwardsSettingsForm({
  event,
  className,
}: Readonly<CategoryAwardsSettingsFormProps>): React.JSX.Element {
  const { data: taxonomy, isLoading, isError, error, refetch } = useEventTaxonomy(event.slug);

  const createDivisionMutation = useCreateDivision(event.slug);
  const updateDivisionMutation = useUpdateDivision(event.slug);
  const deleteDivisionMutation = useDeleteDivision(event.slug);

  const createAwardCategoryMutation = useCreateAwardCategory(event.slug);
  const updateAwardCategoryMutation = useUpdateAwardCategory(event.slug);
  const deleteAwardCategoryMutation = useDeleteAwardCategory(event.slug);

  const createPositionMutation = useCreateEventPosition(event.slug);
  const deletePositionMutation = useDeleteEventPosition(event.slug);

  // Deletion guard modal state
  const [deleteTarget, setDeleteTarget] = useState<DeletionTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingDivision, setIsEditingDivision] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const archetype: EventArchetype = (event.archetype ??
    taxonomy?.archetype ??
    "PAGEANT") as EventArchetype;
  const isPositionBased =
    archetype === "STUDENT_COUNCIL" || archetype === "HACKATHON" || archetype === "CUSTOM";
  const config = EVENT_ARCHETYPE_CONFIGS[archetype];

  const positions = taxonomy?.positions ?? [];
  const divisions = taxonomy?.divisions ?? [];
  const awardCategories = taxonomy?.awardCategories ?? [];

  const handleUpdateDivision = async (id: string, data: UpdateDivisionInput) => {
    setNotification(null);
    try {
      await updateDivisionMutation.mutateAsync({
        divisionId: id,
        data,
      });
      setNotification({
        type: "success",
        message: `Division "${data.name ?? "item"}" updated successfully!`,
      });
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update division.",
      });
      throw err;
    }
  };

  const handleUpdateAwardCategory = async (id: string, data: UpdateAwardCategoryInput) => {
    setNotification(null);
    try {
      await updateAwardCategoryMutation.mutateAsync({
        categoryId: id,
        data,
      });
      setNotification({
        type: "success",
        message: `Award category "${data.name ?? "item"}" updated successfully!`,
      });
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update award category.",
      });
      throw err;
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
        <Card className="rounded-none border border-slate-300 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="size-8 animate-spin text-sky-600 dark:text-sky-400" />
            <p className="mt-3 font-sans text-xs font-semibold text-slate-600 dark:text-slate-400">
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
        <Card className="rounded-none border border-red-200 bg-red-50/50 dark:border-red-900/60 dark:bg-red-950/20">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
            <h3 className="font-heading mt-3 text-sm font-bold text-red-900 dark:text-red-200">
              Failed to load categories
            </h3>
            <p className="mt-1 font-sans text-xs text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : "An unexpected network error occurred."}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-4 gap-1.5 rounded-none font-sans text-xs font-semibold"
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
      {/* Top Banner Header */}
      <Card className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div>
            <CardTitle className="font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {isPositionBased
                ? `${config.label} Taxonomy & Ballot Structure`
                : "Categories & Award Categories"}
            </CardTitle>
            <CardDescription className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
              {isPositionBased
                ? `Configure ${config.groupingTerm.toLowerCase()}s, voting limits, and candidate ballot slots.`
                : "Structure competition brackets, customize award categories, and control public voting availability."}
            </CardDescription>
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

      {isPositionBased ? (
        /* Positions / Tracks Configuration Section */
        <PositionsSection
          slug={event.slug}
          archetype={archetype}
          positions={positions}
          isLoading={createPositionMutation.isPending || deletePositionMutation.isPending}
          onAddPosition={async (data) => {
            await createPositionMutation.mutateAsync(data);
            setNotification({
              type: "success",
              message: `${config.groupingTerm} "${data.name}" added successfully!`,
            });
          }}
          onDeletePosition={async (positionId) => {
            await deletePositionMutation.mutateAsync(positionId);
            setNotification({
              type: "success",
              message: `${config.groupingTerm} deleted successfully.`,
            });
          }}
        />
      ) : (
        <>
          {/* Divisions Configuration Section */}
          <DivisionsSection
            slug={event.slug}
            divisions={divisions}
            isLoading={
              createDivisionMutation.isPending ||
              updateDivisionMutation.isPending ||
              deleteDivisionMutation.isPending
            }
            disabled={isEditingCategory}
            onAddDivision={async (data) => {
              await createDivisionMutation.mutateAsync(data);
              setNotification({
                type: "success",
                message: `Division "${data.name}" added successfully!`,
              });
            }}
            onUpdateDivision={handleUpdateDivision}
            onEditingChange={setIsEditingDivision}
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
            disabled={isEditingDivision}
            onAddCategory={async (data) => {
              await createAwardCategoryMutation.mutateAsync(data);
              setNotification({
                type: "success",
                message: `Award category "${data.name}" added successfully!`,
              });
            }}
            onUpdateCategory={handleUpdateAwardCategory}
            onEditingChange={setIsEditingCategory}
            onToggleVoting={handleToggleAwardVoting}
            onDeleteRequest={handleOpenDeleteAwardCategory}
          />
        </>
      )}

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
