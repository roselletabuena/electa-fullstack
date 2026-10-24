"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Settings, Share2, Check, Calendar } from "lucide-react";
import type { OrganizerEventItemDto } from "../../types/dashboard-overview";
import { deriveEventState } from "../../utils/derive-event-state";

export interface EventCardProps {
  event: OrganizerEventItemDto;
}

interface StatusBadgeConfig {
  label: string;
  dotClass: string;
  badgeClass: string;
}

function getEventCardStatusBadge(
  event: OrganizerEventItemDto,
  operationalState: string,
): StatusBadgeConfig {
  if (event.publicationStatus === "ARCHIVED") {
    return {
      label: "Archived",
      dotClass: "bg-slate-400 dark:bg-slate-500",
      badgeClass:
        "border-slate-300 bg-white/95 text-slate-800 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200",
    };
  }

  if (operationalState === "Draft" || event.publicationStatus === "DRAFT") {
    return {
      label: "Draft",
      dotClass: "bg-amber-500",
      badgeClass:
        "border-amber-500/40 bg-white/95 text-amber-950 dark:border-amber-500/40 dark:bg-slate-900/90 dark:text-amber-300",
    };
  }

  if (operationalState === "Active" || event.isLive) {
    return {
      label: "Live Voting",
      dotClass: "bg-emerald-500 animate-pulse",
      badgeClass:
        "border-emerald-500/40 bg-white/95 text-emerald-950 dark:border-emerald-500/40 dark:bg-slate-900/90 dark:text-emerald-300",
    };
  }

  if (operationalState === "Scheduled" || (!event.isEnded && !event.isLive)) {
    return {
      label: "Scheduled",
      dotClass: "bg-sky-500",
      badgeClass:
        "border-sky-500/40 bg-white/95 text-sky-950 dark:border-sky-500/40 dark:bg-slate-900/90 dark:text-sky-300",
    };
  }

  return {
    label: "Completed",
    dotClass: "bg-slate-400 dark:bg-slate-500",
    badgeClass:
      "border-slate-300 bg-white/95 text-slate-800 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200",
  };
}

export function EventCard({ event }: Readonly<EventCardProps>): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const publicUrl = `${window.location.origin}/events/${event.slug}`;
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const formattedEndDate = new Date(event.endsAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const operationalState = deriveEventState({
    publicationStatus: event.publicationStatus,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  });

  const [hasImageError, setHasImageError] = useState(false);
  const statusBadge = getEventCardStatusBadge(event, operationalState);

  return (
    <article className="group flex flex-col overflow-hidden rounded-none border border-slate-300 bg-white shadow-xs transition-all duration-200 hover:border-slate-400 hover:shadow-md dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700">
      {/* Banner & Status Badge */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link
          href={`/events/${event.slug}/settings`}
          className="block size-full"
          tabIndex={-1}
          aria-hidden="true"
        >
          {event.bannerUrl && !hasImageError ? (
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-slate-100 text-sky-700 dark:bg-slate-800 dark:text-sky-400">
              <Calendar className="size-10 opacity-40" />
            </div>
          )}
        </Link>

        {/* Text-protection dark gradient scrim */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/25 to-transparent"
          aria-hidden="true"
        />

        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase shadow-xs backdrop-blur-xs ${statusBadge.badgeClass}`}
          >
            <span className={`size-1.5 rounded-none ${statusBadge.dotClass}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* End Date in Banner */}
        <div className="pointer-events-none absolute right-3 bottom-2.5 left-3 z-10 text-white">
          <p className="font-mono text-[11px] font-medium text-slate-200">
            Ends: <span className="font-bold text-white">{formattedEndDate}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-1.5">
          <h3 className="font-heading line-clamp-1 text-base font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400">
            <Link href={`/events/${event.slug}/settings`} className="hover:underline">
              {event.title}
            </Link>
          </h3>
          <p className="line-clamp-2 min-h-8 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {event.description || "No description provided."}
          </p>
        </div>

        {/* Metrics Telemetry */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <Link
            href={`/events/${event.slug}/contestants`}
            className="group/metric block transition-colors"
            title="View Contestants"
          >
            <span className="block text-[10px] font-bold tracking-widest text-slate-600 uppercase transition-colors group-hover/metric:text-sky-700 dark:text-slate-400 dark:group-hover/metric:text-sky-400">
              Contestants
            </span>
            <span className="mt-0.5 block font-mono text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {event.contestantsCount}
            </span>
          </Link>

          <div>
            <span className="block text-[10px] font-bold tracking-widest text-slate-600 uppercase dark:text-slate-400">
              Total Votes
            </span>
            <span className="mt-0.5 block font-mono text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {event.votesCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/events/${event.slug}/settings`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-none border border-slate-900 bg-slate-900 px-3 py-2 text-center text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition-colors hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span>Manage Event</span>
            <ArrowUpRight className="size-3.5 shrink-0" />
          </Link>

          <Link
            href={`/events/${event.slug}/settings`}
            aria-label="Event Settings"
            title="Event Settings & Categories"
            className="rounded-none border border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Settings className="size-4 shrink-0" />
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy Public Event Link"
            title={copied ? "Link Copied!" : "Copy Public Event Link"}
            className={`rounded-none border p-2 transition-colors ${
              copied
                ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {copied ? (
              <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2 className="size-4 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
