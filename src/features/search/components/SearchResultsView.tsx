"use client";

import React from "react";
import Link from "next/link";
import { Calendar, User, Award, ArrowUpRight, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResultsDto } from "../types";

export interface SearchResultsViewProps {
  results: SearchResultsDto | null;
  isLoading?: boolean;
  onClearQuery?: () => void;
  className?: string;
}

export function SearchResultsView({
  results,
  isLoading = false,
  onClearQuery,
  className,
}: Readonly<SearchResultsViewProps>) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full border border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0d1424]",
          className,
        )}
      >
        <p className="font-sans text-sm text-slate-600 dark:text-slate-400">
          Searching events, categories, and contestants...
        </p>
      </div>
    );
  }

  if (!results || !results.query) {
    return null;
  }

  const hasMatches = results.totalMatches > 0;

  if (!hasMatches) {
    return (
      <div
        id="search-results"
        className={cn(
          "w-full border border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0d1424]",
          className,
        )}
      >
        <SearchX className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
        <h3 className="font-heading mt-3 text-base font-extrabold text-slate-900 dark:text-slate-100">
          No matches found for &ldquo;{results.query}&rdquo;
        </h3>
        <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-400">
          Check spelling or try searching for another pageant, university, or candidate.
        </p>
        {onClearQuery && (
          <button
            type="button"
            onClick={onClearQuery}
            className="font-heading mt-4 inline-flex h-8 items-center justify-center rounded-none border border-slate-300 px-3 text-xs font-bold tracking-wider text-slate-800 uppercase hover:border-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:bg-slate-800"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="search-results"
      className={cn(
        "w-full space-y-6 border border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-[#0d1424]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <h2 className="font-heading text-sm font-extrabold tracking-wider text-slate-900 uppercase dark:text-slate-100">
          Search Results for &ldquo;{results.query}&rdquo; ({results.totalMatches})
        </h2>
        {onClearQuery && (
          <button
            type="button"
            onClick={onClearQuery}
            className="font-heading text-xs font-bold text-sky-600 hover:underline dark:text-sky-400"
          >
            Reset
          </button>
        )}
      </div>

      {/* Events Section */}
      {results.events.length > 0 && (
        <section aria-labelledby="search-events-heading">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <h3 id="search-events-heading">Events ({results.events.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group flex items-start justify-between border border-slate-200 p-3 transition-colors hover:border-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-900/50"
              >
                <div>
                  <h4 className="font-heading text-sm font-bold text-slate-900 group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
                    {event.title}
                  </h4>
                  <p className="mt-1 line-clamp-1 font-sans text-xs text-slate-500 dark:text-slate-400">
                    {event.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-200" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contestants Section */}
      {results.contestants.length > 0 && (
        <section aria-labelledby="search-contestants-heading">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            <User className="h-3.5 w-3.5" />
            <h3 id="search-contestants-heading">Contestants ({results.contestants.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.contestants.map((c) => (
              <Link
                key={c.id}
                href={`/events/${c.eventSlug}`}
                className="group flex items-center justify-between border border-slate-200 p-3 transition-colors hover:border-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-900/50"
              >
                <div>
                  <h4 className="font-heading text-sm font-bold text-slate-900 group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
                    #{c.contestantNumber} {c.name}
                  </h4>
                  <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
                    {c.hometown ? `${c.hometown} · ` : ""}
                    {c.eventTitle}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-200" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      {results.categories.length > 0 && (
        <section aria-labelledby="search-categories-heading">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            <Award className="h-3.5 w-3.5" />
            <h3 id="search-categories-heading">Award Categories ({results.categories.length})</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/events/${cat.eventSlug}`}
                className="group flex items-center justify-between border border-slate-200 p-3 transition-colors hover:border-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-900/50"
              >
                <div>
                  <h4 className="font-heading text-sm font-bold text-slate-900 group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
                    {cat.name}
                  </h4>
                  <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
                    {cat.eventTitle}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-200" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
