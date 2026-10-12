"use client";

import React, { useTransition } from "react";
import { useQueryState, parseAsStringLiteral, parseAsString, parseAsInteger } from "nuqs";
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCw } from "lucide-react";
import type { UserSession } from "@/lib/auth/get-session";
import type { OrganizerEventItemDto, DashboardMetricsDto } from "../../types/dashboard-overview";
import { filterAndPaginateEvents } from "../../utils/dashboard-metrics";
import { DashboardGreetingBanner } from "./DashboardGreetingBanner";
import { DashboardMetricsCards } from "./DashboardMetricsCards";
import { EventCard } from "./EventCard";
import { DashboardEmptyState } from "./DashboardEmptyState";

export interface EventsDashboardClientProps {
  events: OrganizerEventItemDto[];
  metrics: DashboardMetricsDto;
  user: UserSession;
}

const STATUS_OPTIONS = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;

export function EventsDashboardClient({
  events,
  metrics,
  user,
}: Readonly<EventsDashboardClientProps>): React.JSX.Element {
  const [, startTransition] = useTransition();

  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_OPTIONS)
      .withDefault("ALL")
      .withOptions({ shallow: true, history: "push", startTransition }),
  );

  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: true, history: "push", startTransition }),
  );

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true, history: "push", startTransition }),
  );

  if (events.length === 0) {
    return (
      <div className="space-y-8">
        <DashboardGreetingBanner user={user} metrics={metrics} />
        <DashboardMetricsCards metrics={metrics} />
        <DashboardEmptyState />
      </div>
    );
  }

  const {
    items,
    totalFiltered,
    totalPages,
    currentPage: validPage,
  } = filterAndPaginateEvents(events, {
    status,
    q: searchQuery,
    page: currentPage,
    limit: 12,
  });

  const handleStatusChange = async (newStatus: (typeof STATUS_OPTIONS)[number]) => {
    await setStatus(newStatus);
    await setCurrentPage(1);
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await setSearchQuery(e.target.value);
    await setCurrentPage(1);
  };

  const handleClearSearch = async () => {
    await setSearchQuery("");
    await setCurrentPage(1);
  };

  const handleResetFilters = async () => {
    await setStatus("ALL");
    await setSearchQuery("");
    await setCurrentPage(1);
  };

  const statusTabs = [
    { value: "ALL", label: "All", count: events.length },
    { value: "PUBLISHED", label: "Live", count: metrics.liveEvents },
    {
      value: "DRAFT",
      label: "Drafts",
      count: events.filter((e) => e.publicationStatus === "DRAFT").length,
    },
    {
      value: "ARCHIVED",
      label: "Past",
      count: events.filter((e) => e.publicationStatus === "ARCHIVED" || e.isEnded).length,
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* 1. Header Greeting Banner */}
      <DashboardGreetingBanner user={user} metrics={metrics} />

      {/* 2. Key Metrics Cards */}
      <DashboardMetricsCards metrics={metrics} />

      {/* 3. Filter & Search Controls Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Your Managed Events
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select an event to view candidates, manage voting rules, or configure branding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-2.5 left-3 size-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-none border border-slate-300 bg-white py-2 pr-8 pl-9 text-xs text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-hidden dark:border-slate-800 dark:bg-[#0d1424] dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tab Pills */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={status === tab.value}
                  onClick={() => handleStatusChange(tab.value)}
                  className={`rounded-none border px-3 py-1.5 transition-colors ${
                    status === tab.value
                      ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Events Cards Grid or Filter Zero-State */}
        {totalFiltered === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-slate-400 p-12 text-center dark:border-slate-700">
            <SlidersHorizontal className="size-10 text-slate-500 dark:text-slate-400" />
            <p className="font-heading mt-3 text-sm font-extrabold text-slate-900 dark:text-slate-100">
              No matching events found
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              No events match your current search query or status filter.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-none border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <RefreshCw className="size-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* 5. Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing page{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">{validPage}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span> (
              {totalFiltered} total events)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(Math.max(1, validPage - 1))}
                className="inline-flex items-center gap-1 rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, validPage + 1))}
                className="inline-flex items-center gap-1 rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
