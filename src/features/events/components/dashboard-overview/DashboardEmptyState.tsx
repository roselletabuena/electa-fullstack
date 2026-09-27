import React from "react";
import Link from "next/link";
import { Plus, Trophy, CheckCircle2 } from "lucide-react";

export function DashboardEmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs sm:p-12 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400">
        <Trophy className="size-8" />
      </div>

      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        No Events Created Yet
      </h2>

      <p className="mt-2 max-w-md text-xs text-slate-500 sm:text-sm dark:text-slate-400">
        Get started by creating your first voting competition. Configure contestant rosters,
        divisions, awards, and custom voting quotas in minutes.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-left text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>Full Candidate Profiles & Media</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>Real-time Secure Voting</span>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40"
        >
          <Plus className="size-4" />
          <span>Create Your First Event</span>
        </Link>
      </div>
    </div>
  );
}
