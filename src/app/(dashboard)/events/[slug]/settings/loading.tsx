import React from "react";

export default function SettingsLoading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-4 w-32 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-48 animate-pulse bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-9 w-36 animate-pulse bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-slate-200 pb-2 dark:border-slate-800">
            <div className="h-8 w-28 animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-36 animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-28 animate-pulse bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-64 w-full animate-pulse border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" />
        </div>
      </main>
    </div>
  );
}
