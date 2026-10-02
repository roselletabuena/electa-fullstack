"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import type { StoryCardPayload, StoryGeneratorResult, StoryTheme } from "../types/story";
import { StoryCardPreview } from "./StoryCardPreview";
import { StoryActionButtons } from "./StoryActionButtons";

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
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("midnight");
  const [generatedResult, setGeneratedResult] = useState<StoryGeneratorResult | null>(null);

  if (!isOpen || !payload) return null;

  const currentPayload: StoryCardPayload = {
    ...payload,
    theme: selectedTheme,
  };

  const themes: { id: StoryTheme; label: string }[] = [
    { id: "midnight", label: "Midnight Luxury" },
    { id: "coronation", label: "Coronation Gold" },
    { id: "opal", label: "Clean Opal" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-[95vh] w-full max-w-md flex-col overflow-y-auto border border-slate-300 bg-white p-5 shadow-2xl sm:p-6 dark:border-slate-800 dark:bg-[#0d1424]">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>VOTE CONFIRMED & RECORDED</span>
            </div>
            <h2 className="font-heading mt-2 text-xl font-black tracking-tight text-slate-900 uppercase sm:text-2xl dark:text-white">
              Share Your Story
            </h2>
            <p className="font-sans text-xs text-slate-600 dark:text-slate-400">
              Download or post to Instagram & TikTok to rally more votes for #
              {payload.candidateNumber} {payload.candidateName}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Selectors */}
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTheme(t.id)}
              className={`px-2.5 py-1 font-sans text-xs font-bold uppercase transition-all ${
                selectedTheme === t.id
                  ? "border border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 9:16 Canvas Story Preview */}
        <div className="my-2">
          <StoryCardPreview
            key={`${selectedTheme}-${payload.candidateId}`}
            payload={currentPayload}
            onGenerated={(res) => setGeneratedResult(res)}
          />
        </div>

        {/* Actions */}
        <div className="mt-5">
          <StoryActionButtons payload={currentPayload} result={generatedResult} />
        </div>
      </div>
    </div>
  );
}
