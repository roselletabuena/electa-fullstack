import type { HighlightsRibbonProps } from "../types";

export function HighlightsRibbon({ metrics, className = "" }: HighlightsRibbonProps) {
  return (
    <div
      className={`grid grid-cols-2 border-t border-slate-100 bg-slate-50/50 sm:grid-cols-4 dark:border-slate-800/80 dark:bg-white/[0.02] ${className}`}
      aria-label="Platform Highlights"
    >
      {metrics.map((metric) => {
        const parts = metric.label.trim().split(" ");
        let value = "";
        let textLabel = metric.label;

        if (parts[0] === "<" && parts.length > 2) {
          value = `${parts[0]} ${parts[1]}`;
          textLabel = parts.slice(2).join(" ");
        } else if (
          parts.length >= 2 &&
          (parts[0] === "1-TAP" || parts[0] === "LIVE" || parts[0] === "FREE")
        ) {
          value = parts[0];
          textLabel = parts.slice(1).join(" ");
        }

        return (
          <div
            key={metric.id}
            className="flex flex-col items-center justify-center p-3 text-center"
          >
            {value ? (
              <>
                <span className="font-mono text-base font-black tracking-tight text-sky-600 dark:text-sky-400">
                  {value}
                </span>
                <span className="font-heading mt-0.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                  {textLabel}
                </span>
                <span className="sr-only">{metric.label}</span>
              </>
            ) : (
              <span className="font-mono text-xs font-black tracking-wider text-slate-900 uppercase dark:text-slate-100">
                {metric.label}
              </span>
            )}
            {metric.detail && (
              <span className="mt-0.5 font-sans text-[11px] text-slate-500 dark:text-slate-400">
                {metric.detail}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
