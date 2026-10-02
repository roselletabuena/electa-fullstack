"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import type { LeaderboardEntry } from "../types";

interface LeaderboardRosterProps {
  entries: LeaderboardEntry[];
  isFrozen?: boolean;
}

export function LeaderboardRoster({
  entries,
  isFrozen = false,
}: LeaderboardRosterProps): React.JSX.Element | null {
  if (entries.length === 0) {
    return null;
  }

  const getRankBadge = (entry: LeaderboardEntry) => {
    if (isFrozen || entry.rank === null) {
      return (
        <span className="inline-flex h-8 min-w-8 items-center justify-center border border-slate-300 bg-slate-100 px-2 font-mono text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          #{entry.contestantNumber}
        </span>
      );
    }

    if (entry.rank === 1) {
      return (
        <span className="font-heading inline-flex h-8 items-center gap-1 border border-amber-500 bg-amber-500 px-2.5 text-xs font-black tracking-wider text-slate-950 uppercase shadow-xs">
          <Trophy className="h-3.5 w-3.5" />
          <span>#1 GOLD</span>
        </span>
      );
    }

    if (entry.rank === 2) {
      return (
        <span className="font-heading inline-flex h-8 items-center gap-1 border border-slate-400 bg-slate-200 px-2.5 text-xs font-black tracking-wider text-slate-900 uppercase dark:border-slate-600 dark:bg-slate-700 dark:text-white">
          <Medal className="h-3.5 w-3.5" />
          <span>#2 SILVER</span>
        </span>
      );
    }

    if (entry.rank === 3) {
      return (
        <span className="font-heading inline-flex h-8 items-center gap-1 border border-orange-600 bg-orange-600 px-2.5 text-xs font-black tracking-wider text-white uppercase dark:border-orange-500 dark:bg-orange-500 dark:text-slate-950">
          <Award className="h-3.5 w-3.5" />
          <span>#3 BRONZE</span>
        </span>
      );
    }

    return (
      <span className="inline-flex h-8 min-w-8 items-center justify-center border border-slate-300 bg-slate-50 px-2 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
        #{entry.rank}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="border-b border-slate-300 pb-3 dark:border-slate-800">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-xs font-bold tracking-wider text-sky-700 uppercase dark:text-sky-400">
              Full Standings Matrix
            </span>
            <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
              {isFrozen ? "All Official Contestants" : "Overall Official Ranking"}
            </h3>
          </div>
          <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
            {entries.length} {entries.length === 1 ? "Candidate" : "Candidates"} Total
          </span>
        </div>
      </div>

      {/* Unified Table View */}
      <div className="overflow-x-auto border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <tr>
              <th className="px-5 py-3.5">Rank</th>
              <th className="px-5 py-3.5">Contestant</th>
              <th className="px-5 py-3.5">Division</th>
              <th className="px-5 py-3.5 text-right">Votes & Share</th>
              <th className="px-5 py-3.5 text-right">Gap Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              >
                {/* Rank Badge */}
                <td className="px-5 py-4 align-middle whitespace-nowrap">{getRankBadge(entry)}</td>

                {/* Candidate Info */}
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                      <Image
                        src={entry.avatarUrl}
                        alt={entry.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="font-heading font-extrabold text-slate-900 sm:text-sm dark:text-white">
                        {entry.name}
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Contestant #{String(entry.contestantNumber).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Division Tag */}
                <td className="px-5 py-4 align-middle whitespace-nowrap">
                  {entry.divisionName ? (
                    <span className="border border-slate-200 bg-slate-100/80 px-2 py-0.5 font-sans text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {entry.divisionName}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Votes & Share */}
                <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                  {isFrozen || entry.voteCount === null ? (
                    <span className="border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      Concealed
                    </span>
                  ) : (
                    <div>
                      <span className="font-mono text-sm font-black text-slate-900 sm:text-base dark:text-white">
                        {entry.voteCount.toLocaleString()}
                      </span>
                      <div className="font-sans text-[11px] font-semibold text-slate-500 uppercase dark:text-slate-400">
                        {entry.percentageShare}% of total
                      </div>
                    </div>
                  )}
                </td>

                {/* Gap Status */}
                <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                  {isFrozen ? (
                    <span className="font-mono text-[11px] text-slate-400">—</span>
                  ) : entry.rank === 1 ? (
                    <span className="inline-flex items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-1 font-sans text-xs font-bold text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      <Flame className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      <span>Leader</span>
                    </span>
                  ) : entry.isPodium ? (
                    <span className="font-sans text-xs font-medium text-sky-700 dark:text-sky-400">
                      Needs{" "}
                      <strong className="font-mono font-bold">
                        {entry.gapToLeader.toLocaleString()}
                      </strong>{" "}
                      for 1st
                    </span>
                  ) : (
                    <span className="font-sans text-xs font-medium text-slate-600 dark:text-slate-300">
                      +
                      <strong className="font-mono font-bold">
                        {entry.gapToAhead.toLocaleString()}
                      </strong>{" "}
                      to pass next
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
