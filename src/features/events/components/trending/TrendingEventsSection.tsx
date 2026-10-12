"use client";

import React, { Suspense, useMemo, useCallback } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import {
  EVENT_LIFECYCLE_FILTERS,
  type EventLifecycleFilter,
  type PublicEventDto,
} from "../../types";
import { useTrendingEvents } from "../../hooks/useTrendingEvents";
import { filterEventsByLifecycle } from "../../utils/trending-helpers";
import { EventLifecycleFilters } from "./EventLifecycleFilters";
import { TrendingEventsGrid } from "./TrendingEventsGrid";

function TrendingEventsInner(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useQueryState(
    "status",
    parseAsStringLiteral(EVENT_LIFECYCLE_FILTERS).withDefault("all").withOptions({
      shallow: true,
      history: "push",
    }),
  );

  const { data: response, isLoading } = useTrendingEvents();
  const allEvents: PublicEventDto[] = useMemo(() => response?.data ?? [], [response?.data]);

  // Compute count badges across published items
  const counts = useMemo(() => {
    const published = allEvents.filter((e) => e.operationalState !== "Draft");
    return {
      all: published.length,
      active: published.filter((e) => e.operationalState === "Active").length,
      scheduled: published.filter((e) => e.operationalState === "Scheduled").length,
      closed: published.filter((e) => e.operationalState === "Closed").length,
    };
  }, [allEvents]);

  // Filter events based on active tab
  const filteredEvents = useMemo(
    () => filterEventsByLifecycle(allEvents, activeFilter),
    [allEvents, activeFilter],
  );

  const handleFilterChange = useCallback(
    (newFilter: EventLifecycleFilter) => {
      void setActiveFilter(newFilter);
    },
    [setActiveFilter],
  );

  const handleResetFilter = useCallback(() => {
    void setActiveFilter("all");
  }, [setActiveFilter]);

  return (
    <section aria-labelledby="trending-events-heading" className="w-full space-y-8">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-none border border-slate-300 bg-white px-3 py-1 text-[11px] font-extrabold tracking-widest text-slate-800 uppercase shadow-xs dark:border-slate-800 dark:bg-white/5 dark:text-slate-200">
            <span className="h-1.5 w-1.5 bg-sky-600 dark:bg-sky-400" />
            Live & Scheduled Pageants
          </div>

          <h2
            id="trending-events-heading"
            className="heading-font mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white"
          >
            TRENDING COMPETITIONS & ELECTIONS
          </h2>

          <p className="mt-2 max-w-2xl font-sans text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            Explore authenticated public voting across premier pageants and campus elections. Filter
            by lifecycle status to discover live voting, upcoming previews, or final tallies.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="w-full md:w-auto">
          <EventLifecycleFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            counts={counts}
          />
        </div>
      </div>

      {/* Grid Content */}
      <TrendingEventsGrid
        events={filteredEvents}
        isLoading={isLoading}
        activeFilter={activeFilter}
        onResetFilter={handleResetFilter}
      />
    </section>
  );
}

export function TrendingEventsSection(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-8">
          <div className="h-20 w-full animate-pulse rounded-none border border-slate-300 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 w-full animate-pulse rounded-none border border-slate-300 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50"
              />
            ))}
          </div>
        </div>
      }
    >
      <TrendingEventsInner />
    </Suspense>
  );
}
