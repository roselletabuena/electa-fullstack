import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Calendar, Globe2, Sparkles, Trophy } from "lucide-react";

import { EventStateBadge } from "./EventStateBadge";
import type { PublicEventDto } from "../types";

export interface EventBannerProps {
  event: PublicEventDto;
  totalVotes?: number;
}

export function EventBanner({ event, totalVotes }: EventBannerProps): React.JSX.Element {
  const aggregateVotes =
    typeof totalVotes === "number"
      ? totalVotes
      : (event.contestants?.reduce((sum, c) => sum + (c.voteCount ?? 0), 0) ?? 0);

  const isLive = event.operationalState === "Active";
  const shouldShowLiveLeaderboard = isLive && aggregateVotes > 1;

  const formattedStartsAt = new Date(event.startsAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const formattedEndsAt = new Date(event.endsAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <header className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-md transition-all dark:border-slate-800">
      {/* Compact Banner Backdrop Image */}
      <div className="relative h-60 w-full overflow-hidden sm:h-72 md:h-80">
        <Image
          src={event.bannerUrl}
          alt={event.title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover object-center transition-transform duration-700 hover:scale-105"
        />
        {/* Dark Vignette / Scrim Overlay (Prevents white glare while preserving vibrant photo details) */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
      </div>

      {/* Overlaid Header Container (Compact & True to Electa Branding) */}
      <div className="relative -mt-28 space-y-4 px-6 pb-6 sm:-mt-32 sm:px-8 sm:pb-7">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <EventStateBadge state={event.operationalState} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-xs text-slate-200 backdrop-blur-md">
            <Globe2 className="size-3 text-slate-400" />
            <span>electa.ph/events/{event.slug}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
            <Sparkles className="size-3 text-sky-400" />
            <span>Official Contest</span>
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl">
            {event.title}
          </h1>
          {event.description && (
            <p className="max-w-3xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              {event.description}
            </p>
          )}
        </div>

        {/* Operational Schedule Timeline & Live Leaderboard */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-sky-400" />
              <span>
                <strong className="text-white">Opens:</strong> {formattedStartsAt}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-sky-400" />
              <span>
                <strong className="text-white">Closes:</strong> {formattedEndsAt}
              </span>
            </div>
          </div>

          {shouldShowLiveLeaderboard && (
            <Link
              href={`/events/${event.slug}/leaderboard`}
              className="font-heading inline-flex items-center gap-2 border border-amber-400 bg-amber-500 px-3.5 py-1.5 text-xs font-black tracking-wider text-slate-950 uppercase shadow-xs transition-transform hover:scale-105 hover:bg-amber-400"
            >
              <Trophy className="size-3.5" />
              <span>Live Leaderboard</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
