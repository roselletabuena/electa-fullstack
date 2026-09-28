"use client";

import React from "react";
import { Clock, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { useFreeVoteQuota } from "../hooks/use-free-vote-quota";

interface FreeVoteCooldownBannerProps {
  eventId: string;
  onBoostClick?: (() => void) | undefined;
}

export const FreeVoteCooldownBanner: React.FC<FreeVoteCooldownBannerProps> = ({
  eventId,
  onBoostClick,
}) => {
  const { quota, formattedCountdown } = useFreeVoteQuota(eventId);

  if (!quota) {
    return null;
  }

  if (!quota.isFreeVotingEnabled) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-900 backdrop-blur-md dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <Zap className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs font-semibold sm:text-sm">
            Free daily voting is paused for this grand finals phase. All votes are power boosts!
          </p>
        </div>
        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="size-3.5 fill-white" />
            <span>Boost Now</span>
          </button>
        )}
      </div>
    );
  }

  if (quota.isInCooldown) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/70 bg-linear-to-r from-indigo-50/90 via-purple-50/60 to-rose-50/90 p-4 shadow-sm backdrop-blur-md dark:border-indigo-900/60 dark:from-slate-900/90 dark:via-indigo-950/50 dark:to-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-inner">
            <Clock className="size-4.5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-indigo-700 uppercase dark:text-indigo-400">
                Daily Quota Reached
              </span>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-xs font-extrabold text-indigo-900 dark:bg-indigo-900/80 dark:text-indigo-200">
                {formattedCountdown}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              All {quota.dailyLimit} free daily votes used. Your next free vote unlocks
              automatically when the timer reaches zero.
            </p>
          </div>
        </div>

        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-600 via-purple-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-102 hover:shadow-lg active:scale-98"
          >
            <Zap className="size-3.5 fill-white" />
            <span>Power Boost Candidates</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-2.5">
        <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-300">
          You have{" "}
          <strong className="font-bold text-indigo-600 dark:text-indigo-400">
            {quota.remainingVotes} of {quota.dailyLimit}
          </strong>{" "}
          free votes available today.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>24h Rolling Reset</span>
      </div>
    </div>
  );
};
