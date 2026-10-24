"use client";

import React, { useState } from "react";
import { Heart, Loader2, Zap, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
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
        toast.success("Vote cast successfully!", {
          description: `Your free vote for ${contestantName} has been recorded.`,
          duration: 4000,
        });
      }
      onVoteSuccess?.();
    },
    onError: (err: VotingErrorDto) => {
      if (err.code === "NOT_AUTHENTICATED") {
        setIsAuthModalOpen(true);
      } else {
        toast.error("Unable to Cast Vote", {
          description: err.message || `Could not record vote for ${contestantName}.`,
          duration: 4000,
        });
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
  const isInCooldown = quota?.isInCooldown;
  const remaining = quota ? quota.remainingVotes : 1;
  const total = quota ? quota.dailyLimit : 1;

  // Size styles
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs gap-1.5",
    lg: "h-10 px-5 text-sm gap-2",
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

  const renderActionButton = () => {
    if (isFreeVotingDisabled) {
      return (
        <button
          type="button"
          onClick={handleVoteClick}
          aria-label={`Boost votes for ${contestantName}`}
          className={`btn-vote-boost flex items-center justify-center rounded-none bg-amber-500 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-amber-600 active:scale-95 ${sizeClasses} ${className}`}
        >
          <Zap className="size-3.5 fill-white" aria-hidden="true" />
          <span>Boost Only</span>
        </button>
      );
    }

    if (isInCooldown) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onBoostClick) onBoostClick();
            else setIsBoostModalOpen(true);
          }}
          aria-label={`Boost votes for ${contestantName}`}
          className={`btn-vote-boost flex items-center justify-center rounded-none bg-linear-to-r from-amber-500 to-rose-500 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:from-amber-600 hover:to-rose-600 active:scale-95 ${sizeClasses} ${className}`}
          title={`Daily event free vote quota used. Next free vote resets in ${formattedCountdown}. Click to Boost.`}
        >
          <Zap className="size-3.5 fill-white" aria-hidden="true" />
          <span>Boost</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={isCasting || isQuotaLoading}
        onClick={handleVoteClick}
        aria-label={`Vote for ${contestantName}`}
        aria-busy={isCasting}
        className={`group/vote btn-pageant-free-vote flex items-center justify-center rounded-none bg-sky-600 font-bold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-sky-700 active:scale-95 disabled:opacity-75 ${sizeClasses} ${className}`}
      >
        {isCasting ? (
          <>
            <Loader2 className="size-3.5 animate-spin text-white" aria-hidden="true" />
            <span className="btn-vote-label font-bold text-white">Voting...</span>
          </>
        ) : (
          <>
            <Heart
              className="size-3.5 fill-white text-white transition-transform group-hover/vote:scale-125"
              aria-hidden="true"
            />
            <span className="btn-vote-label font-bold text-white">Vote</span>
            {total > 1 && (
              <span className="py-0.2 ml-0.5 rounded-none bg-sky-800/90 px-1.5 font-mono text-[10px] font-bold text-sky-100">
                {remaining}/{total}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <div className="relative inline-flex items-center">
        {renderActionButton()}

        {/* On-Demand Story Generator Modal Button */}
        {showShareButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStoryModalOpen(true);
            }}
            className={`btn-share-story ml-2 inline-flex items-center justify-center rounded-none border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white ${
              size === "lg" ? "h-10 gap-2 px-3.5 text-xs font-bold" : "h-7 w-7"
            }`}
            title={`Create & share story card for ${contestantName}`}
            aria-label={`Create & share story card for ${contestantName}`}
          >
            <Share2 className={size === "lg" ? "size-4" : "size-3.5"} aria-hidden="true" />
            {size === "lg" && <span className="btn-share-story-label">Share Story</span>}
          </button>
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
          toast.success("Boost Votes Credited!", {
            description: `Boosted votes for ${contestantName} were recorded.`,
          });
        }}
      />
    </>
  );
};
