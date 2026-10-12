import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, CalendarClock, Lock, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicEventDto } from "../../types";
import { formatLifecycleCountdown } from "../../utils/trending-helpers";

export interface TrendingEventCardProps {
  event: PublicEventDto;
  className?: string;
}

export function TrendingEventCard({
  event,
  className,
}: Readonly<TrendingEventCardProps>): React.JSX.Element {
  const { pillLabel, pillVariant, actionLabel, isUrgent } = formatLifecycleCountdown(
    event,
    new Date(),
  );

  const contestantCount = event.contestants?.length ?? 0;
  const locationText = event.location || "Philippines";

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-none border border-slate-300 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700",
        className,
      )}
    >
      {/* Top Banner with Image, Dark Scrim, and Status Pill */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <Image
          src={event.bannerUrl}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Text-protection scrim for accessibility */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/30 to-transparent"
          aria-hidden="true"
        />

        {/* Top Overlay Badge / Countdown Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-md",
              pillVariant === "active" &&
                (isUrgent
                  ? "animate-pulse border border-rose-500/50 bg-rose-950/80 text-rose-300"
                  : "border border-emerald-500/40 bg-emerald-950/80 text-emerald-300"),
              pillVariant === "scheduled" &&
                "border border-amber-500/40 bg-amber-950/80 text-amber-300",
              pillVariant === "closed" && "border border-slate-700 bg-slate-900/90 text-slate-300",
            )}
          >
            {pillVariant === "active" && (
              <Radio
                className="h-3 w-3 shrink-0 animate-pulse text-emerald-400"
                aria-hidden="true"
              />
            )}
            {pillVariant === "scheduled" && (
              <CalendarClock className="h-3 w-3 shrink-0 text-amber-400" aria-hidden="true" />
            )}
            {pillVariant === "closed" && (
              <Lock className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
            )}
            <span>{pillLabel}</span>
          </span>
        </div>

        {/* Bottom Banner Overlays (Location & Contestant Count) */}
        <div className="absolute right-3 bottom-3 left-3 z-10 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-200">
          <span className="inline-flex items-center gap-1 truncate drop-shadow-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden="true" />
            <span className="truncate">{locationText}</span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-none border border-white/20 bg-black/40 px-2 py-0.5 text-white backdrop-blur-xs">
            <Users className="h-3 w-3 shrink-0 text-sky-400" aria-hidden="true" />
            <span>
              {contestantCount} {contestantCount === 1 ? "Contestant" : "Contestants"}
            </span>
          </span>
        </div>
      </div>

      {/* Card Body: Title, Description, and CTA Button */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="heading-font line-clamp-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {event.title}
          </h3>

          <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {event.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex w-full items-center justify-center rounded-none border border-slate-900 bg-slate-900 px-4 py-2.5 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition-all duration-150 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span>{actionLabel}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
