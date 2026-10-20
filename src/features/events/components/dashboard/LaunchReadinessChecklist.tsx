"use client";

import React, { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ListChecks,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LaunchReadinessSnapshot } from "../../types/launch-readiness";

export interface LaunchReadinessChecklistProps {
  snapshot: LaunchReadinessSnapshot;
  className?: string;
}

function getMilestoneCardClass(isCompleted: boolean, isNextAction: boolean): string {
  if (isCompleted) {
    return "border-slate-200 bg-slate-50/60 dark:border-slate-800/80 dark:bg-slate-900/40";
  }
  if (isNextAction) {
    return "border-sky-500 bg-sky-50/30 ring-1 ring-sky-500/30 dark:border-sky-600 dark:bg-sky-950/20";
  }
  return "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70";
}

function getMilestoneActionClass(isNextAction: boolean): string {
  if (isNextAction) {
    return "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200";
  }
  return "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
}

export function LaunchReadinessChecklist({
  snapshot,
  className,
}: Readonly<LaunchReadinessChecklistProps>): React.JSX.Element | null {
  const storageKey = `electa_dismissed_readiness_${snapshot.eventId}`;
  const collapseStorageKey = `electa_collapsed_readiness_${snapshot.eventId}`;

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  }, [storageKey]);

  const getCollapseSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(collapseStorageKey) === "true";
    } catch {
      return false;
    }
  }, [collapseStorageKey]);

  const getServerSnapshot = () => false;

  const isDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isCollapsed = useSyncExternalStore(subscribe, getCollapseSnapshot, getServerSnapshot);

  const toggleCollapsed = () => {
    if (typeof window !== "undefined") {
      try {
        const next = !isCollapsed;
        localStorage.setItem(collapseStorageKey, String(next));
        window.dispatchEvent(new Event("storage"));
      } catch {
        // Safe fallback in restricted environments
      }
    }
  };

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, "true");
        window.dispatchEvent(new Event("storage"));
      } catch {
        // Safe fallback in restricted environments
      }
    }
  };

  // If already dismissed permanently, render nothing
  if (isDismissed) {
    return null;
  }

  // Published State: Render compact "Ready & Live" indicator
  if (snapshot.publicationStatus === "PUBLISHED") {
    return (
      <div
        role="region"
        aria-label="Launch Readiness Status"
        className={cn(
          "mb-6 flex flex-col gap-3 rounded-none border border-emerald-300 bg-emerald-50/80 p-4 text-emerald-950 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800/80 dark:bg-emerald-950/30 dark:text-emerald-200",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center border border-emerald-400 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/60">
            <Sparkles className="size-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-bold tracking-tight text-emerald-950 dark:text-emerald-100">
              Competition is Ready & Live!
            </h2>
            <p className="font-sans text-xs text-emerald-800 dark:text-emerald-300">
              All initial setup milestones are fulfilled. Public voting and contestant profiles are
              active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="cursor-pointer gap-1.5 rounded-none border-emerald-400 bg-white/80 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/80"
          >
            <X className="size-3.5" />
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  // Draft State: Embedded 4-Step Checklist Card with Collapse Toggle
  const nextIncompleteItem = snapshot.items.find((item) => !item.isCompleted) ?? null;

  return (
    <section
      role="region"
      aria-label="Launch Readiness Checklist"
      className={cn(
        "mb-6 rounded-none border border-slate-300 bg-white shadow-xs transition-all dark:border-slate-800 dark:bg-[#0d1424]",
        isCollapsed ? "p-3 sm:px-4 sm:py-3" : "p-4 sm:p-5",
        className,
      )}
    >
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <ListChecks className="size-4" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-sm font-extrabold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
              Launch Readiness Checklist
            </h2>
            <Badge
              variant="outline"
              className="rounded-none border-slate-300 bg-slate-100 font-mono text-[10px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {snapshot.completedMilestones} of {snapshot.totalMilestones} Completed
            </Badge>

            {/* In collapsed mode, show next action inline */}
            {isCollapsed && nextIncompleteItem && (
              <span className="hidden items-center gap-1.5 font-sans text-xs text-slate-600 lg:inline-flex dark:text-slate-400">
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>Next:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {nextIncompleteItem.title}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick next action button when collapsed */}
          {isCollapsed && nextIncompleteItem && (
            <Link
              href={nextIncompleteItem.actionHref}
              className="font-heading inline-flex items-center gap-1.5 border border-slate-900 bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-colors hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <span>{nextIncompleteItem.actionLabel}</span>
              <ArrowRight className="size-3" />
            </Link>
          )}

          {/* Minimize / Expand Toggle Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            aria-label={
              isCollapsed
                ? "Expand launch readiness checklist"
                : "Minimize launch readiness checklist"
            }
            aria-expanded={!isCollapsed}
            className="cursor-pointer gap-1.5 rounded-none border border-slate-300 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="size-3.5 text-slate-600 dark:text-slate-400" />
                <span>Expand</span>
              </>
            ) : (
              <>
                <ChevronUp className="size-3.5 text-slate-600 dark:text-slate-400" />
                <span>Minimize</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar (Always present for accessibility and instant orientation) */}
      <div className={cn("space-y-1.5", isCollapsed ? "mt-2.5" : "mt-4")}>
        <div className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
          <span className="text-[11px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Overall Readiness
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-200">
            {snapshot.percentageComplete}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={snapshot.percentageComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Readiness Progress"
          className="h-1.5 w-full overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className={cn(
              "h-full transition-all duration-300",
              snapshot.isAllCompleted
                ? "bg-emerald-600 dark:bg-emerald-500"
                : "bg-sky-600 dark:bg-sky-500",
            )}
            style={{ width: `${snapshot.percentageComplete}%` }}
          />
        </div>
      </div>

      {/* Expanded Content: Subtitle & 4 Milestones Cards */}
      {!isCollapsed && (
        <>
          <p className="mt-2.5 font-sans text-xs text-slate-600 dark:text-slate-400">
            Complete these essential setup tasks before opening your competition to public voting.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {snapshot.items.map((item) => {
              const isNextAction = !item.isCompleted && item.id === nextIncompleteItem?.id;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col justify-between border p-3.5 transition-all",
                    getMilestoneCardClass(item.isCompleted, isNextAction),
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                      {item.isCompleted ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle
                          className={cn(
                            "size-4 shrink-0",
                            isNextAction
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-slate-400 dark:text-slate-600",
                          )}
                        />
                      )}
                    </div>
                    <p className="mt-1 font-sans text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3.5 border-t border-slate-200/60 pt-2.5 dark:border-slate-800">
                    {item.isCompleted ? (
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span>Completed</span>
                        <Link
                          href={item.actionHref}
                          className="px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200/60 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          View
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={item.actionHref}
                        className={cn(
                          "inline-flex w-full items-center justify-between px-2.5 py-1.5 text-xs font-bold shadow-2xs transition-colors",
                          getMilestoneActionClass(isNextAction),
                        )}
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
