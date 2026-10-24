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
}: Readonly<EventCountdownProps>): React.JSX.Element | null {
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
        "event-countdown-container relative overflow-hidden rounded-none border border-slate-300 bg-white p-4 shadow-xs backdrop-blur-xl sm:p-6 dark:border-slate-800 dark:bg-[#0d1424]",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="countdown-eyebrow text-primary inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
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
          <h3 className="heading-font countdown-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl dark:text-slate-100">
            {isScheduled ? "Voting Opens In" : "Voting Closes In"}
          </h3>
          <p className="countdown-description text-muted-foreground text-xs">
            {isScheduled
              ? "Contestant profiles are ready for preview. Cast votes once the timer expires."
              : "Votes are locked immediately upon reaching the zero deadline."}
          </p>
        </div>

        {/* Digit Display Grid */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 md:gap-4">
          <CountdownUnit value={days} label="Days" />
          <span className="countdown-separator text-muted-foreground/40 -mt-3 text-lg font-bold sm:-mt-4 sm:text-xl md:text-2xl">
            :
          </span>
          <CountdownUnit value={hours} label="Hours" />
          <span className="countdown-separator text-muted-foreground/40 -mt-3 text-lg font-bold sm:-mt-4 sm:text-xl md:text-2xl">
            :
          </span>
          <CountdownUnit value={minutes} label="Mins" />
          <span className="countdown-separator text-muted-foreground/40 -mt-3 text-lg font-bold sm:-mt-4 sm:text-xl md:text-2xl">
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

function CountdownUnit({ value, label, isLive }: Readonly<CountdownUnitProps>): React.JSX.Element {
  const padded = String(value).padStart(2, "0");

  return (
    <div className="countdown-unit flex flex-col items-center">
      <div
        className={cn(
          "countdown-unit-card relative flex h-13 w-13 items-center justify-center rounded-none border border-slate-300 bg-slate-50 font-mono text-xl font-extrabold shadow-inner sm:h-16 sm:w-16 sm:text-2xl md:h-20 md:w-20 md:text-3xl dark:border-slate-800 dark:bg-slate-900",
          isLive && "border-sky-500/50 text-sky-600 dark:text-sky-400",
        )}
      >
        <span className="countdown-unit-value">{padded}</span>
        <div className="bg-border/40 pointer-events-none absolute inset-x-0 top-1/2 h-px" />
      </div>
      <span className="countdown-unit-label text-muted-foreground mt-1 text-[9px] font-medium tracking-wider uppercase sm:mt-1.5 sm:text-[10px] md:text-xs">
        {label}
      </span>
    </div>
  );
}
