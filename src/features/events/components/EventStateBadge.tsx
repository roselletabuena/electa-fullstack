import { CalendarClock, CheckCircle2, Lock, Radio } from "lucide-react";
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
            "gap-1.5 border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-500 uppercase hover:bg-amber-500/15",
            className,
          )}
        >
          <CalendarClock className="size-3.5 animate-pulse" />
          Scheduled — Opens Soon
        </Badge>
      );
    case "Active":
      return (
        <Badge
          variant="default"
          className={cn(
            "gap-1.5 border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium tracking-wide text-emerald-500 uppercase shadow-sm shadow-emerald-500/10 hover:bg-emerald-500/20",
            className,
          )}
        >
          <Radio className="size-3.5 animate-pulse text-emerald-500" />
          Voting Live & Active
        </Badge>
      );
    case "Closed":
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-muted-foreground border-border gap-1.5 bg-slate-500/10 px-3 py-1 text-xs font-medium tracking-wide uppercase",
            className,
          )}
        >
          <Lock className="size-3.5" />
          Voting Concluded
        </Badge>
      );
    case "Draft":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium tracking-wide text-violet-400 uppercase",
            className,
          )}
        >
          <CheckCircle2 className="size-3.5" />
          Draft Preview
        </Badge>
      );
  }
}
