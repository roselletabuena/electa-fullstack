"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Settings, Share2, Check, Calendar } from "lucide-react";
import type { OrganizerEventItemDto } from "../../types/dashboard-overview";

export interface EventCardProps {
  event: OrganizerEventItemDto;
}

export function EventCard({ event }: EventCardProps): React.JSX.Element {
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

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Banner & Status Badge */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-indigo-900/30 to-purple-900/30 text-indigo-400">
            <Calendar className="size-10 opacity-40" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3 z-10">
          {event.isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              <span className="size-1.5 animate-ping rounded-full bg-white" />
              LIVE VOTING
            </span>
          ) : event.publicationStatus === "DRAFT" ? (
            <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              DRAFT
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              COMPLETED
            </span>
          )}
        </div>

        {/* End Date in Banner */}
        <div className="absolute right-3 bottom-2.5 left-3 text-white">
          <p className="text-[11px] font-medium text-slate-200">
            Ends: <span className="font-bold text-white">{formattedEndDate}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-1.5">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {event.title}
          </h3>
          <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {event.description || "No description provided."}
          </p>
        </div>

        {/* Metrics Sub-Card */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800/80 dark:bg-slate-950">
            <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Contestants
            </p>
            <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
              {event.contestantsCount} Registered
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800/80 dark:bg-slate-950">
            <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Total Votes
            </p>
            <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
              {event.votesCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/events/${event.slug}/contestants`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Users className="size-3.5 shrink-0" />
            <span>Candidates ({event.contestantsCount})</span>
          </Link>

          <Link
            href={`/events/${event.slug}/settings`}
            aria-label="Event Settings"
            title="Event Settings & Categories"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Settings className="size-4 shrink-0" />
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy Public Event Link"
            title={copied ? "Link Copied!" : "Copy Public Event Link"}
            className={`rounded-xl border p-2 transition-colors ${
              copied
                ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {copied ? (
              <Check className="size-4 shrink-0" />
            ) : (
              <Share2 className="size-4 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
