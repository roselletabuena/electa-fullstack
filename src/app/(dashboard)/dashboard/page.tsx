import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import {
  computeEventStatus,
  computeDashboardMetrics,
} from "@/features/events/utils/dashboard-metrics";
import type {
  OrganizerEventItemDto,
  DashboardMetricsDto,
} from "@/features/events/types/dashboard-overview";
import { EventsDashboardClient } from "@/features/events/components/dashboard-overview/EventsDashboardClient";

export default async function OrganizerDashboardPage(): Promise<React.JSX.Element> {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=%2Fdashboard");
  }

  // Multi-tenant query: fetch only events owned by this authenticated organizer
  const rawEvents = await db.event.findMany({
    where: {
      organizerId: session.userId,
    },
    include: {
      _count: {
        select: {
          contestants: true,
        },
      },
      contestants: {
        select: {
          voteCount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  const events: OrganizerEventItemDto[] = rawEvents.map((ev) => {
    const { isLive, isEnded } = computeEventStatus(
      {
        publicationStatus: ev.publicationStatus,
        startsAt: ev.startsAt,
        endsAt: ev.endsAt,
      },
      now,
    );

    const totalVotes = ev.contestants.reduce((sum, c) => sum + (c.voteCount ?? 0), 0);

    return {
      id: ev.id,
      slug: ev.slug,
      title: ev.title,
      description: ev.description,
      bannerUrl: ev.bannerUrl,
      startsAt: ev.startsAt.toISOString(),
      endsAt: ev.endsAt.toISOString(),
      publicationStatus: ev.publicationStatus,
      isLive,
      isEnded,
      contestantsCount: ev._count.contestants,
      votesCount: totalVotes,
      createdAt: ev.createdAt.toISOString(),
    };
  });

  const metrics: DashboardMetricsDto = computeDashboardMetrics(events);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-8">
              <div className="h-36 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
                <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
                <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
                <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
              </div>
              <div className="h-72 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            </div>
          }
        >
          <EventsDashboardClient events={events} metrics={metrics} user={session} />
        </Suspense>
      </main>
    </div>
  );
}
