"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, Plus, Trash2, Users, Loader2, AlertCircle, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createDivisionSchema,
  type CreateDivisionInput,
  type CreateDivisionFormInput,
} from "@/lib/validations/division";
import type { DivisionDto } from "../../types";
import { cn } from "@/lib/utils";

export interface DivisionsSectionProps {
  slug: string;
  divisions: DivisionDto[];
  isLoading: boolean;
  onAddDivision: (input: CreateDivisionInput) => Promise<void>;
  onDeleteRequest: (division: DivisionDto) => void;
  disabled?: boolean;
}

export function DivisionsSection({
  divisions,
  isLoading,
  onAddDivision,
  onDeleteRequest,
  disabled = false,
}: Readonly<DivisionsSectionProps>): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add division");
    }
  };

  const isBusy = isLoading || isSubmitting || disabled;

  return (
    <Card className="border-slate-200 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Competition Divisions & Brackets
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Define gender, age, or skill categories (e.g., &quot;Female&quot;, &quot;Male&quot;,
              &quot;Teen&quot;, &quot;Varsity&quot;).
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 text-xs font-semibold dark:border-slate-800 dark:bg-slate-800"
            >
              {divisions.length} Active Division{divisions.length !== 1 ? "s" : ""}
            </Badge>
            {!isAdding && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isBusy}
                onClick={() => setIsAdding(true)}
                className="gap-1.5 text-xs font-semibold"
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
            className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 transition-all dark:border-indigo-900/60 dark:bg-indigo-950/20"
          >
            <div className="flex items-center justify-between pb-3">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                New Division
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  reset();
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            {submitError && (
              <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="space-y-1 sm:col-span-6">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Division Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Female Division, Junior Bracket"
                  {...register("name")}
                  className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
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
                  placeholder="e.g. Ages 13-17"
                  {...register("description")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Order
                </label>
                <input
                  type="number"
                  min={0}
                  {...register("displayOrder", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  reset();
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Layers className="size-5" />
            </div>
            <h4 className="mt-3 text-xs font-bold text-slate-900 dark:text-slate-100">
              No Divisions Configured
            </h4>
            <p className="mt-1 max-w-sm text-[11px] text-slate-500 dark:text-slate-400">
              Add custom competition brackets or apply a preset above to group your contestants.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => setIsAdding(true)}
              className="mt-4 gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              Add First Division
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((division) => (
              <div
                key={division.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {division.name}
                      </span>
                    </div>
                    {division.description && (
                      <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {division.description}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isBusy}
                    onClick={() => onDeleteRequest(division)}
                    className="size-7 text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    title="Delete division"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete division {division.name}</span>
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="size-3 text-slate-400" />
                    <span>{division.contestantCount ?? 0} contestants</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <Hash className="size-2.5" />
                    <span>Order: {division.displayOrder}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
