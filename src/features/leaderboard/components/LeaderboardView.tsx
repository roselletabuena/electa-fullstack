"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw, BarChart3 } from "lucide-react";
import { useLeaderboardRealtime } from "../hooks/useLeaderboardRealtime";
import { PodiumSection } from "./PodiumSection";
import { LeaderboardRoster } from "./LeaderboardRoster";
import { MysteryFreezeBanner } from "./MysteryFreezeBanner";
import { CategoryFilterTabs, type FilterOption } from "./CategoryFilterTabs";
import type { LeaderboardPayload } from "../types";

export interface LeaderboardViewProps {
  slug: string;
  initialData: LeaderboardPayload;
  divisions: FilterOption[];
  categories: FilterOption[];
  selectedDivisionId?: string | null | undefined;
  selectedCategoryId?: string | null | undefined;
}

export function LeaderboardView({
  slug,
  initialData,
  divisions,
  categories,
  selectedDivisionId,
  selectedCategoryId,
}: LeaderboardViewProps): React.JSX.Element {
  const { data, isFetching, refetch } = useLeaderboardRealtime({
    slug,
    divisionId: selectedDivisionId,
    categoryId: selectedCategoryId,
    initialData,
  });

  const leaderboardData = data ?? initialData;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb & Event Title */}
      <div className="mb-8">
        <Link
          href={`/events/${slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-slate-600 uppercase hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Official Ballot</span>
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-sky-600 bg-sky-50 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-800 uppercase dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300">
                Official Live Standings
              </span>
              {isFetching && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
                </span>
              )}
            </div>
            <h1 className="font-heading mt-2 text-3xl font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
              {leaderboardData.eventTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!leaderboardData.isFrozen && leaderboardData.totalVotes !== null && (
              <div className="border border-slate-300 bg-white px-3.5 py-2 text-right shadow-2xs dark:border-slate-800 dark:bg-[#0d1424]">
                <span className="block font-mono text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Total Verified Ballots
                </span>
                <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                  {leaderboardData.totalVotes.toLocaleString()}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              className="font-heading flex h-11 items-center gap-2 border border-slate-900 bg-slate-900 px-4 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mystery Freeze Warning Banner */}
      {leaderboardData.isFrozen && <MysteryFreezeBanner message={leaderboardData.freezeMessage} />}

      {/* Category & Division Filtering Tabs */}
      <CategoryFilterTabs
        divisions={divisions}
        categories={categories}
        selectedDivisionId={selectedDivisionId}
        selectedCategoryId={selectedCategoryId}
      />

      {/* Main Leaderboard Content */}
      {leaderboardData.entries.length === 0 ? (
        <div className="border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <BarChart3 className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="font-heading mt-3 text-base font-bold text-slate-900 dark:text-white">
            No active contestants found
          </h3>
          <p className="mt-1 font-sans text-xs text-slate-500">
            There are no candidates registered in this category yet.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <PodiumSection entries={leaderboardData.entries} isFrozen={leaderboardData.isFrozen} />

          {/* 4th place and below list */}
          <LeaderboardRoster
            entries={leaderboardData.entries}
            isFrozen={leaderboardData.isFrozen}
          />
        </>
      )}
    </div>
  );
}
