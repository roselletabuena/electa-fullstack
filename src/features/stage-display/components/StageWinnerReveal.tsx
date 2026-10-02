"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Crown, Sparkles, HelpCircle, Trophy } from "lucide-react";
import type { StageCandidate } from "../types";
import { playRevealChime, playVictoryFanfare, playTensionDrone } from "../utils/sound-synthesizer";

interface StageWinnerRevealProps {
  candidates: StageCandidate[];
  currentStep: number;
  totalSteps: number;
  onFireConfetti: () => void;
}

export function StageWinnerReveal({
  candidates,
  currentStep,
  totalSteps,
  onFireConfetti,
}: StageWinnerRevealProps): React.JSX.Element {
  const prevStepRef = useRef(currentStep);

  // Take top 3 or top N candidates sorted by rank (e.g. #3, #2, #1)
  const topCandidates = [...candidates]
    .filter((c) => c.rank !== null && c.rank !== undefined)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, totalSteps || 3);

  // Reveal order is reverse rank: lowest rank first, then up to #1 Queen
  // E.g., for Top 3: revealIndex 0 is Rank 3 (unveiled at step 1),
  // revealIndex 1 is Rank 2 (unveiled at step 2),
  // revealIndex 2 is Rank 1 (unveiled at step 3).
  const revealItems = [...topCandidates].reverse();

  useEffect(() => {
    // Only trigger sound effects when stepping forward
    if (currentStep > prevStepRef.current) {
      if (currentStep >= totalSteps && totalSteps > 0) {
        // Grand climax fanfare & confetti on final winner reveal!
        playVictoryFanfare();
        onFireConfetti();
      } else {
        // Runner up reveal chime
        playRevealChime();
      }
    } else if (currentStep < prevStepRef.current && currentStep > 0) {
      playTensionDrone(500);
    }
    prevStepRef.current = currentStep;
  }, [currentStep, totalSteps, onFireConfetti]);

  if (topCandidates.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <Trophy className="mb-4 h-16 w-16 text-slate-700" />
        <h2 className="font-heading text-2xl font-black tracking-widest text-slate-300 uppercase">
          No Ranked Candidates Found
        </h2>
        <p className="mt-2 font-mono text-sm text-slate-500">
          Rankings must be computed before launching the coronation reveal sequence.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-4 py-4 md:px-8">
      {/* Title & Stage Status */}
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-none border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs tracking-widest text-amber-400 uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Official Coronation Reveal Sequence
        </div>
        <h2 className="font-heading text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
          {currentStep >= totalSteps
            ? "👑 Coronation Completed — All Hail The Queen! 👑"
            : currentStep === 0
              ? "All Standings Concealed — Awaiting Next Reveal"
              : `Announcing Rank ${totalSteps - currentStep + 1} Announcement`}
        </h2>
      </div>

      {/* Cards Row */}
      <div className="grid w-full grid-cols-1 items-end justify-center gap-6 md:grid-cols-3 lg:gap-8">
        {revealItems.map((candidate, index) => {
          // Reveal step mapping:
          // index 0 (Rank 3) revealed when currentStep >= 1
          // index 1 (Rank 2) revealed when currentStep >= 2
          // index 2 (Rank 1) revealed when currentStep >= 3
          const isRevealed = currentStep >= index + 1;
          const isWinner = candidate.rank === 1;
          const rankTitle =
            candidate.rank === 1
              ? "Queen / Title Winner"
              : candidate.rank === 2
                ? "1st Runner Up"
                : candidate.rank === 3
                  ? "2nd Runner Up"
                  : `Rank #${candidate.rank}`;

          return (
            <div
              key={candidate.id}
              className={`flex flex-col items-center transition-all duration-700 ${
                isWinner ? "z-20 order-1 md:order-2 md:scale-105" : "order-2 md:order-1"
              }`}
            >
              <div
                className={`relative w-full rounded-none p-5 text-center transition-all duration-700 ${
                  isRevealed
                    ? isWinner
                      ? "border-2 border-amber-400 bg-[#0f172a] shadow-[0_0_60px_rgba(245,158,11,0.4)]"
                      : "border-2 border-slate-400 bg-[#0a1020] shadow-[0_0_30px_rgba(203,213,225,0.2)]"
                    : "border-2 border-slate-800 bg-[#060a14] opacity-85 shadow-none"
                }`}
              >
                {/* Badge Header */}
                <div
                  className={`font-heading absolute -top-4 left-1/2 -translate-x-1/2 border px-4 py-1 text-xs font-black tracking-widest uppercase ${
                    isRevealed
                      ? isWinner
                        ? "flex items-center gap-1.5 border-amber-500 bg-amber-400 text-slate-950 shadow-md"
                        : "border-slate-400 bg-slate-300 text-slate-950"
                      : "border-slate-700 bg-slate-800 text-slate-400"
                  }`}
                >
                  {isWinner && <Crown className="h-3.5 w-3.5" />}
                  {rankTitle}
                </div>

                {/* Candidate Photo / Concealed Silhouette */}
                <div className="relative mx-auto mb-4 flex aspect-4/5 max-h-72 w-full items-center justify-center overflow-hidden border border-slate-800 bg-slate-950">
                  {isRevealed ? (
                    <Image
                      src={candidate.avatarUrl || "/placeholder-contestant.webp"}
                      alt={candidate.name}
                      fill
                      sizes="400px"
                      priority={isWinner}
                      className="animate-in fade-in zoom-in-95 object-cover duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-700">
                      <HelpCircle className="mb-2 h-16 w-16 animate-pulse text-amber-500/30" />
                      <span className="font-mono text-xs tracking-widest text-slate-600 uppercase">
                        Sealed In Vault
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                {isRevealed ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div
                      className={`font-mono text-xs font-bold tracking-wider uppercase ${
                        isWinner ? "text-amber-400" : "text-slate-400"
                      }`}
                    >
                      Candidate #{String(candidate.contestantNumber).padStart(2, "0")}
                    </div>
                    <div className="font-heading mt-1 truncate text-xl font-black text-white md:text-2xl">
                      {candidate.name}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                      <span className="font-mono text-xs tracking-wider text-slate-400 uppercase">
                        Official Tally
                      </span>
                      <span
                        className={`font-mono text-xl font-black ${
                          isWinner ? "text-amber-400" : "text-slate-200"
                        }`}
                      >
                        {candidate.voteCount?.toLocaleString() ?? 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="font-heading text-sm font-bold tracking-widest text-slate-500 uppercase">
                      Awaiting Reveal Cue
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-600">
                      Press Space to Reveal
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
