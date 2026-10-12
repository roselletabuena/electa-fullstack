import type { FeatureTileProps } from "../types";

export function FeatureTile({ tile, className = "" }: FeatureTileProps) {
  return (
    <div
      className={`group flex items-start gap-3.5 border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 ${className}`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-white text-base shadow-2xs dark:border-slate-800 dark:bg-slate-800/90"
        aria-hidden="true"
      >
        <span>{tile.icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {tile.title}
          </h3>
          {tile.badge && (
            <span className="border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-700 uppercase dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300">
              {tile.badge}
            </span>
          )}
        </div>
        <p className="font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {tile.description}
        </p>
      </div>
    </div>
  );
}
