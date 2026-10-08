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
      className="relative block overflow-hidden rounded-xl border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 p-4 backdrop-blur-md"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
            <Eye className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-amber-400 uppercase sm:text-base">
                Draft Preview Mode
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                <Sparkles className="h-3 w-3" />
                {accessMode === "organizer" ? "Organizer Session" : "Guest Passphrase"}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              This event is currently unlisted. Public visitors will receive a 404 until published.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end rounded-lg border border-amber-500/20 bg-amber-950/40 px-3 py-1.5 text-xs text-amber-400/80 sm:self-center">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Voting & Payments Disabled</span>
        </div>
      </div>
    </output>
  );
}
