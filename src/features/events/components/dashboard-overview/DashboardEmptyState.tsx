import React from "react";
import Link from "next/link";
import { Plus, Trophy, CheckCircle2 } from "lucide-react";

export function DashboardEmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-slate-400 bg-white p-8 text-center sm:p-12 dark:border-slate-700 dark:bg-[#0d1424]">
      <Trophy className="size-10 text-sky-700 dark:text-sky-400" aria-hidden="true" />

      <h2 className="font-heading mt-4 text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        No Events Created Yet
      </h2>

      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        Get started by creating your first voting competition. Configure contestants, divisions,
        awards, and custom voting quotas in minutes.
      </p>

      <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-left text-xs text-slate-700 dark:text-slate-300">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Full Candidate Profiles &amp; Media</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Real-time Secure Voting</span>
        </li>
      </ul>

      <Link
        href="/events/new"
        className="mt-8 inline-flex items-center gap-2 rounded-none border border-slate-900 bg-slate-900 px-6 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition-colors hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <Plus className="size-4" />
        <span>Create Your First Event</span>
      </Link>
    </div>
  );
}
