"use client";

import React, { useState } from "react";
import { Heart, Loader2, Zap, Share2, Check } from "lucide-react";
import { useFreeVoteQuota } from "../hooks/use-free-vote-quota";
import { useCastFreeVote } from "../hooks/use-cast-free-vote";
import { AuthPromptModal } from "./AuthPromptModal";
import { VoteStoryModal } from "./VoteStoryModal";
import { BoostVoteModal } from "@/features/payments/components/BoostVoteModal";
import type { VotingErrorDto } from "../types";
import type { StoryCardPayload } from "../types/story";

export interface FreeVoteButtonProps {
  eventId: string;
  contestantId: string;
  contestantName: string;
  contestantNumber?: number | undefined;
  contestantAvatarUrl?: string | undefined;
  divisionName?: string | null | undefined;
  categoryName?: string | null | undefined;
  eventSlug?: string | undefined;
  eventTitle?: string | undefined;
  awardCategoryId?: string | undefined;
  size?: ("sm" | "md" | "lg") | undefined;
  className?: string | undefined;
  showShareButton?: boolean | undefined;
  onBoostClick?: (() => void) | undefined;
  onVoteSuccess?: (() => void) | undefined;
}

export const FreeVoteButton: React.FC<FreeVoteButtonProps> = ({
  eventId,
  contestantId,
  contestantName,
  contestantNumber,
  contestantAvatarUrl,
  divisionName,
  categoryName,
  eventSlug,
  eventTitle,
  awardCategoryId,
  size = "md",
  className = "",
  showShareButton = false,
  onBoostClick,
  onVoteSuccess,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { quota, isLoading: isQuotaLoading, formattedCountdown } = useFreeVoteQuota(eventId);

  const { mutate: castVote, isPending: isCasting } = useCastFreeVote(eventId, {
    onSuccess: () => {
      const storageKey = `vs_story_shown_${eventId}_${contestantId}`;
      const alreadyShown = typeof window !== "undefined" && localStorage.getItem(storageKey);

      if (!alreadyShown) {
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, "true");
        }
        setIsStoryModalOpen(true);
      } else {
        setSuccessToast("Vote cast successfully!");
        setTimeout(() => setSuccessToast(null), 3000);
      }
      onVoteSuccess?.();
    },
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

  const storyPayload: StoryCardPayload = {
    eventSlug: eventSlug || eventId,
    eventTitle: eventTitle || "Official Pageant Ballot",
    candidateId: contestantId,
    candidateNumber: contestantNumber ?? 1,
    candidateName: contestantName,
    candidateAvatarUrl: contestantAvatarUrl || "/placeholder-contestant.webp",
    divisionName: divisionName ?? null,
    categoryName: categoryName ?? null,
    votingUrl:
      typeof window !== "undefined"
        ? `${window.location.origin}/events/${eventSlug || eventId}?contestantId=${contestantId}`
        : `https://electa.app/events/${eventSlug || eventId}?contestantId=${contestantId}`,
    theme: "midnight",
  };

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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBoostClick) onBoostClick();
              else setIsBoostModalOpen(true);
            }}
            className={`flex items-center justify-center rounded-none bg-linear-to-r from-amber-500 to-rose-500 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:from-amber-600 hover:to-rose-600 active:scale-95 ${sizeClasses} ${className}`}
            title={`Daily event free vote quota used. Next free vote resets in ${formattedCountdown}. Click to Boost.`}
          >
            <Zap className="size-3.5 fill-white" />
            <span>Boost</span>
          </button>
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

        {/* On-Demand Story Generator Modal Button */}
        {showShareButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStoryModalOpen(true);
            }}
            className={`ml-1.5 flex items-center justify-center border border-slate-300 bg-white text-slate-600 shadow-2xs transition-colors hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:bg-slate-700 dark:hover:text-sky-400 ${
              size === "lg" ? "h-10 gap-1.5 px-3 text-xs font-bold" : "h-7 w-7"
            }`}
            title="Create & Share Campaign Story Card"
            aria-label="Create & Share Campaign Story Card"
          >
            <Share2 className={size === "lg" ? "size-4" : "size-3.5"} />
            {size === "lg" && <span>Share Story</span>}
          </button>
        )}

        {/* Transient Success Toast */}
        {successToast && (
          <div className="animate-in fade-in slide-in-from-bottom-2 absolute -top-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-none bg-emerald-600 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
            <Check className="size-3.5" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Transient Error Toast */}
        {errorToast && (
          <div className="animate-in fade-in slide-in-from-bottom-2 absolute -top-10 left-1/2 z-20 -translate-x-1/2 rounded-none bg-rose-600 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-lg">
            {errorToast}
          </div>
        )}
      </div>

      {/* Auth Prompt Modal if needed */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        candidateName={contestantName}
        voteIntent={{
          eventId,
          contestantId,
          contestantName,
          awardCategoryId,
          voteType: "FREE",
        }}
        onSuccess={() => {
          castVote({
            eventId,
            contestantId,
            awardCategoryId,
          });
        }}
      />

      {/* Viral Social Sharing Story Generator Modal */}
      <VoteStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        payload={storyPayload}
      />

      {/* Power Boost Payment Modal */}
      <BoostVoteModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle ?? "Event Competition"}
        contestantId={contestantId}
        contestantName={contestantName}
        contestantNumber={contestantNumber ?? 1}
        contestantAvatarUrl={contestantAvatarUrl}
        awardCategoryId={awardCategoryId}
        onSuccess={() => {
          onVoteSuccess?.();
          setSuccessToast("Boost Votes Credited!");
          setTimeout(() => setSuccessToast(null), 3000);
        }}
      />
    </>
  );
};
