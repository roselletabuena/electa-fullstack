"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import type { BallotPositionDto, BallotCandidateDto } from "../types/ballot";
import { useEventTheme } from "@/features/events/theme/EventThemeProvider";

export interface SelectedGroup {
  position: BallotPositionDto;
  candidates: BallotCandidateDto[];
}

export interface BallotReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string | null;
  groups: SelectedGroup[];
}

export function BallotReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  errorMessage,
  groups,
}: Readonly<BallotReviewModalProps>): React.JSX.Element | null {
  const { themeSlug } = useEventTheme();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const totalSelections = groups.reduce((acc, g) => acc + g.candidates.length, 0);

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="ballot-review-title"
      data-event-theme={themeSlug}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4 outline-hidden backdrop:bg-transparent"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal overlay"
        tabIndex={-1}
        onClick={() => !isSubmitting && onClose()}
        className="modal-backdrop fixed inset-0 h-full w-full cursor-default border-0 bg-slate-950/50 p-0 backdrop-blur-md transition-all dark:bg-black/60"
      />

      {/* Modal Surface */}
      <div className="ballot-review-modal-container relative flex max-h-[90vh] w-full max-w-2xl flex-col border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d1424]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <span className="font-mono text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
              Official Review Step
            </span>
            <h2
              id="ballot-review-title"
              className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
            >
              Review Your Official Ballot
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close review dialog"
            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Summary List */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <p className="font-sans text-xs text-slate-600 dark:text-slate-300">
            Please carefully inspect your candidates below before finalizing your submission. Once
            cast, your ballot cannot be modified or withdrawn.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 border border-rose-300 bg-rose-50 p-3 font-sans text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No candidates selected yet. Please select at least one candidate to review.
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(({ position, candidates }) => (
                <div
                  key={position.id}
                  className="border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                    <span className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      {position.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {candidates.length} of {position.maxSelectionsPerVoter} selected
                    </span>
                  </div>

                  {candidates.length === 0 ? (
                    <div className="pt-2 text-xs text-slate-400 italic dark:text-slate-500">
                      [No candidates selected for this position]
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {candidates.map((candidate) => (
                        <li
                          key={candidate.id}
                          className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-[#0d1424]"
                        >
                          <div className="flex items-center gap-3">
                            {candidate.avatarUrl ? (
                              <Image
                                src={candidate.avatarUrl}
                                alt={candidate.name}
                                width={32}
                                height={32}
                                className="size-8 border border-slate-200 object-cover dark:border-slate-700"
                              />
                            ) : (
                              <div className="flex size-8 items-center justify-center border border-slate-200 bg-slate-100 font-mono text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                #{candidate.contestantNumber}
                              </div>
                            )}
                            <div>
                              <span className="block font-sans text-xs font-bold text-slate-900 dark:text-white">
                                {candidate.name}
                              </span>
                              <span className="block font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                Candidate #{candidate.contestantNumber}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="size-4" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold tracking-wider text-slate-700 uppercase shadow-xs transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="size-3.5" />
            <span>Edit Selections</span>
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSubmitting || totalSelections === 0}
            className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Recording Ballot...</span>
              </>
            ) : (
              <span>Confirm &amp; Cast Ballot</span>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
