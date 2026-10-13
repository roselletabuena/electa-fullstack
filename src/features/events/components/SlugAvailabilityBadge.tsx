"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlugAvailabilityStatus } from "../types";

export interface SlugAvailabilityBadgeProps {
  status: SlugAvailabilityStatus;
  message?: string | undefined;
  className?: string | undefined;
}

export function SlugAvailabilityBadge({
  status,
  message,
  className,
}: Readonly<SlugAvailabilityBadgeProps>): React.JSX.Element | null {
  if (status === "idle") {
    return null;
  }

  const configs: Record<
    Exclude<SlugAvailabilityStatus, "idle">,
    {
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      badgeClass: string;
      iconClass: string;
    }
  > = {
    checking: {
      icon: Loader2,
      label: "Checking availability...",
      badgeClass:
        "border-sky-500/30 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
      iconClass: "animate-spin text-sky-600 dark:text-sky-400",
    },
    available: {
      icon: CheckCircle2,
      label: "Slug available",
      badgeClass:
        "border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
      iconClass: "text-emerald-700 dark:text-emerald-400",
    },
    unavailable: {
      icon: XCircle,
      label: "Slug already in use",
      badgeClass:
        "border-rose-600/30 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
      iconClass: "text-rose-700 dark:text-rose-400",
    },
    reserved: {
      icon: AlertTriangle,
      label: "Reserved system keyword",
      badgeClass:
        "border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
      iconClass: "text-amber-700 dark:text-amber-400",
    },
    invalid: {
      icon: AlertCircle,
      label: "Invalid slug format",
      badgeClass:
        "border-rose-600/30 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
      iconClass: "text-rose-700 dark:text-rose-400",
    },
  };

  const config = configs[status];
  if (!config) return null;

  const Icon = config.icon;
  const displayText = message || config.label;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-colors",
        config.badgeClass,
        className,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", config.iconClass)} />
      <span>{displayText}</span>
    </div>
  );
}
