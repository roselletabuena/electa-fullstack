"use client";

import React from "react";
import Image from "next/image";
import { Play, MapPin, Zap } from "lucide-react";
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
        <MapPin
          className="contestant-dossier-icon size-3 shrink-0 text-slate-300"
          aria-hidden="true"
        />
        <span className="max-w-35 truncate">{contestant.hometown}</span>
      </div>
    );
  } else if (divisionDisplay) {
    locationOrDivisionNode = <span className="text-slate-400 capitalize">{divisionDisplay}</span>;
  }

  return (
    <div className="contestant-card group relative flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-none border border-slate-300 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-500 hover:shadow-xl dark:border-slate-800 dark:bg-[#0d1424]">
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={contestant.contestantNumber <= 4}
          />

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity group-hover:opacity-95" />

          {/* Candidate Number Badge (Clean Refined Pill) */}
          <div className="contestant-num-badge absolute top-2 left-2 flex items-center rounded-none border border-slate-300 bg-white/95 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-slate-950 shadow-sm backdrop-blur-md sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-100">
            <span>#{String(contestant.contestantNumber).padStart(2, "0")}</span>
          </div>

          {/* Division Badge & Media Badges */}
          <div className="absolute top-2 right-2 flex items-center gap-1 sm:top-3 sm:right-3 sm:gap-1.5">
            {hasVideo && (
              <div className="flex items-center gap-1 rounded-none border border-rose-500/30 bg-slate-950/80 p-1 text-xs text-rose-400 backdrop-blur-md">
                <Play className="size-3 fill-rose-400" />
              </div>
            )}
            {photoCount > 1 && (
              <span className="contestant-card-photo-badge rounded-none border border-white/20 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-200 backdrop-blur-md sm:px-2 sm:text-[10px]">
                {photoCount} Photos
              </span>
            )}
          </div>

          {/* Sash Badge (Pageant Editorial) */}
          {(contestant.hometown || divisionDisplay) && (
            <div className="contestant-sash-badge absolute top-3 right-3 hidden items-center backdrop-blur-md">
              <span>{contestant.hometown || divisionDisplay}</span>
            </div>
          )}

          {/* Category Pills (Floating Over Bottom Gradient) */}
          {contestant.categories.length > 0 && (
            <div className="absolute right-2 bottom-12 left-2 flex flex-wrap gap-1 overflow-hidden sm:right-3 sm:bottom-16 sm:left-3">
              {contestant.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="contestant-card-category-pill max-w-full truncate rounded-none border border-white/20 bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-100 backdrop-blur-md sm:px-2 sm:text-[10px]"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Candidate Identity Dossier Snippet */}
          <div className="absolute right-2 bottom-2 left-2 min-w-0 overflow-hidden sm:right-3 sm:bottom-3 sm:left-3">
            <h3 className="contestant-name font-heading truncate text-sm font-extrabold tracking-tight text-white drop-shadow-xs transition-colors group-hover:text-sky-300 sm:text-base md:text-lg">
              {contestant.name}
            </h3>

            <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-300 sm:mt-1 sm:text-xs">
              {locationOrDivisionNode}

              {contestant.heightCm && (
                <span className="font-mono text-[10px] text-slate-300 sm:text-[11px]">
                  {contestant.heightCm} cm
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Card Action Bar */}
      <div className="contestant-card-footer flex items-center justify-between gap-1.5 border-t border-slate-200 bg-slate-50/90 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex min-w-0 flex-col justify-center">
          {contestant.voteCount > 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="contestant-vote-count font-mono text-sm font-extrabold tracking-tight text-slate-900 sm:text-base dark:text-slate-50">
                {contestant.voteCount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold tracking-wider text-slate-700 uppercase sm:text-[10px] dark:text-slate-300">
                {contestant.voteCount === 1 ? "vote" : "votes"}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="contestant-vote-count font-mono text-sm font-extrabold tracking-tight text-slate-600 sm:text-base dark:text-slate-300">
                0
              </span>
              <span className="text-[9px] font-bold tracking-wider text-slate-600 uppercase sm:text-[10px] dark:text-slate-300">
                votes
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {onVoteClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onVoteClick(contestant);
              }}
              className="btn-pageant-boost-outline hidden items-center gap-1 px-2.5 py-1 text-xs font-semibold tracking-wider uppercase transition-all"
              aria-label={`Boost vote for ${contestant.name}`}
            >
              <Zap className="size-3 fill-current" aria-hidden="true" />
              <span>Boost</span>
            </button>
          )}
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
