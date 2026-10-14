import React from "react";
import { cn } from "@/lib/utils";

export type JudgingFilterMode = "ALL" | "PENDING" | "COMPLETED";

export interface JudgingProgressBarProps {
  readonly totalCount: number;
  readonly evaluatedCount: number;
  readonly activeFilter: JudgingFilterMode;
  readonly onFilterChange: (filter: JudgingFilterMode) => void;
  readonly className?: string | undefined;
}

export function JudgingProgressBar({
  totalCount,
  evaluatedCount,
  activeFilter,
  onFilterChange,
  className,
}: Readonly<JudgingProgressBarProps>): React.JSX.Element {
  const percentage =
    totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;
  const pendingCount = Math.max(0, totalCount - evaluatedCount);

  return (
    <div
      className={cn(
        "rounded-none border border-slate-300 bg-white p-4 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Evaluation Progress
            </span>
            <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
              {percentage}%
            </span>
          </div>
          <p className="mt-0.5 font-sans text-xs text-slate-600 dark:text-slate-400">
            <strong className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {evaluatedCount}/{totalCount} Evaluated
            </strong>{" "}
            ({pendingCount} pending deliberation)
          </p>
        </div>

        {/* Filter Pills */}
        <div
          role="group"
          aria-label="Filter evaluated projects"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => onFilterChange("ALL")}
            className={cn(
              "rounded-none px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
              activeFilter === "ALL"
                ? "border border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
            aria-pressed={activeFilter === "ALL"}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("PENDING")}
            className={cn(
              "rounded-none px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
              activeFilter === "PENDING"
                ? "border border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950 font-black"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
            aria-pressed={activeFilter === "PENDING"}
          >
            Pending Review ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("COMPLETED")}
            className={cn(
              "rounded-none px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
              activeFilter === "COMPLETED"
                ? "border border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950 font-black"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
            aria-pressed={activeFilter === "COMPLETED"}
          >
            Completed ({evaluatedCount})
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={evaluatedCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label="Judging progress"
        className="mt-3 h-2 w-full overflow-hidden rounded-none bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-800"
      >
        <div
          className="h-full rounded-none bg-sky-600 transition-all duration-300 ease-out dark:bg-sky-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
