import React from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventLifecycleFilter, PublicEventDto } from "../../types";
import { TrendingEventCard } from "./TrendingEventCard";

export interface TrendingEventsGridProps {
  events: PublicEventDto[];
  isLoading: boolean;
  activeFilter: EventLifecycleFilter;
  onResetFilter: () => void;
  className?: string;
}

function getFilterDisplayName(filter: EventLifecycleFilter): string {
  switch (filter) {
    case "active":
      return "live voting";
    case "scheduled":
      return "upcoming";
    case "closed":
      return "concluded";
    default:
      return "";
  }
}

export function TrendingEventsGrid({
  events,
  isLoading,
  activeFilter,
  onResetFilter,
  className,
}: Readonly<TrendingEventsGridProps>): React.JSX.Element {
  if (isLoading) {
    return (
      <div
        id="trending-events-grid"
        className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
      >
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            data-testid="event-card-skeleton"
            className="flex animate-pulse flex-col rounded-none border border-slate-300 bg-white dark:border-slate-800 dark:bg-[#0d1424]"
          >
            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-800/60" />
              </div>
              <div className="pt-4">
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    const filterName = getFilterDisplayName(activeFilter);

    return (
      <div
        id="trending-events-grid"
        className={cn(
          "flex flex-col items-center justify-center rounded-none border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-slate-800 dark:bg-white/[0.02]",
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-none border border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-white/5 dark:text-slate-400">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="heading-font mt-4 text-base font-extrabold tracking-tight text-slate-900 uppercase dark:text-white">
          No events found {filterName ? `in ${filterName}` : ""}
        </h3>

        <p className="mt-2 max-w-md font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          There are currently no published competitions matching this lifecycle filter. Select
          another category or reset to view all events.
        </p>

        <button
          type="button"
          onClick={onResetFilter}
          className="mt-6 inline-flex items-center gap-2 rounded-none border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition-colors hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Filter</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="trending-events-grid"
      className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {events.map((event) => (
        <TrendingEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
