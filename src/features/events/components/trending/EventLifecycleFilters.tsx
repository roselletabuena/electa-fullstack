import React from "react";
import { cn } from "@/lib/utils";
import type { EventLifecycleFilter, LifecycleTabOption } from "../../types";

export interface EventLifecycleFiltersProps {
  activeFilter: EventLifecycleFilter;
  onFilterChange: (filter: EventLifecycleFilter) => void;
  counts?: Partial<Record<EventLifecycleFilter, number>>;
  className?: string;
}

const TAB_CONFIGS: ReadonlyArray<Omit<LifecycleTabOption, "count">> = [
  { key: "all", label: "ALL EVENTS" },
  { key: "active", label: "LIVE VOTING" },
  { key: "scheduled", label: "UPCOMING" },
  { key: "closed", label: "CONCLUDED" },
];

export function EventLifecycleFilters({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: Readonly<EventLifecycleFiltersProps>): React.JSX.Element {
  return (
    <div
      role="tablist"
      aria-label="Filter events by competition lifecycle"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {TAB_CONFIGS.map((tab) => {
        const isSelected = activeFilter === tab.key;
        const count = counts?.[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls="trending-events-grid"
            onClick={() => onFilterChange(tab.key)}
            className={cn(
              "group inline-flex items-center gap-2 rounded-none border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
              isSelected
                ? "border-slate-900 bg-slate-900 text-white shadow-xs dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white",
            )}
          >
            {/* Live pulsing dot indicator for active tab */}
            {tab.key === "active" && (
              <span
                className={cn(
                  "h-2 w-2 shrink-0 transition-opacity",
                  isSelected
                    ? "animate-pulse bg-emerald-400 dark:bg-emerald-600"
                    : "bg-emerald-500 opacity-80",
                )}
                aria-hidden="true"
              />
            )}

            <span>{tab.label}</span>

            {typeof count === "number" && (
              <span
                className={cn(
                  "rounded-none px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold transition-colors",
                  isSelected
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-white/10 dark:text-slate-400 dark:group-hover:bg-white/20",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
