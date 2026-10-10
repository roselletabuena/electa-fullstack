"use client";

import React from "react";
import Image from "next/image";
import { Crown, Award, Lock, Flame } from "lucide-react";
import type { StageCandidate } from "../types";

interface StageLiveTallyProps {
  candidates: StageCandidate[];
  isFrozen: boolean;
}

export function StageLiveTally({
  candidates,
  isFrozen,
}: Readonly<StageLiveTallyProps>): React.JSX.Element {
  if (candidates.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <Award className="mb-4 h-16 w-16 text-slate-700" />
        <h2 className="font-heading text-2xl font-black tracking-widest text-slate-300 uppercase">
          No Candidates Registered
        </h2>
        <p className="mt-2 font-mono text-sm text-slate-500">
          Candidates for this division or category will appear here once active.
        </p>
      </div>
    );
  }

  if (isFrozen) {
    return (
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-none border border-amber-500/40 bg-amber-500/10 p-4 text-amber-400">
          <Lock className="h-8 w-8" />
          <span className="font-mono text-lg font-black tracking-widest uppercase">
            Mystery Freeze in Effect
          </span>
        </div>
        <h2 className="font-heading mb-4 text-4xl font-black tracking-tight text-white uppercase md:text-5xl lg:text-6xl">
          Rankings Sealed for Coronation
        </h2>
        <p className="mx-auto mb-8 max-w-2xl font-sans text-lg text-slate-400">
          The public leaderboard is paused to protect the suspense of live coronation. Votes
          continue to be counted securely in the official vault.
        </p>
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="rounded-none border border-slate-800 bg-slate-900/60 p-3 text-center"
            >
              <div className="relative mb-2 aspect-square border border-slate-800 bg-slate-950">
                <Image
                  src={c.avatarUrl || "/placeholder-contestant.webp"}
                  alt={c.name}
                  fill
                  sizes="200px"
                  className="object-cover opacity-70 grayscale"
                />
              </div>
              <div className="font-mono text-[11px] font-bold text-amber-400">
                #{String(c.contestantNumber).padStart(2, "0")}
              </div>
              <div className="mt-0.5 truncate font-sans text-xs font-bold text-slate-200">
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Identify podium (Top 3)
  const sorted = [...candidates].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const first = sorted.find((c) => c.rank === 1);
  const second = sorted.find((c) => c.rank === 2);
  const third = sorted.find((c) => c.rank === 3);
  const others = sorted.filter((c) => (c.rank ?? 999) > 3);

  return (
    <div className="flex h-full w-full flex-col justify-between px-4 py-2 md:px-8">
      {/* Top 3 Stage Podium */}
      <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-end gap-4 md:grid-cols-3 lg:gap-8">
        {/* #2 1st Runner Up (Silver) */}
        {second && (
          <div className="order-2 flex flex-col items-center md:order-1">
            <div className="relative w-full rounded-none border-2 border-slate-400 bg-[#0a1020] p-4 text-center shadow-[0_0_30px_rgba(203,213,225,0.15)]">
              <div className="font-heading absolute -top-4 left-1/2 -translate-x-1/2 border border-slate-400 bg-slate-300 px-3 py-0.5 text-xs font-black tracking-widest text-slate-950 uppercase">
                #2 1st Runner Up
              </div>
              <div className="relative mx-auto mb-3 aspect-4/5 max-h-56 w-full overflow-hidden border border-slate-700 bg-slate-950">
                <Image
                  src={second.avatarUrl || "/placeholder-contestant.webp"}
                  alt={second.name}
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>
              <div className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                Candidate #{String(second.contestantNumber).padStart(2, "0")}
              </div>
              <div className="font-heading mt-1 truncate text-lg font-extrabold text-white md:text-xl">
                {second.name}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2">
                <span className="font-mono text-xs text-slate-400">Votes</span>
                <span className="font-mono text-lg font-black text-slate-200">
                  {second.voteCount?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* #1 Queen / Title Winner (Gold) - Elevated & Center */}
        {first && (
          <div className="z-10 order-1 flex scale-105 flex-col items-center md:order-2">
            <div className="relative w-full rounded-none border-2 border-amber-400 bg-[#0f172a] p-5 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
              <div className="font-heading absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 border border-amber-500 bg-amber-400 px-4 py-1 text-xs font-black tracking-widest text-slate-950 uppercase shadow-md">
                <Crown className="h-4 w-4" />
                #1 Current Leader
              </div>
              <div className="relative mx-auto mb-3 aspect-4/5 max-h-68 w-full overflow-hidden border-2 border-amber-500/50 bg-slate-950">
                <Image
                  src={first.avatarUrl || "/placeholder-contestant.webp"}
                  alt={first.name}
                  fill
                  sizes="400px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="font-mono text-xs font-black tracking-wider text-amber-400 uppercase">
                Candidate #{String(first.contestantNumber).padStart(2, "0")}
              </div>
              <div className="font-heading mt-1 truncate text-xl font-black text-white md:text-2xl">
                {first.name}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-amber-500/30 pt-2.5">
                <span className="font-mono text-xs font-bold tracking-wider text-amber-300 uppercase">
                  Total Votes
                </span>
                <span className="font-mono text-2xl font-black text-amber-400">
                  {first.voteCount?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* #3 2nd Runner Up (Bronze) */}
        {third && (
          <div className="order-3 flex flex-col items-center">
            <div className="relative w-full rounded-none border-2 border-amber-700/80 bg-[#0a1020] p-4 text-center shadow-[0_0_30px_rgba(249,115,22,0.15)]">
              <div className="font-heading absolute -top-4 left-1/2 -translate-x-1/2 border border-amber-600 bg-amber-700 px-3 py-0.5 text-xs font-black tracking-widest text-amber-100 uppercase">
                #3 2nd Runner Up
              </div>
              <div className="relative mx-auto mb-3 aspect-4/5 max-h-56 w-full overflow-hidden border border-slate-700 bg-slate-950">
                <Image
                  src={third.avatarUrl || "/placeholder-contestant.webp"}
                  alt={third.name}
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>
              <div className="font-mono text-xs font-bold tracking-wider text-amber-500 uppercase">
                Candidate #{String(third.contestantNumber).padStart(2, "0")}
              </div>
              <div className="font-heading mt-1 truncate text-lg font-extrabold text-white md:text-xl">
                {third.name}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2">
                <span className="font-mono text-xs text-slate-400">Votes</span>
                <span className="font-mono text-lg font-black text-slate-200">
                  {third.voteCount?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ranks 4+ Ticker / Card Grid */}
      {others.length > 0 && (
        <div className="mx-auto mt-6 w-full max-w-6xl border-t border-slate-800/80 pt-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-slate-400 uppercase">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            Remaining Official Contenders
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {others.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-none border border-slate-800 bg-slate-900/80 p-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-700 bg-slate-950 font-mono text-xs font-black text-slate-300">
                  #{c.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-xs font-bold text-white">{c.name}</div>
                  <div className="font-mono text-[11px] text-amber-400">
                    {c.voteCount?.toLocaleString() ?? 0} votes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
