"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TurnoutGauge } from "./turnout-gauge";
import { ElectionAuditPanel } from "./election-audit-panel";
import type { TurnoutMetricsDto, OfficeTallyDto } from "../types/turnout-audit";

export interface ElectionDashboardClientProps {
  event: {
    id: string;
    title: string;
    slug: string;
    startsAt: string;
    endsAt: string;
    organizerId: string;
  };
  turnout: TurnoutMetricsDto;
  offices: OfficeTallyDto[];
  user: {
    userId: string;
    email?: string;
  };
}

export function ElectionDashboardClient({
  event,
  turnout,
  offices,
  user,
}: ElectionDashboardClientProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = (): void => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Navigation & Title */}
      <div className="border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424] rounded-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/events/${event.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
              >
                ← Back to Event Overview
              </Link>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-heading">
              {event.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Election Audit & Live Turnout Command Center • Commissioner: {user.email ?? user.userId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="refresh-metrics-button"
              disabled={isPending}
              onClick={handleRefresh}
              className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-none cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Refreshing..." : "↻ Refresh Live Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Component 1: Live Turnout Gauge */}
      <TurnoutGauge metrics={turnout} />

      {/* Component 2: Official Audit & Results Panel */}
      <ElectionAuditPanel
        eventId={event.id}
        eventTitle={event.title}
        endsAt={event.endsAt}
        turnout={turnout}
        offices={offices}
      />
    </div>
  );
}
