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
}: EventsDashboardClientProps): React.JSX.Element {
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

  const handleStatusChange = (newStatus: (typeof STATUS_OPTIONS)[number]) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatus("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };

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
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Your Managed Events
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an event to view candidate rosters, manage voting rules, or configure branding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-9 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
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
            <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleStatusChange("ALL")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  status === "ALL"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                All ({events.length})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("PUBLISHED")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  status === "PUBLISHED"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                Live ({metrics.liveEvents})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("DRAFT")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  status === "DRAFT"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                Drafts ({events.filter((e) => e.publicationStatus === "DRAFT").length})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("ARCHIVED")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  status === "ARCHIVED"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                Past ({events.filter((e) => e.publicationStatus === "ARCHIVED" || e.isEnded).length}
                )
              </button>
            </div>
          </div>
        </div>

        {/* 4. Events Cards Grid or Filter Zero-State */}
        {totalFiltered === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <SlidersHorizontal className="size-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching events found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              No events match your current search query or status filter.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
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
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, validPage + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
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
