"use client";

import React, { useTransition } from "react";
import { Flame, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCountdown } from "../hooks/use-countdown";
import type { EventOperationalState } from "../types";

export interface EventCountdownProps {
  operationalState: EventOperationalState;
  startsAt: string;
  endsAt: string;
  serverTime?: string;
  onStateTransition?: () => void;
  className?: string;
}

export function EventCountdown({
  operationalState,
  startsAt,
  endsAt,
  serverTime,
  onStateTransition,
  className,
}: EventCountdownProps): React.JSX.Element | null {
  const [, startTransition] = useTransition();

  const isScheduled = operationalState === "Scheduled";
  const isActive = operationalState === "Active";

  const targetDate = isScheduled ? startsAt : endsAt;

  const handleZero = React.useCallback(() => {
    if (onStateTransition) {
      startTransition(() => {
        onStateTransition();
      });
    }
  }, [onStateTransition]);

  const { days, hours, minutes, seconds } = useCountdown({
    targetDate,
    serverTime,
    onZero: handleZero,
  });

  if (operationalState === "Draft" || operationalState === "Closed") {
    return null;
  }

  return (
    <section
      aria-label="Contest Operational Window Countdown"
      className={cn(
        "border-primary/20 from-card/90 via-card/50 to-primary/5 relative overflow-hidden rounded-2xl border bg-linear-to-br p-4 shadow-xl backdrop-blur-xl sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            {isScheduled ? (
              <>
                <Sparkles className="size-3.5" />
                Scheduled Countdown
              </>
            ) : (
              <>
                <Flame className="size-3.5 animate-bounce text-amber-500" />
                Live Voting Window
              </>
            )}
          </div>
          <h3 className="text-foreground text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
            {isScheduled ? "Voting Opens In" : "Voting Closes In"}
          </h3>
          <p className="text-muted-foreground text-xs">
            {isScheduled
              ? "Contestant profiles are ready for preview. Cast votes once the timer expires."
              : "Votes are locked immediately upon reaching the zero deadline."}
          </p>
        </div>

        {/* Digit Display Grid */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 md:gap-4">
          <CountdownUnit value={days} label="Days" />
          <span className="text-muted-foreground/40 -mt-3 text-lg font-bold sm:-mt-4 sm:text-xl md:text-2xl">
            :
          </span>
          <CountdownUnit value={hours} label="Hours" />
          <span className="text-muted-foreground/40 -mt-3 text-lg font-bold sm:-mt-4 sm:text-xl md:text-2xl">
            :
          </span>
          <CountdownUnit value={minutes} label="Mins" />
          <span className="text-muted-foreground/40 -mt-3 text-lg font-bold sm:-mt-4 sm:text-xl md:text-2xl">
            :
          </span>
          <CountdownUnit value={seconds} label="Secs" isLive={isActive} />
        </div>
      </div>
    </section>
  );
}

interface CountdownUnitProps {
  value: number;
  label: string;
  isLive?: boolean;
}

function CountdownUnit({ value, label, isLive }: CountdownUnitProps): React.JSX.Element {
  const padded = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "border-border/80 bg-background/80 relative flex h-13 w-13 items-center justify-center rounded-xl border font-mono text-xl font-extrabold shadow-inner backdrop-blur-md sm:h-16 sm:w-16 sm:text-2xl md:h-20 md:w-20 md:text-3xl",
          isLive && "border-primary/40 text-primary shadow-primary/10",
        )}
      >
        <span>{padded}</span>
        <div className="bg-border/40 pointer-events-none absolute inset-x-0 top-1/2 h-px" />
      </div>
      <span className="text-muted-foreground mt-1 text-[9px] font-medium tracking-wider uppercase sm:mt-1.5 sm:text-[10px] md:text-xs">
        {label}
      </span>
    </div>
  );
}
