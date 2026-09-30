"use client";

import React from "react";
import Image from "next/image";
import { Play, Sparkles, MapPin } from "lucide-react";
import type { ContestantDto } from "../types";
import { FreeVoteButton } from "@/features/voting/components/FreeVoteButton";

interface ContestantCardProps {
  contestant: ContestantDto;
  onSelect: (contestant: ContestantDto) => void;
  onVoteClick?: ((contestant: ContestantDto) => void) | undefined;
}

export const ContestantCard: React.FC<ContestantCardProps> = ({
  contestant,
  onSelect,
  onVoteClick,
}) => {
  const hasVideo = contestant.media.some((m) => m.mediaType === "VIDEO_EMBED");
  const photoCount = contestant.media.filter((m) => m.mediaType === "PHOTO").length || 1;

  return (
    <div
      onClick={() => onSelect(contestant)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-none border border-slate-300 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl dark:border-slate-800 dark:bg-[#0d1424]"
    >
      {/* 4:5 Portrait Image Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-950">
        <Image
          src={contestant.avatarUrl || "/placeholder-contestant.webp"}
          alt={contestant.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={contestant.contestantNumber <= 4}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity group-hover:opacity-95" />

        {/* Candidate Number Badge (Clean Brutalist Pill) */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-none border border-slate-300 bg-white/95 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-slate-950 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-100">
          <Sparkles className="size-3 text-sky-600 dark:text-sky-400" />
          <span>#{String(contestant.contestantNumber).padStart(2, "0")}</span>
        </div>

        {/* Division Badge & Media Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {hasVideo && (
            <div className="flex items-center gap-1 rounded-none border border-rose-500/30 bg-slate-950/80 p-1 text-xs text-rose-400 backdrop-blur-md">
              <Play className="size-3 fill-rose-400" />
            </div>
          )}
          {photoCount > 1 && (
            <span className="rounded-none border border-white/20 bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-200 backdrop-blur-md">
              {photoCount} Photos
            </span>
          )}
        </div>

        {/* Category Pills (Floating Over Bottom Gradient) */}
        {contestant.categories.length > 0 && (
          <div className="absolute right-3 bottom-16 left-3 flex flex-wrap gap-1">
            {contestant.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="rounded-none border border-white/20 bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-slate-100 backdrop-blur-md"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Candidate Identity Dossier Snippet */}
        <div className="absolute right-3 bottom-3 left-3">
          <h3 className="font-heading font-extrabold line-clamp-1 text-lg tracking-tight text-white drop-shadow-xs transition-colors group-hover:text-sky-300">
            {contestant.name}
          </h3>

          <div className="mt-1 flex items-center justify-between text-xs text-slate-300">
            {contestant.hometown ? (
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="size-3 shrink-0 text-sky-400" />
                <span className="max-w-35 truncate">{contestant.hometown}</span>
              </div>
            ) : (
              <span className="text-slate-400 capitalize">
                {contestant.division.toLowerCase()} Division
              </span>
            )}

            {contestant.heightCm && (
              <span className="font-mono text-[11px] text-slate-300">{contestant.heightCm} cm</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {contestant.voteCount > 0 ? (
            <span>
              <strong className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {contestant.voteCount.toLocaleString()}
              </strong>{" "}
              votes
            </span>
          ) : (
            <span className="text-slate-400">Official Candidate</span>
          )}
        </div>

        <FreeVoteButton
          eventId={contestant.eventId}
          contestantId={contestant.id}
          contestantName={contestant.name}
          size="sm"
          onBoostClick={onVoteClick ? () => onVoteClick(contestant) : undefined}
        />
      </div>
    </div>
  );
};
