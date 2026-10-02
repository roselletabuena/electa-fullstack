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
            className={`flex items-center justify-center rounded-none bg-amber-500 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-amber-600 active:scale-95 ${sizeClasses} ${className}`}
          >
            <Zap className="size-3.5 fill-white" />
            <span>Boost Only</span>
          </button>
        ) : isInCooldown ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className={`flex cursor-not-allowed items-center justify-center rounded-none border border-slate-300 bg-slate-100 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 ${sizeClasses} ${className}`}
              title={`Daily event free vote quota used. Next free vote resets in ${formattedCountdown}`}
            >
              <Clock className="size-3.5 text-amber-500" />
              <span>Quota Used</span>
            </button>

            {onBoostClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoostClick();
                }}
                className={`flex items-center justify-center rounded-none bg-linear-to-r from-amber-500 to-rose-500 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:from-amber-600 hover:to-rose-600 active:scale-95 ${sizeClasses}`}
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
            className={`group/vote flex items-center justify-center rounded-none bg-sky-600 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-sky-700 active:scale-95 disabled:opacity-75 ${sizeClasses} ${className}`}
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
                  <span className="py-0.2 ml-0.5 rounded-none bg-sky-800/90 px-1.5 font-mono text-[10px] font-bold text-sky-100">
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
