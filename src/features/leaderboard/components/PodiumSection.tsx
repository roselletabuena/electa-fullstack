"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Award, Medal, Flame } from "lucide-react";
import type { LeaderboardEntry } from "../types";

interface PodiumSectionProps {
  entries: LeaderboardEntry[];
  isFrozen?: boolean;
}

export function PodiumSection({
  entries,
  isFrozen = false,
}: PodiumSectionProps): React.JSX.Element | null {
  const top3 = entries.filter((e) => e.isPodium || (e.rank && e.rank <= 3)).slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  // Visual layout order for podium: [2nd (Silver), 1st (Gold), 3rd (Bronze)]
  const firstPlace = top3.find((e) => e.rank === 1) || top3[0];
  const secondPlace = top3.find((e) => e.rank === 2) || top3[1];
  const thirdPlace = top3.find((e) => e.rank === 3) || top3[2];

  const podiumSlots = [
    {
      entry: secondPlace,
      position: 2,
      label: "2nd Place",
      icon: Medal,
      medalColor:
        "bg-slate-300 text-slate-900 border-slate-400 dark:bg-slate-700 dark:text-slate-100",
      heightClass: "md:h-72",
    },
    {
      entry: firstPlace,
      position: 1,
      label: "1st Place",
      icon: Trophy,
      medalColor:
        "bg-amber-500 text-slate-950 border-amber-600 dark:bg-amber-400 dark:text-slate-950",
      heightClass: "md:h-80",
    },
    {
      entry: thirdPlace,
      position: 3,
      label: "3rd Place",
      icon: Award,
      medalColor:
        "bg-orange-600 text-white border-orange-700 dark:bg-orange-500 dark:text-slate-950",
      heightClass: "md:h-64",
    },
  ];

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs font-bold tracking-wider text-sky-700 uppercase dark:text-sky-400">
            Official Competition Standings
          </span>
          <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl dark:text-white">
            Live Podium Leaders
          </h2>
        </div>
        {!isFrozen && (
          <div className="flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="h-2 w-2 animate-pulse bg-emerald-600 dark:bg-emerald-400" />
            <span className="font-mono text-[11px] tracking-wider uppercase">Real-time stream</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
        {podiumSlots.map(({ entry, position, label, icon: Icon, medalColor, heightClass }) => {
          if (!entry) return null;

          const isGold = position === 1;

          return (
            <div
              key={entry.id}
              className={`relative flex flex-col justify-between border bg-white p-5 shadow-sm transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700 ${heightClass} ${
                isGold
                  ? "border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-500/80"
                  : "border-slate-300"
              }`}
            >
              {/* Top Banner Rank Badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-black tracking-wider uppercase ${medalColor}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  #{entry.contestantNumber}
                </span>
              </div>

              {/* Candidate Info */}
              <div className="my-4 flex items-center gap-4">
                <div className="relative h-20 w-16 shrink-0 border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading truncate text-lg font-bold text-slate-900 dark:text-white">
                    {entry.name}
                  </h3>
                  {entry.divisionName && (
                    <p className="truncate font-sans text-xs text-slate-600 dark:text-slate-400">
                      {entry.divisionName}
                    </p>
                  )}
                  {!isFrozen && entry.voteCount !== null && (
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                        {entry.voteCount.toLocaleString()}
                      </span>
                      <span className="font-sans text-[11px] font-semibold text-slate-500 uppercase dark:text-slate-400">
                        votes ({entry.percentageShare}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Gap Indicator or Frozen Notice */}
              <div>
                {isFrozen ? (
                  <div className="border border-slate-200 bg-slate-50 px-2 py-1 text-center font-mono text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    CONCEALED FOR FINALS
                  </div>
                ) : isGold ? (
                  <div className="flex items-center justify-center gap-1.5 border border-amber-300 bg-amber-50 px-2 py-1.5 text-center font-sans text-xs font-bold text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Current Event Leader</span>
                  </div>
                ) : (
                  <div className="border border-sky-200 bg-sky-50 px-2 py-1.5 text-center font-sans text-xs font-bold text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                    Needs{" "}
                    <span className="font-mono font-extrabold">
                      {entry.gapToLeader.toLocaleString()}
                    </span>{" "}
                    votes to take 1st!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
