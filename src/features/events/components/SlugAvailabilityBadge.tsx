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
        "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300",
      iconClass: "animate-spin text-sky-600 dark:text-sky-400",
    },
    available: {
      icon: CheckCircle2,
      label: "Slug available",
      badgeClass:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
      iconClass: "text-emerald-600 dark:text-emerald-400",
    },
    unavailable: {
      icon: XCircle,
      label: "Slug already in use",
      badgeClass:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300",
      iconClass: "text-rose-600 dark:text-rose-400",
    },
    reserved: {
      icon: AlertTriangle,
      label: "Reserved system keyword",
      badgeClass:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300",
      iconClass: "text-amber-600 dark:text-amber-400",
    },
    invalid: {
      icon: AlertCircle,
      label: "Invalid slug format",
      badgeClass:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300",
      iconClass: "text-rose-600 dark:text-rose-400",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.badgeClass,
        className,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", config.iconClass)} />
      <span>{displayText}</span>
    </div>
  );
}
