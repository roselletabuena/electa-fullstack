import React from "react";
import Link from "next/link";
import { Plus, Sparkles, LogOut } from "lucide-react";
import type { UserSession } from "@/lib/auth/get-session";
import type { DashboardMetricsDto } from "../../types/dashboard-overview";
import { logoutAction } from "@/features/auth/actions/logout-action";

export interface DashboardGreetingBannerProps {
  user: UserSession;
  metrics: DashboardMetricsDto;
}

export function DashboardGreetingBanner({
  user,
  metrics,
}: DashboardGreetingBannerProps): React.JSX.Element {
  const displayName = user.name || user.email.split("@")[0] || "Organizer";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
      <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-[11px] font-bold tracking-wider text-indigo-300 uppercase">
            <Sparkles className="size-3 text-indigo-400" />
            <span>Organizer Command Center</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Welcome back, {displayName}! 👋
          </h1>

          <p className="max-w-xl text-xs leading-relaxed font-normal text-slate-300 sm:text-sm">
            You currently have{" "}
            <strong className="font-bold text-white">
              {metrics.liveEvents} active voting {metrics.liveEvents === 1 ? "event" : "events"}
            </strong>{" "}
            running with{" "}
            <strong className="font-bold text-indigo-200">
              {metrics.totalVotesCast.toLocaleString()} votes
            </strong>{" "}
            recorded across your competitions.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 focus:ring-2 focus:ring-indigo-400 focus:outline-hidden"
          >
            <Plus className="size-4 shrink-0" />
            <span>Create New Event</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95"
              title="Sign out of organizer account"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Decorative gradient blur background */}
      <div className="pointer-events-none absolute -top-12 -right-12 size-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 size-64 rounded-full bg-purple-500/10 blur-3xl" />
    </div>
  );
}
