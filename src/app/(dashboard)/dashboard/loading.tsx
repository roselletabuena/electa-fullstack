import React from "react";

export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Banner Skeleton */}
        <div className="h-36 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />

        {/* 4 Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" />
        </div>

        {/* Search & Filter Header Skeleton */}
        <div className="flex h-10 items-center justify-between">
          <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Event Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-72 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-72 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-72 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      </main>
    </div>
  );
}
