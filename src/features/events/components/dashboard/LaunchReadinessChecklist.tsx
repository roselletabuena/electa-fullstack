"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Check,
  ArrowRight,
  ListChecks,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LaunchReadinessSnapshot } from "../../types/launch-readiness";

export interface LaunchReadinessChecklistProps {
  snapshot: LaunchReadinessSnapshot;
  className?: string;
}

export function LaunchReadinessChecklist({
  snapshot,
  className,
}: Readonly<LaunchReadinessChecklistProps>): React.JSX.Element | null {
  const [isCopied, setIsCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const storageKey = `electa_dismissed_readiness_${snapshot.eventId}`;

  // Read localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(storageKey) === "true";
      if (dismissed) {
        setIsDismissed(true);
      }
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, "true");
      } catch {
        // Safe fallback in restricted environments
      }
    }
  };

  const handleCopyDraftLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://electa.app";
    const previewUrl = `${origin}/events/${snapshot.slug}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(previewUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = previewUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setIsCopied(true);
      toast.success("Draft preview link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy preview link to clipboard.");
    }
  };

  // If already dismissed permanently, render nothing
  if (isDismissed) {
    return null;
  }

  // Published State: Render compact "Ready & Live" indicator
  if (snapshot.publicationStatus === "PUBLISHED") {
    return (
      <div
        role="region"
        aria-label="Launch Readiness Status"
        className={cn(
          "mb-6 flex flex-col gap-3 rounded-none border border-emerald-300 bg-emerald-50/80 p-4 text-emerald-950 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800/80 dark:bg-emerald-950/30 dark:text-emerald-200",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center border border-emerald-400 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/60">
            <Sparkles className="size-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-bold tracking-tight text-emerald-950 dark:text-emerald-100">
              Competition is Ready & Live!
            </h2>
            <p className="font-sans text-xs text-emerald-800 dark:text-emerald-300">
              All initial setup milestones are fulfilled. Public voting and contestant profiles are
              active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="cursor-pointer gap-1.5 rounded-none border-emerald-400 bg-white/80 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/80"
          >
            <X className="size-3.5" />
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  // Draft State: Embedded 4-Step Checklist Card
  return (
    <section
      role="region"
      aria-label="Launch Readiness Checklist"
      className={cn(
        "mb-6 rounded-none border border-slate-300 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0d1424]",
        className,
      )}
    >
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <ListChecks className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-heading text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                Launch Readiness Checklist
              </h2>
              <Badge
                variant="outline"
                className="rounded-none border-slate-300 bg-slate-100 font-mono text-[10px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {snapshot.completedMilestones} of {snapshot.totalMilestones} Completed
              </Badge>
            </div>
            <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-400">
              Complete these essential setup tasks before opening your competition to public
              voting.
            </p>
          </div>
        </div>

        {/* Copy Draft Preview Link Action */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyDraftLink}
            aria-label="Copy Draft Preview Link"
            className={cn(
              "cursor-pointer gap-2 rounded-none border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
              isCopied &&
                "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
            )}
          >
            {isCopied ? (
              <>
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <LinkIcon className="size-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copy Draft Preview Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 space-y-1.5">
        <div className="flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
          <span>Overall Readiness</span>
          <span className="font-bold text-slate-900 dark:text-slate-200">
            {snapshot.percentageComplete}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={snapshot.percentageComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Readiness Progress"
          className="h-2 w-full overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className="h-full bg-linear-to-r from-sky-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${snapshot.percentageComplete}%` }}
          />
        </div>
      </div>

      {/* 4 Milestones Cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex flex-col justify-between border p-3.5 transition-all",
              item.isCompleted
                ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700",
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {item.title}
                </span>
                {item.isCompleted ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="size-4 shrink-0 text-slate-400 dark:text-slate-600" />
                )}
              </div>
              <p className="mt-1 font-sans text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>

            <div className="mt-3.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
              {item.isCompleted ? (
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span>✓ Completed</span>
                  <Link
                    href={item.actionHref}
                    className="text-[10px] font-semibold text-slate-500 underline transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    View
                  </Link>
                </div>
              ) : (
                <Link
                  href={item.actionHref}
                  className="inline-flex w-full items-center justify-between border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-800 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="size-3 text-slate-500 dark:text-slate-400" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
