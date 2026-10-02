"use client";

import React from "react";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  BarChart3,
} from "lucide-react";
import type { StageDisplayMode, StageDivision, StageCategory } from "../types";

interface StageOperatorDockProps {
  mode: StageDisplayMode;
  onSetMode: (mode: StageDisplayMode) => void;
  currentStep: number;
  totalSteps: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onResetSteps: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  divisions: StageDivision[];
  categories: StageCategory[];
  selectedDivisionId: string | null;
  selectedCategoryId: string | null;
  onSelectDivision: (id: string | null) => void;
  onSelectCategory: (id: string | null) => void;
  isVisible: boolean;
}

export function StageOperatorDock({
  mode,
  onSetMode,
  currentStep,
  totalSteps,
  onNextStep,
  onPrevStep,
  onResetSteps,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  divisions,
  categories,
  selectedDivisionId,
  selectedCategoryId,
  onSelectDivision,
  onSelectCategory,
  isVisible,
}: StageOperatorDockProps): React.JSX.Element {
  return (
    <aside
      aria-label="Stage Operator Dock"
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-none border border-amber-500/30 bg-slate-950/90 px-4 py-2.5 text-slate-100 shadow-2xl backdrop-blur-md">
        {/* Mode Selector */}
        <div className="flex items-center rounded-none border border-slate-800 bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={() => onSetMode("LIVE_TALLY")}
            className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
              mode === "LIVE_TALLY"
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Live Tally
          </button>
          <button
            type="button"
            onClick={() => onSetMode("WINNER_REVEAL")}
            className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
              mode === "WINNER_REVEAL"
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Coronation Reveal
          </button>
        </div>

        {/* Reveal Step Controls (visible in reveal mode) */}
        {mode === "WINNER_REVEAL" && (
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-400">
              {currentStep === 0
                ? "All Masked"
                : currentStep >= totalSteps
                  ? "Winner Crowned! 👑"
                  : `Reveal ${currentStep} of ${totalSteps}`}
            </span>

            <button
              type="button"
              onClick={onPrevStep}
              disabled={currentStep <= 0}
              title="Previous Step (ArrowLeft)"
              className="rounded-none border border-slate-700 bg-slate-900 p-1.5 text-slate-200 hover:border-slate-500 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onNextStep}
              disabled={currentStep >= totalSteps}
              title="Next Reveal (Space / ArrowRight)"
              className="flex items-center gap-1 rounded-none bg-amber-500 px-3 py-1 font-mono text-xs font-black tracking-wider text-slate-950 uppercase hover:bg-amber-400 disabled:pointer-events-none disabled:opacity-30"
            >
              Next Reveal
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onResetSteps}
              title="Reset Reveal Sequence (R)"
              className="rounded-none border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:border-slate-500 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Division & Category Filter Selectors */}
        {(divisions.length > 0 || categories.length > 0) && (
          <div className="hidden items-center gap-2 border-l border-slate-800 pl-3 lg:flex">
            {divisions.length > 0 && (
              <select
                aria-label="Filter by division"
                value={selectedDivisionId ?? ""}
                onChange={(e) => onSelectDivision(e.target.value || null)}
                className="rounded-none border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Divisions</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            {categories.length > 0 && (
              <select
                aria-label="Filter by category"
                value={selectedCategoryId ?? ""}
                onChange={(e) => onSelectCategory(e.target.value || null)}
                className="rounded-none border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? "Unmute Audio (M)" : "Mute Audio (M)"}
            className={`rounded-none border p-1.5 transition-colors ${
              isMuted
                ? "border-rose-600 bg-rose-950/60 text-rose-300"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
            }`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
            className="rounded-none border border-slate-700 bg-slate-900 p-1.5 text-slate-200 transition-colors hover:border-slate-500"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
