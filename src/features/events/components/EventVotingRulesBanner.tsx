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
}: Readonly<EventVotingRulesBannerProps>): React.JSX.Element {
  if (!isFreeVotingEnabled) {
    return (
      <div
        className={cn(
          "event-voting-rules-banner relative overflow-hidden rounded-none border border-amber-300 bg-amber-50/70 p-4 shadow-xs backdrop-blur-md sm:p-5 dark:border-amber-700/60 dark:bg-amber-950/20",
          className,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rules-icon-box rounded-none border border-amber-300 bg-amber-100 p-2 text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-400">
              <Trophy className="size-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="heading-font text-sm font-bold text-slate-900 dark:text-slate-100">
                  Coronation Phase: Paid Boost Voting Active
                </h3>
                <span className="rules-badge rounded-none border border-amber-300 bg-amber-100/90 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-900 uppercase dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-300">
                  Grand Finals Mode
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
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
        "event-voting-rules-banner relative overflow-hidden rounded-none border border-sky-300/80 bg-sky-50/60 p-4 shadow-xs backdrop-blur-md sm:p-5 dark:border-sky-800/60 dark:bg-sky-950/20",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rules-icon-box rounded-none border border-sky-300 bg-sky-100 p-2 text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400">
            <Zap className="size-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="heading-font text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily Free Voting Active
              </h3>
              <span className="rules-badge rounded-none border border-sky-300 bg-sky-100/90 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-sky-800 uppercase dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                {dailyFreeVoteLimit}{" "}
                {dailyFreeVoteLimit === 1 ? "Free Vote / 24h" : "Free Votes / 24h"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
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
