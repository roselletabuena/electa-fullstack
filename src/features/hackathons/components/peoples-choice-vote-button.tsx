"use client";

import * as React from "react";
import { useState } from "react";
import { Trophy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { castPeoplesChoiceVoteAction } from "../actions/cast-peoples-choice-vote";

export interface PeoplesChoiceVoteButtonProps {
  readonly eventId: string;
  readonly submissionId: string;
  readonly projectTitle: string;
  readonly initialVoteCount?: number | undefined;
  readonly initialHasVoted?: boolean | undefined;
  readonly isVotingOpen?: boolean | undefined;
  readonly onVoteSuccess?: ((totalVotes: number) => void) | undefined;
  readonly className?: string | undefined;
}

/**
 * 1-Tap People's Choice voting button for Hackathon project cards.
 * Enforces strict zero-radius brutalist aesthetics and dual-theme accessibility.
 */
export function PeoplesChoiceVoteButton({
  eventId,
  submissionId,
  projectTitle,
  initialVoteCount = 0,
  initialHasVoted = false,
  isVotingOpen = true,
  onVoteSuccess,
  className = "",
}: Readonly<PeoplesChoiceVoteButtonProps>): React.JSX.Element {
  const [hasVoted, setHasVoted] = useState<boolean>(initialHasVoted);
  const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleVoteClick = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!isVotingOpen || hasVoted || isPending) {
      return;
    }

    setIsPending(true);

    try {
      const response = await castPeoplesChoiceVoteAction({
        eventId,
        submissionId,
      });

      if (response.success) {
        setHasVoted(true);
        const newTotal = response.data.totalVotes;
        setVoteCount(newTotal);
        toast.success(`Vote recorded! You voted for ${projectTitle}.`, {
          description: "Your People's Choice vote has been confirmed for Demo Day.",
        });
        onVoteSuccess?.(newTotal);
      } else {
        if (response.error.code === "ALREADY_VOTED") {
          toast.error("You have already cast your People's Choice vote for this hackathon.");
        } else {
          toast.error(response.error.message || "Failed to submit People's Choice vote.");
        }
      }
    } catch (err: unknown) {
      console.error("[PeoplesChoiceVoteButton] Vote error:", err);
      toast.error("Network error while recording vote. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const buttonClasses = hasVoted
    ? "border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950 font-black cursor-default"
    : isVotingOpen
    ? "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
    : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed";

  return (
    <button
      type="button"
      onClick={handleVoteClick}
      disabled={!isVotingOpen || hasVoted || isPending}
      aria-pressed={hasVoted}
      aria-label={`Vote People's Choice for ${projectTitle}`}
      data-testid={`peoples-choice-vote-btn-${submissionId}`}
      className={`inline-flex items-center gap-2 rounded-none px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition ${buttonClasses} ${className}`}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin text-current" />
      ) : hasVoted ? (
        <Check className="size-3.5 text-current stroke-[3]" />
      ) : (
        <Trophy className="size-3.5 text-amber-500 dark:text-amber-400" />
      )}

      <span>{hasVoted ? "Voted" : "Vote People's Choice"}</span>

      {voteCount > 0 ? (
        <span
          data-testid={`vote-count-badge-${submissionId}`}
          className={`ml-1 border px-1.5 py-0.2 font-mono text-[10px] font-extrabold ${
            hasVoted
              ? "border-white/30 bg-white/20 text-white dark:border-slate-900/30 dark:bg-slate-900/20 dark:text-slate-950"
              : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {voteCount}
        </span>
      ) : null}
    </button>
  );
}
