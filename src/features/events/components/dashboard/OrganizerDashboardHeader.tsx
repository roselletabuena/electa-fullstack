import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Calendar,
  ArrowLeft,
  Settings,
  Users,
  Wallet,
  Globe,
  Hash,
} from "lucide-react";
import { EventStateBadge } from "../EventStateBadge";
import { CopySlugButton } from "./CopySlugButton";
import { deriveEventState } from "../../utils/derive-event-state";
import type { Event } from "@/generated/client/client";
import type { UserSession } from "@/lib/auth/get-session";
import { cn } from "@/lib/utils";

export interface OrganizerDashboardHeaderProps {
  event: Event;
  user?: UserSession;
  activeSection?: "settings" | "contestants" | "revenue";
}

function formatScheduleRange(
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined,
): string {
  if (!startsAt) return "Schedule Pending";
  try {
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) return "Schedule Pending";
    const end = endsAt ? new Date(endsAt) : null;
    const fmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!end || Number.isNaN(end.getTime())) {
      return `Starts ${fmt.format(start)}`;
    }
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  } catch {
    return "Schedule Pending";
  }
}

const SECTIONS = [
  {
    id: "settings",
    label: "Event Settings",
    icon: Settings,
    hrefSuffix: "settings",
  },
  {
    id: "contestants",
    label: "Contestants",
    icon: Users,
    hrefSuffix: "contestants",
  },
  {
    id: "revenue",
    label: "Revenue & Payouts",
    icon: Wallet,
    hrefSuffix: "revenue",
  },
] as const;

export function OrganizerDashboardHeader({
  event,
  activeSection = "settings",
}: Readonly<OrganizerDashboardHeaderProps>): React.JSX.Element {
  const operationalState = deriveEventState({
    publicationStatus: event.publicationStatus,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  });

  return (
    <header className="relative border-b border-slate-200 bg-white before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-linear-to-r before:from-sky-500 before:via-sky-600 before:to-indigo-600 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 pt-5 pb-0 sm:px-6 sm:pt-6 lg:px-8">
        {/* Top Context Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Events
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="max-w-[140px] truncate font-mono text-[11px] font-bold text-slate-700 sm:max-w-[220px] dark:text-slate-300">
              {event.slug}
            </span>
          </div>
        </div>

        {/* Main Event Showcase & Action Deck */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-slate-50">
                {event.title}
              </h1>
              <EventStateBadge state={operationalState} />
            </div>

            {/* Metadata Badges Ribbon */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
              <div className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Globe className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                <span className="font-medium text-slate-400 dark:text-slate-500">Slug:</span>
                <code className="bg-slate-100 px-1.5 py-0.5 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {event.slug}
                </code>
              </div>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Calendar className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                <span>{formatScheduleRange(event.startsAt, event.endsAt)}</span>
              </div>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <div
                className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500"
                title={`Event UUID: ${event.id}`}
              >
                <Hash className="size-3 shrink-0 text-slate-400 dark:text-slate-500" />
                <span>ID:</span>
                <span className="font-mono text-slate-600 select-all dark:text-slate-400">
                  {event.id}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <CopySlugButton
              slug={event.slug}
              size="default"
              className="h-9 px-4 font-mono text-xs font-bold tracking-wider uppercase"
            />
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 border border-slate-900 bg-slate-900 px-4 py-2 font-mono text-xs font-extrabold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-slate-800 hover:shadow-md dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <ExternalLink className="size-3.5" />
              View Public Event
            </Link>
          </div>
        </div>

        {/* Section Navigation Dock */}
        <nav
          aria-label="Event dashboard sections"
          className="-mx-4 mt-6 flex scrollbar-none items-center gap-1 overflow-x-auto border-t border-slate-200 px-4 pt-0 sm:mx-0 sm:px-0 dark:border-slate-800"
        >
          <div className="flex w-full items-center gap-1 sm:gap-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <Link
                  key={section.id}
                  href={`/events/${event.slug}/${section.hrefSuffix}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative inline-flex shrink-0 items-center gap-2 rounded-none px-4 py-3.5 font-mono text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-all select-none",
                    isActive
                      ? "border-b-2 border-sky-600 bg-sky-50/50 text-sky-950 dark:border-sky-400 dark:bg-sky-950/40 dark:text-sky-200"
                      : "border-b-2 border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900/40 dark:hover:text-slate-200",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                    )}
                  />
                  <span>{section.label}</span>
                  {isActive && <span className="size-1.5 shrink-0 bg-sky-600 dark:bg-sky-400" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
