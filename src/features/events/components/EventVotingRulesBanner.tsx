"use client";

import React from "react";
import { Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventVotingRulesBannerProps {
  isFreeVotingEnabled?: boolean | undefined;
  dailyFreeVoteLimit?: number | undefined;
  className?: string | undefined;
}

export function EventVotingRulesBanner({
  isFreeVotingEnabled = true,
  dailyFreeVoteLimit = 1,
  className,
}: EventVotingRulesBannerProps): React.JSX.Element {
  if (!isFreeVotingEnabled) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-amber-300/80 bg-linear-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 sm:p-5 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-amber-900/20",
          className,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <Trophy className="size-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Coronation Phase: Paid Boost Voting Active
                </h3>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase dark:text-amber-300">
                  Grand Finals Mode
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                Daily free voting is currently closed for this round. Power your favorite candidates
                to the crown using official Paid Boost Packages.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-linear-to-r from-indigo-500/10 via-indigo-400/5 to-transparent p-4 sm:p-5 dark:border-indigo-800/60 dark:from-indigo-950/40 dark:via-indigo-900/20",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
            <Zap className="size-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily Free Voting Active
              </h3>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-800 uppercase dark:text-indigo-300">
                {dailyFreeVoteLimit}{" "}
                {dailyFreeVoteLimit === 1 ? "Free Vote / 24h" : "Free Votes / 24h"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              Cast up to {dailyFreeVoteLimit} free vote{dailyFreeVoteLimit > 1 ? "s" : ""} every 24
              hours. Want to give your candidate an extra edge? Paid boost packages are also
              available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
