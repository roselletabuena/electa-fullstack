"use client";

import React, { useState } from "react";
import { Heart, Loader2, Clock, Zap } from "lucide-react";
import { useFreeVoteQuota } from "../hooks/use-free-vote-quota";
import { useCastFreeVote } from "../hooks/use-cast-free-vote";
import { AuthPromptModal } from "./AuthPromptModal";
import type { VotingErrorDto } from "../types";

export interface FreeVoteButtonProps {
  eventId: string;
  contestantId: string;
  contestantName: string;
  awardCategoryId?: string | undefined;
  size?: ("sm" | "md" | "lg") | undefined;
  className?: string | undefined;
  onBoostClick?: (() => void) | undefined;
}

export const FreeVoteButton: React.FC<FreeVoteButtonProps> = ({
  eventId,
  contestantId,
  contestantName,
  awardCategoryId,
  size = "md",
  className = "",
  onBoostClick,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const { quota, isLoading: isQuotaLoading, formattedCountdown } = useFreeVoteQuota(eventId);

  const { mutate: castVote, isPending: isCasting } = useCastFreeVote(eventId, {
    onError: (err: VotingErrorDto) => {
      if (err.code === "NOT_AUTHENTICATED") {
        setIsAuthModalOpen(true);
      } else {
        setErrorToast(err.message);
        setTimeout(() => setErrorToast(null), 4000);
      }
    },
  });

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if free voting is disabled
    if (quota && !quota.isFreeVotingEnabled) {
      if (onBoostClick) {
        onBoostClick();
      }
      return;
    }

    // If quota is in cooldown, redirect or prompt for boost
    if (quota?.isInCooldown) {
      if (onBoostClick) {
        onBoostClick();
      }
      return;
    }

    castVote({
      eventId,
      contestantId,
      awardCategoryId,
    });
  };

  const isFreeVotingDisabled = quota !== null && !quota.isFreeVotingEnabled;
  const isInCooldown = quota !== null && quota.isInCooldown;
  const remaining = quota ? quota.remainingVotes : 1;
  const total = quota ? quota.dailyLimit : 1;

  // Size styles
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs gap-1.5",
    lg: "px-5 py-2.5 text-sm gap-2",
  }[size];

  return (
    <>
      <div className="relative inline-flex items-center">
        {isFreeVotingDisabled ? (
          <button
            type="button"
            onClick={handleVoteClick}
            className={`flex items-center justify-center rounded-xl bg-amber-500 font-semibold text-white shadow-xs transition-all hover:bg-amber-600 active:scale-95 ${sizeClasses} ${className}`}
          >
            <Zap className="size-3.5 fill-white" />
            <span>Boost Only</span>
          </button>
        ) : isInCooldown ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className={`flex cursor-not-allowed items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 ${sizeClasses} ${className}`}
              title={`Next vote resets in ${formattedCountdown}`}
            >
              <Clock className="size-3.5 animate-pulse text-amber-500" />
              <span>Next: {formattedCountdown}</span>
            </button>

            {onBoostClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoostClick();
                }}
                className={`flex items-center justify-center rounded-xl bg-linear-to-r from-amber-500 to-rose-500 font-semibold text-white shadow-xs transition-all hover:from-amber-600 hover:to-rose-600 active:scale-95 ${sizeClasses}`}
              >
                <Zap className="size-3.5 fill-white" />
                <span>Boost</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={isCasting || isQuotaLoading}
            onClick={handleVoteClick}
            className={`group/vote flex items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-75 ${sizeClasses} ${className}`}
          >
            {isCasting ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-white" />
                <span>Voting...</span>
              </>
            ) : (
              <>
                <Heart className="size-3.5 fill-white text-white transition-transform group-hover/vote:scale-125" />
                <span>Vote</span>
                {total > 1 && (
                  <span className="py-0.2 ml-0.5 rounded-full bg-indigo-700/80 px-1.5 text-[10px] font-bold text-indigo-100">
                    {remaining}/{total}
                  </span>
                )}
              </>
            )}
          </button>
        )}

        {/* Transient Error Toast */}
        {errorToast && (
          <div className="animate-in fade-in slide-in-from-bottom-2 absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
            {errorToast}
          </div>
        )}
      </div>

      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        candidateName={contestantName}
      />
    </>
  );
};
