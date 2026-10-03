import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { EventStateBadge } from "../EventStateBadge";
import { CopySlugButton } from "./CopySlugButton";
import { deriveEventState } from "../../utils/derive-event-state";
import type { Event } from "@/generated/client/client";
import type { UserSession } from "@/lib/auth/get-session";
import { cn } from "@/lib/utils";

export interface OrganizerDashboardHeaderProps {
  event: Event;
  user: UserSession;
  activeSection?: "settings" | "contestants" | "revenue";
}

export function OrganizerDashboardHeader({
  event,
  user,
  activeSection = "settings",
}: OrganizerDashboardHeaderProps): React.JSX.Element {
  const operationalState = deriveEventState({
    publicationStatus: event.publicationStatus,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  });

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
            <span className="truncate">
              Organizer:{" "}
              <strong className="font-medium text-slate-700 dark:text-slate-300">
                {user.email}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl dark:text-slate-50">
                {event.title}
              </h1>
              <EventStateBadge state={operationalState} />
            </div>
            <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                Slug: {event.slug}
              </span>
              <span>•</span>
              <span>ID: {event.id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <CopySlugButton slug={event.slug} />
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ExternalLink className="size-3.5" />
              View Public Event
            </Link>
          </div>
        </div>

        {/* Section Navigation */}
        <nav className="mt-6 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <Link
            href={`/events/${event.slug}/settings`}
            className={cn(
              "inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all",
              activeSection === "settings"
                ? "border border-sky-300 bg-sky-50 text-sky-800 shadow-xs dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
            )}
          >
            <Settings className="size-3.5" />
            Event Settings
          </Link>
          <Link
            href={`/events/${event.slug}/contestants`}
            className={cn(
              "inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all",
              activeSection === "contestants"
                ? "border border-sky-300 bg-sky-50 text-sky-800 shadow-xs dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
            )}
          >
            <Users className="size-3.5" />
            Contestants
          </Link>
          <Link
            href={`/events/${event.slug}/revenue`}
            className={cn(
              "inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all",
              activeSection === "revenue"
                ? "border border-sky-300 bg-sky-50 text-sky-800 shadow-xs dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
            )}
          >
            <Wallet className="size-3.5" />
            Revenue & Payouts
          </Link>
        </nav>
      </div>
    </header>
  );
}
