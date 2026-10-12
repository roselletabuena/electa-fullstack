import type { HighlightsRibbonProps } from "../types";

export function HighlightsRibbon({ metrics, className = "" }: HighlightsRibbonProps) {
  return (
    <div
      className={`grid grid-cols-2 divide-x divide-y divide-slate-200 border-y border-slate-200 bg-slate-50/50 sm:grid-cols-4 sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/30 ${className}`}
      aria-label="Platform Highlights"
    >
      {metrics.map((metric) => (
        <div key={metric.id} className="flex flex-col items-center justify-center p-3 text-center">
          <span className="font-mono text-xs font-black tracking-wider text-slate-900 uppercase dark:text-slate-100">
            {metric.label}
          </span>
          {metric.detail && (
            <span className="mt-0.5 font-sans text-[11px] text-slate-500 dark:text-slate-400">
              {metric.detail}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
