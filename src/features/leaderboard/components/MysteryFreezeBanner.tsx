"use client";

import React from "react";
import { Lock, EyeOff } from "lucide-react";

export interface MysteryFreezeBannerProps {
  message?: string | null | undefined;
  isOrganizerBypass?: boolean | undefined;
}

export function MysteryFreezeBanner({
  message = "Mystery Freeze in Effect — Live rankings are concealed until the grand stage announcement.",
  isOrganizerBypass = false,
}: MysteryFreezeBannerProps): React.JSX.Element {
  const displayMessage =
    message ||
    "Mystery Freeze in Effect — Live rankings are concealed until the grand stage announcement.";

  return (
    <div
      role="alert"
      className="mb-8 border-2 border-amber-500 bg-amber-50 p-4 text-slate-900 shadow-xs dark:border-amber-500/80 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-amber-600 bg-amber-500 text-slate-950 dark:border-amber-400 dark:bg-amber-400">
          {isOrganizerBypass ? <Lock className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-sm font-extrabold tracking-wide text-amber-900 uppercase dark:text-amber-300">
              {isOrganizerBypass
                ? "Organizer Mode: Unredacted Live Telemetry"
                : "Stealth Mystery Freeze Active"}
            </h3>
            <span className="border border-amber-600 bg-amber-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-950 dark:border-amber-500 dark:bg-amber-900 dark:text-amber-200">
              STAGE LOCKED
            </span>
          </div>
          <p className="mt-1 font-sans text-xs text-slate-800 dark:text-slate-200">
            {displayMessage}
          </p>
          <p className="mt-1 font-sans text-[11px] font-medium text-slate-600 dark:text-slate-400">
            Voting remains 100% active and ballots are being securely tallied in real time.
          </p>
        </div>
      </div>
    </div>
  );
}
