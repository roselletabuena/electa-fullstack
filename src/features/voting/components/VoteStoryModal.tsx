"use client";

import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import type { StoryCardPayload, StoryGeneratorResult, StoryTheme } from "../types/story";
import { StoryCardPreview } from "./StoryCardPreview";
import { StoryActionButtons } from "./StoryActionButtons";
import { useIsMounted } from "@/hooks/use-is-mounted";

interface VoteStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: StoryCardPayload | null;
}

export function VoteStoryModal({
  isOpen,
  onClose,
  payload,
}: VoteStoryModalProps): React.JSX.Element | null {
  const isMounted = useIsMounted();
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("midnight");
  const [generatedResult, setGeneratedResult] = useState<StoryGeneratorResult | null>(null);

  const handleGenerated = useCallback((res: StoryGeneratorResult) => {
    setGeneratedResult(res);
  }, []);

  if (!isOpen || !payload || !isMounted) return null;

  const currentPayload: StoryCardPayload = {
    ...payload,
    theme: selectedTheme,
  };

  const themes: { id: StoryTheme; label: string; dotColor: string }[] = [
    { id: "midnight", label: "Midnight", dotColor: "bg-sky-400 ring-1 ring-sky-500/50" },
    { id: "coronation", label: "Coronation", dotColor: "bg-amber-400 ring-1 ring-amber-500/50" },
    { id: "opal", label: "Clean Opal", dotColor: "bg-slate-400 ring-1 ring-slate-500/50" },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[92vh] w-full max-w-sm flex-col overflow-y-auto border border-slate-300 bg-white p-4 shadow-2xl sm:max-w-md sm:p-5 dark:border-slate-800 dark:bg-[#0b111e]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-emerald-800 uppercase dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>Official Ballot Verified</span>
            </div>
            <h2 className="font-heading mt-1.5 text-lg font-black tracking-tight text-slate-900 uppercase sm:text-xl dark:text-white">
              Share Your Story
            </h2>
            <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
              Rally votes for #{payload.candidateNumber} {payload.candidateName} on social channels.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Elegant Segmented Theme Control */}
        <div className="my-3 flex items-center justify-center gap-1 border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/60">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTheme(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all ${
                selectedTheme === t.id
                  ? "border border-slate-300 bg-white text-slate-950 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  : "border border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span className={`size-2 shrink-0 ${t.dotColor}`} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* 9:16 Canvas Story Preview */}
        <div className="my-1">
          <StoryCardPreview
            key={`${selectedTheme}-${payload.candidateId}`}
            payload={currentPayload}
            onGenerated={handleGenerated}
          />
        </div>

        {/* Actions */}
        <div className="mt-3">
          <StoryActionButtons payload={currentPayload} result={generatedResult} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
