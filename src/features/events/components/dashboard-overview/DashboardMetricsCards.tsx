import React from "react";
import { Calendar, Radio, Users, Award } from "lucide-react";
import type { DashboardMetricsDto } from "../../types/dashboard-overview";

export interface DashboardMetricsCardsProps {
  metrics: DashboardMetricsDto;
}

export function DashboardMetricsCards({
  metrics,
}: Readonly<DashboardMetricsCardsProps>): React.JSX.Element {
  const stats = [
    { label: "Total Events", value: metrics.totalEvents, icon: Calendar },
    { label: "Live / Active", value: metrics.liveEvents, icon: Radio, isLive: true },
    { label: "Total Candidates", value: metrics.totalCandidates, icon: Users },
    { label: "Total Votes Cast", value: metrics.totalVotesCast, icon: Award },
  ];

  return (
    <dl className="grid grid-cols-2 divide-slate-300 border border-slate-300 bg-white lg:grid-cols-4 lg:divide-x dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0d1424]">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const showPulse = stat.isLive === true && metrics.liveEvents > 0;
        return (
          <div
            key={stat.label}
            className="border-b border-slate-300 p-5 last:border-b-0 max-lg:odd:border-r lg:border-b-0 dark:border-slate-800"
          >
            <dt className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-600 uppercase dark:text-slate-400">
              <Icon className="size-4 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              {stat.label}
              {showPulse && (
                <span className="relative ml-auto flex size-2">
                  <span className="absolute inline-flex size-full animate-ping bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2 bg-emerald-600" />
                </span>
              )}
            </dt>
            <dd className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums dark:text-slate-100">
              {stat.value.toLocaleString()}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
