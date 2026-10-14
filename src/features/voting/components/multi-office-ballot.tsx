"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import { Check, AlertTriangle, Eye, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { BallotReviewModal } from "./ballot-review-modal";
import { BallotReceiptCard } from "./ballot-receipt-card";
import { castBallotAction } from "../actions/cast-ballot";
import type {
  PublicBallotEventDto,
  BallotPositionDto,
  BallotCandidateDto,
  BallotSubmissionReceiptDto,
} from "../types/ballot";

export interface MultiOfficeBallotProps {
  event: PublicBallotEventDto;
  initialReceipt?: BallotSubmissionReceiptDto | null;
  onCastBallot?: (input: unknown) => ReturnType<typeof castBallotAction>;
}

function getCandidateCardStyle(isChecked: boolean, isBlocked: boolean): string {
  if (isChecked) {
    return "border-sky-600 bg-sky-50/40 shadow-xs dark:border-sky-500 dark:bg-sky-950/30";
  }
  if (isBlocked) {
    return "border-slate-200 bg-slate-50/50 opacity-70 hover:border-slate-300 dark:border-slate-800/60 dark:bg-slate-900/20";
  }
  return "border-slate-300 bg-white hover:border-slate-400 hover:shadow-xs dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600";
}

export function MultiOfficeBallot({
  event,
  initialReceipt = null,
  onCastBallot,
}: Readonly<MultiOfficeBallotProps>): React.JSX.Element {

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [warningMessage, setWarningMessage] = useState<Record<string, string | null>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<BallotSubmissionReceiptDto | null>(initialReceipt);

  const castAction = onCastBallot ?? castBallotAction;
  const alertIdPrefix = useId();

  // If receipt is present (either passed initially or completed via submit), show receipt
  if (receipt) {
    return (
      <BallotReceiptCard
        receipt={receipt}
        eventSlug={event.slug}
        eventTitle={event.title}
      />
    );
  }

  const handleToggleCandidate = (
    positionId: string,
    contestantId: string,
    maxSelections: number,
  ) => {
    const current = selections[positionId] ?? [];
    const isSelected = current.includes(contestantId);

    if (isSelected) {
      setSelections((prev) => ({
        ...prev,
        [positionId]: current.filter((id) => id !== contestantId),
      }));
      setWarningMessage((prev) => ({ ...prev, [positionId]: null }));
      return;
    }

    // Attempting to select
    if (current.length >= maxSelections) {
      if (maxSelections === 1) {
        // Single-seat auto-swap
        setSelections((prev) => ({
          ...prev,
          [positionId]: [contestantId],
        }));
        setWarningMessage((prev) => ({ ...prev, [positionId]: null }));
      } else {
        // Multi-seat cap reached: block toggle and show accessible warning
        setWarningMessage((prev) => ({
          ...prev,
          [positionId]: `Maximum ${maxSelections} candidates reached for this office.`,
        }));
      }
      return;
    }

    setSelections((prev) => ({
      ...prev,
      [positionId]: [...current, contestantId],
    }));
    setWarningMessage((prev) => ({ ...prev, [positionId]: null }));
  };

  const totalSelectionsCount = Object.values(selections).reduce(
    (acc, arr) => acc + arr.length,
    0,
  );

  const getCandidatesForPosition = (positionId: string): BallotCandidateDto[] => {
    return event.candidates.filter((c) => c.positionId === positionId);
  };

  const getReviewGroups = () => {
    return event.positions.map((pos) => {
      const selectedIds = selections[pos.id] ?? [];
      const candidates = event.candidates.filter((c) => selectedIds.includes(c.id));
      return {
        position: pos,
        candidates,
      };
    });
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const officeSelections = Object.entries(selections)
        .filter(([_, ids]) => ids.length > 0)
        .map(([positionId, contestantIds]) => ({
          positionId,
          contestantIds,
        }));

      if (officeSelections.length === 0) {
        setSubmitError("Please select at least one candidate before submitting.");
        setIsSubmitting(false);
        return;
      }

      const res = await castAction({
        eventId: event.id,
        selections: officeSelections,
      });

      if (res.success) {
        setReceipt({
          ballotId: res.data.ballotId,
          eventId: res.data.eventId,
          votesCount: res.data.votesCount,
          submittedAt: res.data.submittedAt,
        });
        setIsReviewOpen(false);
      } else {
        setSubmitError(res.error.message || "Failed to submit ballot.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Election Header Banner */}
      <div className="card-style border border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-sky-300 bg-sky-50 px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-sky-800 uppercase dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
              <ShieldCheck className="size-3.5" />
              <span>Official Student Council Ballot</span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {event.title}
            </h1>
            <p className="mt-1 font-sans text-xs text-slate-600 sm:text-sm dark:text-slate-300">
              Review candidate statements and select your choices by office. Your ballot will remain private and unlinked from your student profile.
            </p>
          </div>

          {/* Review Ballot sticky/top trigger */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Candidates Chosen:{" "}
              <strong className="text-sky-600 dark:text-sky-400">{totalSelectionsCount}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              disabled={totalSelectionsCount === 0}
              className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-5 py-2.5 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Eye className="size-4" />
              <span>Review Ballot ({totalSelectionsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offices and Candidates Section */}
      <div className="space-y-10">
        {event.positions.map((position: BallotPositionDto) => {
          const posCandidates = getCandidatesForPosition(position.id);
          const currentPosSelections = selections[position.id] ?? [];
          const warning = warningMessage[position.id];
          const isAtLimit = currentPosSelections.length >= position.maxSelectionsPerVoter;

          return (
            <section
              key={position.id}
              aria-labelledby={`office-heading-${position.id}`}
              className="card-style border border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-[#0d1424]"
            >
              {/* Office Header */}
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
                <div>
                  <h2
                    id={`office-heading-${position.id}`}
                    className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white"
                  >
                    {position.name}
                  </h2>
                  {position.description && (
                    <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-400">
                      {position.description}
                    </p>
                  )}
                </div>

                {/* Seat Quota & Indicator */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    aria-live="polite"
                    className="border border-slate-300 bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {currentPosSelections.length} of {position.maxSelectionsPerVoter} selected
                  </span>
                  {position.maxSelectionsPerVoter > 1 && (
                    <span className="font-sans text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      (Vote for up to {position.maxSelectionsPerVoter})
                    </span>
                  )}
                </div>
              </div>

              {/* Warning Alert Badge if user tries to exceed limit */}
              {warning && (
                <div
                  id={`${alertIdPrefix}-${position.id}-warning`}
                  role="alert"
                  aria-live="polite"
                  className="mt-4 flex items-center gap-2 border border-amber-300 bg-amber-50 px-3.5 py-2 font-sans text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                >
                  <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{warning}</span>
                </div>
              )}

              {/* Candidates Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posCandidates.map((candidate: BallotCandidateDto) => {
                  const isChecked = currentPosSelections.includes(candidate.id);
                  const isBlocked = isAtLimit && !isChecked && position.maxSelectionsPerVoter > 1;

                  return (
                    <label
                      key={candidate.id}
                      htmlFor={`candidate-checkbox-${candidate.id}`}
                      className={`group relative flex cursor-pointer flex-col justify-between border p-4 transition-all ${getCandidateCardStyle(
                        isChecked,
                        isBlocked,
                      )}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Candidate Avatar or Number */}
                        {candidate.avatarUrl ? (
                          <div className="relative size-14 shrink-0 overflow-hidden border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                            <Image
                              src={candidate.avatarUrl}
                              alt={candidate.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex size-14 shrink-0 items-center justify-center border border-slate-300 bg-slate-100 font-mono text-sm font-black text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            #{candidate.contestantNumber}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                              Candidate #{candidate.contestantNumber}
                            </span>
                          </div>
                          <h3 className="font-heading text-sm font-extrabold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                            {candidate.name}
                          </h3>
                          {candidate.bio && (
                            <p className="mt-1 line-clamp-2 font-sans text-xs text-slate-600 dark:text-slate-300">
                              {candidate.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Interactive Selection Row */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 dark:border-slate-800">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition focus-within:ring-2 focus-within:ring-sky-500 ${
                            isChecked
                              ? "border border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <input
                            id={`candidate-checkbox-${candidate.id}`}
                            type="checkbox"
                            checked={isChecked}
                            aria-checked={isChecked}
                            aria-label={`Select ${candidate.name} for ${position.name}`}
                            onChange={() => {
                              handleToggleCandidate(
                                position.id,
                                candidate.id,
                                position.maxSelectionsPerVoter,
                              );
                            }}
                            className="sr-only"
                          />
                          {isChecked ? (
                            <>
                              <CheckSquare className="size-3.5" aria-hidden="true" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <Square className="size-3.5 text-slate-400" aria-hidden="true" />
                              <span>Select</span>
                            </>
                          )}
                        </div>

                        {isChecked && (
                          <div className="flex items-center text-sky-600 dark:text-sky-400">
                            <Check className="size-4 stroke-3" />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-40 border border-slate-300 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-[#0d1424]/95">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
              Ballot Progress:
            </span>
            <span className="border border-slate-300 bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {totalSelectionsCount} Candidates Selected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              disabled={totalSelectionsCount === 0}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-6 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Eye className="size-4" />
              <span>Review &amp; Cast Ballot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <BallotReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        groups={getReviewGroups()}
      />
    </div>
  );
}
