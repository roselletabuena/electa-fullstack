"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Settings, Share2, Check, Calendar } from "lucide-react";
import type { OrganizerEventItemDto } from "../../types/dashboard-overview";

export interface EventCardProps {
  event: OrganizerEventItemDto;
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

  let statusBadge = { label: "Completed", className: "bg-slate-700 text-white" };
  if (event.isLive) {
    statusBadge = { label: "Live Voting", className: "bg-emerald-700 text-white" };
  } else if (event.publicationStatus === "DRAFT") {
    statusBadge = { label: "Draft", className: "bg-amber-500 text-slate-950" };
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-none border border-slate-300 bg-white shadow-xs transition-all hover:border-slate-400 hover:shadow-md dark:border-slate-800 dark:bg-[#0d1424] dark:hover:border-slate-700">
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
          <div className="flex size-full items-center justify-center bg-slate-100 text-sky-700 dark:bg-slate-800 dark:text-sky-400">
            <Calendar className="size-10 opacity-40" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase ${statusBadge.className}`}
          >
            {event.isLive && <span className="size-1.5 animate-ping bg-white" />}
            {statusBadge.label}
          </span>
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
          <h3 className="font-heading line-clamp-1 text-base font-extrabold text-slate-900 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400">
            {event.title}
          </h3>
          <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
            {event.description || "No description provided."}
          </p>
        </div>

        {/* Metrics Sub-Card */}
        <dl className="grid grid-cols-2 divide-x divide-slate-300 border-t border-slate-300 pt-3 text-xs dark:divide-slate-800 dark:border-slate-800">
          <div className="pr-3">
            <dt className="text-[10px] font-bold tracking-widest text-slate-600 uppercase dark:text-slate-400">
              Contestants
            </dt>
            <dd className="mt-0.5 font-mono font-bold text-slate-900 dark:text-slate-100">
              {event.contestantsCount}
            </dd>
          </div>

          <div className="pl-3">
            <dt className="text-[10px] font-bold tracking-widest text-slate-600 uppercase dark:text-slate-400">
              Total Votes
            </dt>
            <dd className="mt-0.5 font-mono font-bold text-slate-900 dark:text-slate-100">
              {event.votesCount.toLocaleString()}
            </dd>
          </div>
        </dl>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/events/${event.slug}/contestants`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-none border border-slate-900 bg-slate-900 px-3 py-2 text-center text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition-colors hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Users className="size-3.5 shrink-0" />
            <span>Candidates ({event.contestantsCount})</span>
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
