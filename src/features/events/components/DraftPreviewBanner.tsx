import React from "react";
import { Eye, ShieldAlert, Sparkles } from "lucide-react";

export interface DraftPreviewBannerProps {
  accessMode?: "organizer" | "guest";
}

export function DraftPreviewBanner({
  accessMode = "guest",
}: Readonly<DraftPreviewBannerProps>): React.JSX.Element {
  return (
    <output
      aria-label="Draft Preview Notification"
      className="relative block overflow-hidden rounded-none border border-amber-300 bg-amber-50/90 p-4 shadow-xs backdrop-blur-md dark:border-amber-700/60 dark:bg-amber-950/30"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-400">
            <Eye className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="heading-font text-sm font-extrabold tracking-wider text-amber-950 uppercase sm:text-base dark:text-amber-300">
                Draft Preview Mode
              </span>
              <span className="inline-flex items-center gap-1 rounded-none border border-amber-300 bg-amber-100/90 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-900 uppercase dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                {accessMode === "organizer" ? "Organizer Session" : "Guest Passphrase"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-700 sm:text-sm dark:text-slate-300">
              This event is currently unlisted. Public visitors will receive a 404 until published.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end rounded-none border border-amber-300 bg-amber-100 px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-amber-900 uppercase shadow-xs sm:self-center dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Voting & Payments Disabled</span>
        </div>
      </div>
    </output>
  );
}
