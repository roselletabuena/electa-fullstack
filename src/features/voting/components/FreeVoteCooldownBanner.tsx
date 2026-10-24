"use client";

import React from "react";
import { Clock, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFreeVoteQuota } from "../hooks/use-free-vote-quota";

interface FreeVoteCooldownBannerProps {
  eventId: string;
  onBoostClick?: (() => void) | undefined;
  className?: string | undefined;
}

export const FreeVoteCooldownBanner: React.FC<FreeVoteCooldownBannerProps> = ({
  eventId,
  onBoostClick,
  className,
}) => {
  const { quota, formattedCountdown } = useFreeVoteQuota(eventId);

  if (!quota) {
    return null;
  }

  if (!quota.isFreeVotingEnabled) {
    return (
      <div
        className={cn(
          "cooldown-banner-card mb-3 flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-2.5 overflow-hidden rounded-none border border-amber-500/30 bg-amber-500/10 p-3 text-amber-950 sm:mb-6 sm:gap-3 sm:px-4 sm:py-3 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Zap className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="cooldown-banner-desc min-w-0 text-xs font-semibold sm:text-sm">
            Free daily voting is paused for this phase. All votes are power boosts!
          </p>
        </div>
        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="btn-power-boost-candidates flex shrink-0 items-center gap-1.5 rounded-none bg-linear-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-110 active:scale-95"
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
      <div
        className={cn(
          "cooldown-banner-card mb-3 flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-2.5 overflow-hidden rounded-none border border-sky-300 bg-sky-50/90 p-3 shadow-xs sm:mb-6 sm:gap-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/90",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="cooldown-icon-box flex size-9 shrink-0 items-center justify-center rounded-none bg-slate-900 text-white shadow-xs dark:bg-sky-500 dark:text-slate-950">
            <Clock className="size-4.5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="cooldown-banner-title text-xs font-extrabold tracking-wider text-slate-900 uppercase dark:text-sky-400">
                Daily Quota Reached
              </span>
              <span className="cooldown-timer-badge rounded-none bg-slate-200 px-2 py-0.5 font-mono text-xs font-extrabold text-slate-900 dark:bg-slate-800 dark:text-sky-300">
                {formattedCountdown}
              </span>
            </div>
            <p className="cooldown-banner-desc mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              All {quota.dailyLimit} free daily votes for this event have been cast. Your next free
              vote unlocks when the timer reaches zero.
            </p>
          </div>
        </div>

        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="btn-power-boost-candidates flex shrink-0 items-center gap-1.5 rounded-none bg-linear-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-110 active:scale-98"
          >
            <Zap className="size-3.5 fill-white" />
            <span>Power Boost Candidates</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "cooldown-banner-card free-vote-status-banner mb-3 flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-2 overflow-hidden rounded-none border border-slate-300 bg-white p-3 shadow-xs sm:mb-6 sm:gap-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/90",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Sparkles className="free-vote-sparkle-icon size-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <p className="free-vote-banner-desc min-w-0 text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-300">
          You have{" "}
          <strong className="free-vote-count-highlight font-bold text-sky-600 dark:text-sky-400">
            {quota.remainingVotes} of {quota.dailyLimit}
          </strong>{" "}
          free votes available today for this event.
        </p>
      </div>

      <div className="free-vote-reset-badge flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <ShieldCheck className="free-vote-reset-icon size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>24h Rolling Reset</span>
      </div>
    </div>
  );
};
