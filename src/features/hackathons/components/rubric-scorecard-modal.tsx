"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { X, ExternalLink, Code2, Video, AlertCircle, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitScorecardAction } from "../actions/submit-scorecard";

export interface RubricScorecardModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly eventId: string;
  readonly project: {
    readonly id: string;
    readonly title: string;
    readonly tagline?: string | null | undefined;
    readonly description: string;
    readonly repositoryUrl: string;
    readonly demoUrl?: string | null | undefined;
    readonly videoUrl?: string | null | undefined;
    readonly trackTags: readonly string[];
  };
  readonly criteria: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly description?: string | null | undefined;
    readonly weight: number;
    readonly maxScore: number;
    readonly displayOrder: number;
  }>;
  readonly existingEvaluation?:
    | {
        readonly compositeScore: number;
        readonly notes?: string | null | undefined;
        readonly isDraft: boolean;
        readonly scores: ReadonlyArray<{
          readonly criterionId: string;
          readonly score: number;
        }>;
      }
    | undefined;
  readonly onEvaluationSubmitted: (result: {
    readonly submissionId: string;
    readonly compositeScore: number;
    readonly isDraft: boolean;
    readonly scores: Array<{ readonly criterionId: string; readonly score: number }>;
    readonly notes?: string | null | undefined;
  }) => void;
}

export function RubricScorecardModal({
  isOpen,
  onClose,
  eventId,
  project,
  criteria,
  existingEvaluation,
  onEvaluationSubmitted,
}: Readonly<RubricScorecardModalProps>): React.JSX.Element | null {
  const localStorageKey = `electa_draft_eval_${eventId}_${project.id}`;

  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (existingEvaluation?.scores?.length) {
      const initialScores: Record<string, number> = {};
      for (const item of existingEvaluation.scores) {
        initialScores[item.criterionId] = item.score;
      }
      return initialScores;
    }

    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(localStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            scores?: Record<string, number>;
          };
          if (parsed.scores) {
            return parsed.scores;
          }
        }
      } catch {
        // Ignore localStorage error
      }
    }

    return {};
  });

  const [notes, setNotes] = useState<string>(() => {
    if (existingEvaluation?.notes) {
      return existingEvaluation.notes;
    }

    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(localStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            notes?: string;
          };
          if (typeof parsed.notes === "string") {
            return parsed.notes;
          }
        }
      } catch {
        // Ignore localStorage error
      }
    }

    return "";
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const criteriaCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Persist local draft on changes
  const saveToLocalStorage = useCallback(
    (newScores: Record<string, number>, newNotes: string) => {
      try {
        window.localStorage.setItem(
          localStorageKey,
          JSON.stringify({ scores: newScores, notes: newNotes }),
        );
      } catch {
        // Ignore localStorage quota errors
      }
    },
    [localStorageKey],
  );

  const handleScoreSelect = (criterionId: string, score: number) => {
    const updated = { ...scores, [criterionId]: score };
    setScores(updated);
    if (validationErrors[criterionId]) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors[criterionId];
      setValidationErrors(updatedErrors);
    }
    saveToLocalStorage(updated, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    saveToLocalStorage(scores, val);
  };

  // Live weighted score computation
  const compositeScore = useMemo(() => {
    const totalW = criteria.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0);

    if (totalW <= 0) return 0;

    let weightedSum = 0;
    for (const c of criteria) {
      const score = scores[c.id];
      if (typeof score === "number") {
        const effectiveMax = c.maxScore > 0 ? c.maxScore : 10;
        const normalizedWeight = c.weight / totalW;
        weightedSum += (score / effectiveMax) * 10 * normalizedWeight;
      }
    }

    return Math.round(weightedSum * 100) / 100;
  }, [criteria, scores]);

  // Keyboard navigation for tactile controls
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, criterionId: string) => {
    const current = scores[criterionId];
    if (e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      handleScoreSelect(criterionId, Number(e.key));
    } else if (e.key === "0") {
      e.preventDefault();
      handleScoreSelect(criterionId, 10);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = typeof current === "number" ? Math.min(10, current + 1) : 1;
      handleScoreSelect(criterionId, next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = typeof current === "number" ? Math.max(1, current - 1) : 10;
      handleScoreSelect(criterionId, prev);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setServerError(null);

    const scoresPayload = Object.entries(scores).map(([criterionId, score]) => ({
      criterionId,
      score,
    }));

    try {
      const response = await submitScorecardAction({
        eventId,
        submissionId: project.id,
        scores: scoresPayload,
        notes: notes.trim() || undefined,
        isDraft: true,
      });

      if (!response.success || !response.data) {
        setServerError(response.error?.message || "Failed to save draft evaluation.");
        return;
      }

      onEvaluationSubmitted({
        submissionId: project.id,
        compositeScore: response.data.compositeScore,
        isDraft: true,
        scores: scoresPayload,
        notes: notes.trim() || undefined,
      });
    } catch {
      setServerError("An unexpected network error occurred while saving draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFinal = async () => {
    setServerError(null);

    // Validate that all criteria have assigned scores
    const errors: Record<string, string> = {};
    let firstMissingId: string | null = null;

    for (const c of criteria) {
      const score = scores[c.id];
      if (typeof score !== "number" || score < 1 || score > 10) {
        errors[c.id] = "Please assign a score between 1 and 10.";
        if (!firstMissingId) {
          firstMissingId = c.id;
        }
      }
    }

    if (firstMissingId) {
      setValidationErrors(errors);
      const targetEl = criteriaCardRefs.current[firstMissingId];
      if (targetEl && typeof targetEl.scrollIntoView === "function") {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        targetEl.focus();
      }
      return;
    }

    setIsSubmitting(true);

    const scoresPayload = criteria.map((c) => ({
      criterionId: c.id,
      score: scores[c.id] as number,
    }));

    try {
      const response = await submitScorecardAction({
        eventId,
        submissionId: project.id,
        scores: scoresPayload,
        notes: notes.trim() || undefined,
        isDraft: false,
      });

      if (!response.success || !response.data) {
        setServerError(response.error?.message || "Failed to submit final scorecard.");
        return;
      }

      // Clear local storage draft upon final submission
      try {
        window.localStorage.removeItem(localStorageKey);
      } catch {
        // Ignore storage cleanup error
      }

      onEvaluationSubmitted({
        submissionId: project.id,
        compositeScore: response.data.compositeScore,
        isDraft: false,
        scores: scoresPayload,
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch {
      setServerError("An unexpected network error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scorecard-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-xs sm:p-6"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-none border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 p-4 sm:p-6 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-none bg-sky-600 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-white uppercase dark:bg-sky-500 dark:text-slate-950">
                Rubric Scorecard
              </span>
              {existingEvaluation && (
                <span
                  className={cn(
                    "rounded-none px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase",
                    existingEvaluation.isDraft
                      ? "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                  )}
                >
                  {existingEvaluation.isDraft ? "Draft In Progress" : "Evaluated"}
                </span>
              )}
            </div>
            <h2
              id="scorecard-title"
              className="font-heading text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100"
            >
              {project.title}
            </h2>
            {project.tagline && (
              <p className="font-sans text-xs text-slate-600 dark:text-slate-400">
                {project.tagline}
              </p>
            )}

            {/* Links and Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-slate-700 hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Repository</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Live Demo</span>
                </a>
              )}
              {project.videoUrl && (
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-slate-700 hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Pitch Video</span>
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close scorecard"
            className="rounded-none border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Criteria Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {serverError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-none border border-rose-300 bg-rose-50 p-3 font-sans text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Quick instructions */}
          <div className="border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="font-sans text-xs text-slate-600 dark:text-slate-400">
              <strong className="font-semibold text-slate-900 dark:text-slate-200">
                Judging Tip:
              </strong>{" "}
              Rate each rubric criterion from 1 (poor) to 10 (exceptional). Use single-key keyboard
              shortcuts (1–9, 0 for 10) to score swiftly during rapid pitches.
            </p>
          </div>

          {/* Criteria Cards */}
          <div className="space-y-4">
            {criteria.map((c, index) => {
              const currentScore = scores[c.id];
              const error = validationErrors[c.id];

              return (
                <div
                  key={c.id}
                  ref={(el) => {
                    criteriaCardRefs.current[c.id] = el;
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, c.id)}
                  className={cn(
                    "rounded-none border p-4 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500",
                    error
                      ? "border-rose-400 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20"
                      : "border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900",
                  )}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          0{index + 1}.
                        </span>
                        <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                          {c.title}
                        </h3>
                        <span className="py-0.2 rounded-none border border-slate-300 bg-slate-100 px-1.5 font-mono text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Weight: {c.weight}%
                        </span>
                      </div>
                      {c.description && (
                        <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-400">
                          {c.description}
                        </p>
                      )}
                    </div>

                    {/* Current Score Display */}
                    <div className="mt-2 sm:mt-0">
                      <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {typeof currentScore === "number" ? (
                          <span className="text-sky-600 dark:text-sky-400">
                            {currentScore} / {c.maxScore}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">Unscored</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 1-10 Segmented Rating Control */}
                  <div
                    role="radiogroup"
                    aria-label={`Criterion ${c.title} score`}
                    className="mt-3 flex flex-wrap items-center gap-1 sm:gap-1.5"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                      const isSelected = currentScore === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`Criterion ${c.title} score ${val}`}
                          onClick={() => handleScoreSelect(c.id, val)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-none font-mono text-xs font-bold transition-all sm:h-9 sm:w-9",
                            isSelected
                              ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
                          )}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <p
                      role="alert"
                      className="mt-2 font-sans text-xs font-bold text-rose-600 dark:text-rose-400"
                    >
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Qualitative Notes / Private Feedback */}
          <div className="space-y-1.5 rounded-none border border-slate-300 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <label
              htmlFor="judge-private-notes"
              className="font-heading text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100"
            >
              Private Deliberation Notes (Optional)
            </label>
            <p className="font-sans text-xs text-slate-600 dark:text-slate-400">
              Only visible to fellow judges and organizers during deliberation.
            </p>
            <textarea
              id="judge-private-notes"
              rows={3}
              value={notes}
              onChange={handleNotesChange}
              placeholder="Enter private feedback or deliberation notes..."
              className="mt-1 w-full rounded-none border border-slate-300 bg-white p-2.5 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
            />
          </div>
        </div>

        {/* Sticky Footer with Composite Calculation & Actions */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Live Calculation Display */}
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                Composite Weighted Score
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  data-testid="composite-score"
                  className="font-mono text-2xl font-black text-sky-600 sm:text-3xl dark:text-sky-400"
                >
                  {compositeScore.toFixed(2)}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  / 10.00
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 rounded-none border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs font-bold tracking-wider text-slate-700 uppercase shadow-xs hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitFinal}
                className="inline-flex items-center gap-1.5 rounded-none border border-slate-900 bg-slate-900 px-4 py-2 font-mono text-xs font-black tracking-wider text-white uppercase shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit Final Evaluation"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
