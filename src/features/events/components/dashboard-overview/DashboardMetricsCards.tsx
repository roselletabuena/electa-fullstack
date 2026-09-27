import React from "react";
import { Calendar, Radio, Users, Award } from "lucide-react";
import type { DashboardMetricsDto } from "../../types/dashboard-overview";

export interface DashboardMetricsCardsProps {
  metrics: DashboardMetricsDto;
}

export function DashboardMetricsCards({ metrics }: DashboardMetricsCardsProps): React.JSX.Element {
  const cards = [
    {
      label: "Total Events",
      value: metrics.totalEvents,
      icon: Calendar,
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      textColor: "text-slate-900 dark:text-slate-100",
    },
    {
      label: "Live / Active",
      value: metrics.liveEvents,
      icon: Radio,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      textColor: "text-emerald-600 dark:text-emerald-400",
      isLiveBadge: true,
    },
    {
      label: "Total Candidates",
      value: metrics.totalCandidates,
      icon: Users,
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-slate-900 dark:text-slate-100",
    },
    {
      label: "Total Votes Cast",
      value: metrics.totalVotesCast,
      icon: Award,
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-slate-900 dark:text-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${card.bgColor} ${card.iconColor}`}
            >
              <Icon className="size-6 shrink-0" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  {card.label}
                </p>
                {card.isLiveBadge && metrics.liveEvents > 0 && (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>

              <p className={`mt-0.5 text-2xl font-black ${card.textColor}`}>
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
