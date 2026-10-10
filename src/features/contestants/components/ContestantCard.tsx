"use client";

import React from "react";
import Image from "next/image";
import { Play, Sparkles, MapPin } from "lucide-react";
import type { ContestantDto } from "../types";
import { FreeVoteButton } from "@/features/voting/components/FreeVoteButton";

interface ContestantCardProps {
  readonly contestant: ContestantDto;
  readonly onSelect: (contestant: ContestantDto) => void;
  readonly onVoteClick?: ((contestant: ContestantDto) => void) | undefined;
}

export const ContestantCard: React.FC<ContestantCardProps> = ({
  contestant,
  onSelect,
  onVoteClick,
}) => {
  const hasVideo = contestant.media.some((m) => m.mediaType === "VIDEO_EMBED");
  const photosMedia = contestant.media.filter((m) => m.mediaType === "PHOTO");
  const photoCount = photosMedia.length || 1;

  const coverPhoto =
    contestant.media.find((m) => m.isCover && m.mediaType === "PHOTO")?.url ||
    photosMedia[0]?.url ||
    contestant.avatarUrl ||
    "/placeholder-contestant.webp";

  const divisionDisplay = contestant.divisionRef?.name || contestant.divisionName;

  let locationOrDivisionNode: React.ReactNode = null;
  if (contestant.hometown) {
    locationOrDivisionNode = (
      <div className="flex items-center gap-1 text-slate-300">
        <MapPin className="size-3 shrink-0 text-sky-400" />
        <span className="max-w-35 truncate">{contestant.hometown}</span>
      </div>
    );
  } else if (divisionDisplay) {
    locationOrDivisionNode = <span className="text-slate-400 capitalize">{divisionDisplay}</span>;
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-none border border-slate-300 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl dark:border-slate-800 dark:bg-[#0d1424]">
      {/* 4:5 Portrait Image Container & Profile Trigger */}
      <button
        type="button"
        onClick={() => onSelect(contestant)}
        aria-label={`View profile for ${contestant.name}`}
        className="relative block w-full cursor-pointer border-none bg-transparent p-0 text-left focus:outline-hidden"
      >
        <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-950">
          <Image
            src={coverPhoto}
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
            <h3 className="font-heading line-clamp-1 text-lg font-extrabold tracking-tight text-white drop-shadow-xs transition-colors group-hover:text-sky-300">
              {contestant.name}
            </h3>

            <div className="mt-1 flex items-center justify-between text-xs text-slate-300">
              {locationOrDivisionNode}

              {contestant.heightCm && (
                <span className="font-mono text-[11px] text-slate-300">
                  {contestant.heightCm} cm
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Card Action Bar */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/90 px-3 py-2.5 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex min-w-0 flex-col justify-center">
          {contestant.voteCount > 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                {contestant.voteCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {contestant.voteCount === 1 ? "vote" : "votes"}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold tracking-tight text-slate-400 dark:text-slate-500">
                0
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                votes
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <FreeVoteButton
            eventId={contestant.eventId}
            contestantId={contestant.id}
            contestantName={contestant.name}
            contestantNumber={contestant.contestantNumber}
            contestantAvatarUrl={coverPhoto}
            divisionName={
              contestant.divisionRef?.name || contestant.divisionName || contestant.division
            }
            size="sm"
            onBoostClick={onVoteClick ? () => onVoteClick(contestant) : undefined}
          />
        </div>
      </div>
    </div>
  );
};
