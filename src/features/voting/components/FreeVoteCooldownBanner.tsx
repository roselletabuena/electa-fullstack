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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <Zap className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs font-semibold sm:text-sm">
            Free daily voting is paused for this phase. All votes are power boosts!
          </p>
        </div>
        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="flex items-center gap-1.5 rounded-none bg-linear-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-110 active:scale-95"
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-none border border-sky-300 bg-sky-50/90 p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-none bg-slate-900 text-white shadow-xs dark:bg-sky-500 dark:text-slate-950">
            <Clock className="size-4.5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-sky-400">
                Daily Quota Reached
              </span>
              <span className="rounded-none bg-slate-200 px-2 py-0.5 font-mono text-xs font-extrabold text-slate-900 dark:bg-slate-800 dark:text-sky-300">
                {formattedCountdown}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              All {quota.dailyLimit} free daily votes for this event have been cast. Your next free
              vote unlocks when the timer reaches zero.
            </p>
          </div>
        </div>

        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="flex items-center gap-1.5 rounded-none bg-linear-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-110 active:scale-98"
          >
            <Zap className="size-3.5 fill-white" />
            <span>Power Boost Candidates</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-none border border-slate-300 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-2.5">
        <Sparkles className="size-4 text-sky-600 dark:text-sky-400" />
        <p className="text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-300">
          You have{" "}
          <strong className="font-bold text-sky-600 dark:text-sky-400">
            {quota.remainingVotes} of {quota.dailyLimit}
          </strong>{" "}
          free votes available today for this event.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>24h Rolling Reset</span>
      </div>
    </div>
  );
};
