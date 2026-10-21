import { CalendarClock, CheckCircle2, Lock } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventOperationalState } from "../types";

export interface EventStateBadgeProps {
  state: EventOperationalState;
  className?: string;
}

export function EventStateBadge({
  state,
  className,
}: Readonly<EventStateBadgeProps>): React.JSX.Element {
  switch (state) {
    case "Scheduled":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-800 uppercase dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300",
            className,
          )}
        >
          <CalendarClock className="size-3 animate-pulse text-amber-600 dark:text-amber-400" />
          Scheduled — Opens Soon
        </Badge>
      );
    case "Active":
      return (
        <Badge
          variant="default"
          className={cn(
            "gap-1.5 border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase shadow-xs dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300",
            className,
          )}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 bg-emerald-600 dark:bg-emerald-400" />
          </span>
          Voting Live & Active
        </Badge>
      );
    case "Closed":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
            className,
          )}
        >
          <Lock className="size-3 text-slate-500 dark:text-slate-400" />
          Voting Concluded
        </Badge>
      );
    case "Draft":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase dark:border-violet-700/60 dark:bg-violet-950/40 dark:text-violet-300",
            className,
          )}
        >
          <CheckCircle2 className="size-3 text-violet-600 dark:text-violet-400" />
          Draft Preview
        </Badge>
      );
  }
}
