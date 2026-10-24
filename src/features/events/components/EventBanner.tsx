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

export function EventBanner({ event, totalVotes }: Readonly<EventBannerProps>): React.JSX.Element {
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
    <header className="event-banner-card relative w-full overflow-hidden rounded-none border border-slate-300 bg-slate-950 shadow-md transition-all dark:border-slate-800">
      {/* Full-bleed Banner Backdrop Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={event.bannerUrl}
          alt={event.title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover object-center transition-transform duration-700 hover:scale-105"
        />
        {/* Multi-layer Dark Gradient Scrim (Protects contrast across all lighting conditions) */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/75 via-transparent to-transparent" />
      </div>

      {/* Overlaid Header Content Container with Generous Spacing */}
      <div className="relative z-10 flex min-h-[350px] flex-col justify-between p-6 sm:min-h-[390px] sm:p-8 md:p-10">
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <EventStateBadge state={event.operationalState} className="event-state-badge" />
            <span className="event-slug-badge inline-flex items-center gap-1.5 rounded-none border border-white/20 bg-black/60 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-200 uppercase backdrop-blur-md">
              <Globe2 className="event-slug-icon size-3 text-slate-300" aria-hidden="true" />
              <span>electa.ph/events/{event.slug}</span>
            </span>
            <span className="event-official-badge inline-flex items-center gap-1.5 rounded-none border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-200 uppercase backdrop-blur-md">
              <Sparkles className="size-3 text-amber-300" aria-hidden="true" />
              <span>Official Contest</span>
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2 pt-1">
            <h1 className="event-banner-title font-heading text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            {event.description && (
              <p className="event-banner-description max-w-3xl text-xs leading-relaxed text-slate-200 drop-shadow-xs sm:text-sm md:text-base">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Operational Schedule Timeline & Live Leaderboard */}
        <div className="event-banner-timeline mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-4 text-xs text-slate-200">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="event-schedule-icon size-3.5 text-sky-400" aria-hidden="true" />
              <span className="text-slate-200">
                <strong className="timeline-label font-bold text-white">Opens:</strong>{" "}
                {formattedStartsAt}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="event-schedule-icon size-3.5 text-sky-400" aria-hidden="true" />
              <span className="text-slate-200">
                <strong className="timeline-label font-bold text-white">Closes:</strong>{" "}
                {formattedEndsAt}
              </span>
            </div>
          </div>

          {shouldShowLiveLeaderboard && (
            <Link
              href={`/events/${event.slug}/leaderboard`}
              className="font-heading inline-flex items-center gap-2 border border-amber-400 bg-amber-500 px-3.5 py-1.5 text-xs font-black tracking-wider text-slate-950 uppercase shadow-xs transition-transform hover:scale-105 hover:bg-amber-400"
            >
              <Trophy className="size-3.5" aria-hidden="true" />
              <span>Live Leaderboard</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
