"use client";

import React from "react";
import Image from "next/image";
import type { LeaderboardEntry } from "../types";

interface LeaderboardRosterProps {
  entries: LeaderboardEntry[];
  isFrozen?: boolean;
}

export function LeaderboardRoster({
  entries,
  isFrozen = false,
}: LeaderboardRosterProps): React.JSX.Element | null {
  // If not frozen, show ranks > 3. If frozen, show all entries as a neutral list.
  const rosterEntries = isFrozen
    ? entries
    : entries.filter((e) => !e.isPodium && (e.rank === null || e.rank > 3));

  if (rosterEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-300 pb-2 dark:border-slate-800">
        <h3 className="font-heading text-lg font-extrabold tracking-wide text-slate-900 uppercase dark:text-white">
          {isFrozen ? "All Official Contestants" : "Contenders & Rising Ranks"}
        </h3>
        <p className="font-sans text-xs text-slate-600 dark:text-slate-400">
          {isFrozen
            ? "Candidate profiles listed numerically during Mystery Freeze."
            : "Live vote standings and distance to the next rank position."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {rosterEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between border border-slate-300 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700"
          >
            {/* Left: Rank / Number and Avatar */}
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 bg-slate-100 font-mono text-sm font-black text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {isFrozen || entry.rank === null ? `#${entry.contestantNumber}` : `#${entry.rank}`}
              </div>

              <div className="relative h-12 w-10 shrink-0 border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src={entry.avatarUrl}
                  alt={entry.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    Contestant #{entry.contestantNumber}
                  </span>
                  {entry.divisionName && (
                    <span className="py-0.2 border border-slate-200 bg-slate-50 px-1.5 font-sans text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      {entry.divisionName}
                    </span>
                  )}
                </div>
                <h4 className="font-heading truncate text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                  {entry.name}
                </h4>
              </div>
            </div>

            {/* Right: Vote counts & metrics or concealed badge */}
            <div className="shrink-0 text-right">
              {isFrozen ? (
                <span className="border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Hidden
                </span>
              ) : (
                <div>
                  <div className="font-mono text-base font-black text-slate-900 dark:text-white">
                    {entry.voteCount?.toLocaleString() ?? 0}
                    <span className="ml-1 font-sans text-xs font-semibold text-slate-500 dark:text-slate-400">
                      ({entry.percentageShare}%)
                    </span>
                  </div>
                  {entry.gapToAhead > 0 && (
                    <div className="mt-0.5 font-sans text-[11px] font-medium text-sky-700 dark:text-sky-400">
                      +{entry.gapToAhead.toLocaleString()} to pass next rank
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
