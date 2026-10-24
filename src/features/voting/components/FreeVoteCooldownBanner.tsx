"use client";

import React from "react";
import { Clock, Sparkles, Zap, ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFreeVoteQuota } from "../hooks/use-free-vote-quota";

export interface FreeVoteCooldownBannerProps {
  eventId: string;
  isFreeVotingEnabled?: boolean | undefined;
  dailyFreeVoteLimit?: number | undefined;
  onBoostClick?: (() => void) | undefined;
  className?: string | undefined;
}

export const FreeVoteCooldownBanner: React.FC<FreeVoteCooldownBannerProps> = ({
  eventId,
  isFreeVotingEnabled: isFreeVotingEnabledProp = true,
  dailyFreeVoteLimit: dailyFreeVoteLimitProp = 1,
  onBoostClick,
  className,
}) => {
  const { quota, formattedCountdown } = useFreeVoteQuota(eventId);

  const isFreeVotingActive = quota ? quota.isFreeVotingEnabled : isFreeVotingEnabledProp;

  const effectiveDailyLimit = quota?.dailyLimit ?? dailyFreeVoteLimitProp ?? 1;

  if (!isFreeVotingActive) {
    return (
      <div
        className={cn(
          "cooldown-banner-card event-voting-rules-banner relative flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-3 overflow-hidden rounded-none border border-amber-300 bg-amber-50/70 p-3 shadow-xs backdrop-blur-md sm:p-5 dark:border-amber-700/60 dark:bg-amber-950/20",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="rules-icon-box cooldown-icon-box flex size-9 shrink-0 items-center justify-center rounded-none border border-amber-300 bg-amber-100 p-1.5 text-amber-800 sm:p-2 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-400">
            <Trophy className="size-4 shrink-0 sm:size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="heading-font cooldown-banner-title text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                Coronation Phase: Paid Boost Voting Active
              </h3>
              <span className="rules-badge rounded-none border border-amber-300 bg-amber-100/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-amber-900 uppercase sm:px-2 sm:text-[10px] dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-300">
                Grand Finals Mode
              </span>
            </div>
            <p className="cooldown-banner-desc mt-0.5 text-[11px] leading-relaxed text-slate-700 sm:text-xs dark:text-slate-300">
              Daily free voting is currently closed for this round. Power your favorite candidates
              to the crown using official Paid Boost Packages.
            </p>
          </div>
        </div>
        {onBoostClick && (
          <button
            type="button"
            onClick={onBoostClick}
            className="btn-power-boost-candidates flex shrink-0 items-center gap-1.5 rounded-none bg-linear-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-110 active:scale-95"
          >
            <Zap className="size-3.5 fill-white" />
            <span>Power Boost Candidates</span>
          </button>
        )}
      </div>
    );
  }

  if (quota?.isInCooldown) {
    return (
      <div
        className={cn(
          "cooldown-banner-card event-voting-rules-banner relative flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-3 overflow-hidden rounded-none border border-sky-300 bg-sky-50/90 p-3 shadow-xs sm:p-5 dark:border-slate-800 dark:bg-slate-900/90",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="cooldown-icon-box rules-icon-box flex size-9 shrink-0 items-center justify-center rounded-none bg-slate-900 text-white shadow-xs dark:bg-sky-500 dark:text-slate-950">
            <Clock className="size-4.5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="heading-font cooldown-banner-title text-xs font-extrabold tracking-wider text-slate-900 uppercase sm:text-sm dark:text-sky-400">
                Daily Quota Reached
              </span>
              <span className="cooldown-timer-badge rules-badge rounded-none bg-slate-200 px-2 py-0.5 font-mono text-xs font-extrabold text-slate-900 dark:bg-slate-800 dark:text-sky-300">
                {formattedCountdown}
              </span>
              <span className="rules-badge rounded-none border border-sky-300 bg-sky-100/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-sky-800 uppercase sm:px-2 sm:text-[10px] dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                {effectiveDailyLimit}{" "}
                {effectiveDailyLimit === 1 ? "Free Vote / 24h" : "Free Votes / 24h"}
              </span>
            </div>
            <p className="cooldown-banner-desc mt-0.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs dark:text-slate-300">
              All {effectiveDailyLimit} free daily votes have been cast. Next vote unlocks when the
              timer reaches zero.
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

  const remainingVotes = quota?.remainingVotes ?? effectiveDailyLimit;

  return (
    <div
      className={cn(
        "cooldown-banner-card free-vote-status-banner event-voting-rules-banner relative flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-3 overflow-hidden rounded-none border border-sky-300/80 bg-sky-50/60 p-3 shadow-xs backdrop-blur-md sm:p-5 dark:border-slate-800 dark:bg-slate-900/90",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="rules-icon-box cooldown-icon-box flex size-9 shrink-0 items-center justify-center rounded-none bg-slate-900 text-white shadow-xs dark:bg-sky-500 dark:text-slate-950">
          <Zap className="size-4.5 shrink-0" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="heading-font cooldown-banner-title text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
              Daily Free Voting Active
            </h3>
            <span className="rules-badge rounded-none border border-sky-300 bg-sky-100/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-sky-800 uppercase sm:px-2 sm:text-[10px] dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
              {effectiveDailyLimit}{" "}
              {effectiveDailyLimit === 1 ? "Free Vote / 24h" : "Free Votes / 24h"}
            </span>
            <div className="free-vote-reset-badge flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck className="free-vote-reset-icon size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>24h Rolling Reset</span>
            </div>
          </div>
          <p className="free-vote-banner-desc cooldown-banner-desc mt-0.5 text-[11px] leading-relaxed text-slate-700 sm:text-xs dark:text-slate-300">
            <Sparkles className="free-vote-sparkle-icon mr-1 inline size-3.5 text-sky-600 dark:text-sky-400" />
            You have{" "}
            <strong className="free-vote-count-highlight font-bold text-sky-600 dark:text-sky-400">
              {remainingVotes} of {effectiveDailyLimit}
            </strong>{" "}
            free votes available today for this event.
          </p>
        </div>
      </div>

      {onBoostClick && (
        <button
          type="button"
          onClick={onBoostClick}
          className="btn-power-boost-candidates flex shrink-0 items-center gap-1.5 rounded-none bg-linear-to-r from-amber-500 to-rose-500 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-110 active:scale-95"
        >
          <Zap className="size-3.5 fill-white" />
          <span>Power Boost Candidates</span>
        </button>
      )}
    </div>
  );
};
