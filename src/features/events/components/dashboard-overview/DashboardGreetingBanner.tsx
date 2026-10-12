import React from "react";
import type { UserSession } from "@/lib/auth/get-session";
import type { DashboardMetricsDto } from "../../types/dashboard-overview";

export interface DashboardGreetingBannerProps {
  user: UserSession;
  metrics: DashboardMetricsDto;
}

export function DashboardGreetingBanner({
  user,
  metrics,
}: Readonly<DashboardGreetingBannerProps>): React.JSX.Element {
  const displayName = user.name || user.email.split("@")[0] || "Organizer";

  return (
    <header className="space-y-2 border-b border-slate-300 pb-6 dark:border-slate-800">
      <p className="text-xs font-bold tracking-widest text-sky-700 uppercase dark:text-sky-400">
        Organizer Command Center
      </p>

      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
        Welcome back, {displayName}
      </h1>

      <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        You have{" "}
        <strong className="font-bold text-slate-900 dark:text-slate-100">
          {metrics.liveEvents} active voting {metrics.liveEvents === 1 ? "event" : "events"}
        </strong>{" "}
        with{" "}
        <strong className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {metrics.totalVotesCast.toLocaleString()} votes
        </strong>{" "}
        recorded across your competitions.
      </p>
    </header>
  );
}
