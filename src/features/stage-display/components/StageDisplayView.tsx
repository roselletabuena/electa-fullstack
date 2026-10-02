"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StageDisplayPayload, StageDisplayMode, StageCandidate } from "../types";
import { StageLiveTally } from "./StageLiveTally";
import { StageWinnerReveal } from "./StageWinnerReveal";
import { StageOperatorDock } from "./StageOperatorDock";
import { useStageHotkeys } from "../hooks/useStageHotkeys";
import { ConfettiCannon } from "../utils/confetti-cannon";
import {
  initAudio,
  setAudioMuted,
  isAudioSupported,
  playTensionDrone,
} from "../utils/sound-synthesizer";

interface StageDisplayViewProps {
  initialData: StageDisplayPayload;
}

export function StageDisplayView({ initialData }: StageDisplayViewProps): React.JSX.Element {
  const [mode, setMode] = useState<StageDisplayMode>("LIVE_TALLY");
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(
    initialData.selectedDivisionId,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialData.selectedCategoryId,
  );

  // Compute reveal candidates — top 3 by default
  const topRevealCandidates = React.useMemo<StageCandidate[]>(() => {
    return [...initialData.candidates]
      .filter((c) => c.rank !== null && c.rank !== undefined && c.rank <= 3)
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  }, [initialData.candidates]);

  const REVEAL_TOTAL = topRevealCandidates.length;
  const [revealStep, setRevealStep] = useState(0);

  // Filter candidates by selected division/category
  const displayCandidates = React.useMemo<StageCandidate[]>(() => {
    let filtered = initialData.candidates;
    if (selectedDivisionId) {
      filtered = filtered.filter((c) => c.divisionId === selectedDivisionId);
    }
    return filtered;
  }, [initialData.candidates, selectedDivisionId]);

  // Canvas ref for confetti
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<ConfettiCannon | null>(null);

  const fireConfetti = useCallback(() => {
    if (!canvasRef.current) return;
    if (!confettiRef.current) {
      confettiRef.current = new ConfettiCannon(canvasRef.current);
    }
    confettiRef.current.fire(220);
  }, []);

  // Audio initialization on first user interaction
  const enableAudio = useCallback(async () => {
    if (!isAudioSupported()) {
      setShowAudioPrompt(false);
      return;
    }
    const ok = await initAudio();
    if (ok) {
      setAudioEnabled(true);
      setShowAudioPrompt(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  }, [isMuted]);

  const handleNextStep = useCallback(() => {
    setRevealStep((prev) => {
      const next = Math.min(prev + 1, REVEAL_TOTAL);
      return next;
    });
  }, [REVEAL_TOTAL]);

  const handlePrevStep = useCallback(() => {
    setRevealStep((prev) => {
      const next = Math.max(prev - 1, 0);
      if (next > 0) playTensionDrone(400);
      return next;
    });
  }, []);

  const handleResetSteps = useCallback(() => {
    setRevealStep(0);
  }, []);

  const handleSetMode = useCallback(
    (newMode: StageDisplayMode) => {
      setMode(newMode);
      if (newMode === "WINNER_REVEAL") {
        setRevealStep(0);
        if (!audioEnabled && !showAudioPrompt) {
          void enableAudio();
        }
      }
    },
    [audioEnabled, showAudioPrompt, enableAudio],
  );

  const { isFullscreen, isControlsVisible, toggleFullscreen } = useStageHotkeys({
    enabled: !showAudioPrompt,
    onNext: handleNextStep,
    onPrev: handlePrevStep,
    onReset: handleResetSteps,
    onToggleMute: handleToggleMute,
    onToggleMode: () => handleSetMode(mode === "LIVE_TALLY" ? "WINNER_REVEAL" : "LIVE_TALLY"),
  });

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#040711] select-none">
      {/* Stage Spotlight Radial Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(245,158,11,0.05) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 50% 60%, rgba(6,182,212,0.03) 0%, transparent 60%)",
        }}
      />

      {/* Confetti Canvas — always on top of everything except audio prompt */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-40 h-full w-full"
        aria-hidden="true"
      />

      {/* Audio Enable Prompt Overlay */}
      <AnimatePresence>
        {showAudioPrompt && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#040711]/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-lg border border-amber-500/40 bg-slate-950 px-8 py-10 text-center shadow-[0_0_60px_rgba(245,158,11,0.1)]"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-4 text-5xl text-amber-400">🎭</div>
              <h1 className="font-heading mb-2 text-3xl font-black tracking-tight text-white uppercase">
                Stage Display Mode
              </h1>
              <p className="mb-6 font-sans text-sm text-slate-400">
                Click below to activate stage audio for suspenseful sound effects, fanfares, and
                coronation announcements.
              </p>
              <button
                type="button"
                id="stage-audio-enable-btn"
                onClick={enableAudio}
                className="font-heading w-full rounded-none border border-amber-400 bg-amber-500 px-8 py-4 text-sm font-black tracking-widest text-slate-950 uppercase shadow-lg transition-colors hover:bg-amber-400"
              >
                ✨ Enter Stage Mode & Enable Audio
              </button>
              <button
                type="button"
                onClick={() => setShowAudioPrompt(false)}
                className="mt-3 w-full rounded-none border border-slate-800 bg-slate-900 px-8 py-2.5 font-mono text-xs tracking-widest text-slate-400 uppercase transition-colors hover:bg-slate-800 hover:text-white"
              >
                Continue Without Audio
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-amber-500/10 bg-slate-950/40 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-widest text-amber-400 uppercase">
            LIVE — Stage Display
          </span>
        </div>
        <div className="text-center">
          <h1 className="font-heading max-w-sm truncate text-sm font-black tracking-widest text-white uppercase md:text-base">
            {initialData.eventTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-slate-500 md:block">
            {initialData.totalVotes.toLocaleString()} total votes
          </span>
        </div>
      </header>

      {/* Main Stage Content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "LIVE_TALLY" ? (
            <motion.div
              key="live-tally"
              className="h-full w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <StageLiveTally candidates={displayCandidates} isFrozen={initialData.isFrozen} />
            </motion.div>
          ) : (
            <motion.div
              key="winner-reveal"
              className="h-full w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <StageWinnerReveal
                candidates={topRevealCandidates}
                currentStep={revealStep}
                totalSteps={REVEAL_TOTAL}
                onFireConfetti={fireConfetti}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Operator Dock */}
      <StageOperatorDock
        mode={mode}
        onSetMode={handleSetMode}
        currentStep={revealStep}
        totalSteps={REVEAL_TOTAL}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        onResetSteps={handleResetSteps}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => void toggleFullscreen()}
        divisions={initialData.divisions}
        categories={initialData.categories}
        selectedDivisionId={selectedDivisionId}
        selectedCategoryId={selectedCategoryId}
        onSelectDivision={setSelectedDivisionId}
        onSelectCategory={setSelectedCategoryId}
        isVisible={isControlsVisible || !audioEnabled}
      />
    </div>
  );
}
