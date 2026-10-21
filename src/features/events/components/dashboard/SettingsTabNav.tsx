"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import {
  Sliders,
  Calendar,
  Vote,
  Layers,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_TABS, type SettingsTabId } from "../../types";
import type { LaunchReadinessSnapshot } from "../../types/launch-readiness";
import type { Event } from "@/generated/client/client";

export interface SettingsTabNavProps {
  className?: string | undefined;
  initialTab?: SettingsTabId | undefined;
  event?: Event | undefined;
  snapshot?: LaunchReadinessSnapshot | undefined;
}

interface TabItem {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultBadge: string;
}

const TABS: ReadonlyArray<TabItem> = [
  {
    id: "general",
    label: "General & Branding",
    icon: Sliders,
    defaultBadge: "Identity",
  },
  {
    id: "schedule",
    label: "Schedule & Timeline",
    icon: Calendar,
    defaultBadge: "Timeline",
  },
  {
    id: "voting-rules",
    label: "Voting Rules & Quotas",
    icon: Vote,
    defaultBadge: "Quotas",
  },
  {
    id: "categories",
    label: "Categories & Awards",
    icon: Layers,
    defaultBadge: "Divisions",
  },
];

function getTabBadge(tab: TabItem, event?: Event): string {
  if (!event) return tab.defaultBadge;

  switch (tab.id) {
    case "general":
      return "Identity";
    case "schedule": {
      if (!event.startsAt || !event.endsAt) return "Timeline";
      try {
        const start = new Date(event.startsAt);
        const end = new Date(event.endsAt);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return "Timeline";
        }
        const fmt = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
        return `${fmt.format(start)} – ${fmt.format(end)}`;
      } catch {
        return "Timeline";
      }
    }
    case "voting-rules":
      if (event.isFreeVotingEnabled && event.dailyFreeVoteLimit) {
        return `${event.dailyFreeVoteLimit} Free`;
      }
      return "Quotas";
    case "categories":
      return "Divisions";
  }
}

export function SettingsTabNav({
  className,
  initialTab = "general",
  event,
  snapshot,
}: Readonly<SettingsTabNavProps>): React.JSX.Element {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(SETTINGS_TABS)
      .withDefault(initialTab)
      .withOptions({ shallow: true, history: "push" }),
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const nextIncompleteItem = snapshot?.items.find((item) => !item.isCompleted) ?? null;

  return (
    <div
      className={cn(
        "rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0d1424]",
        className,
      )}
    >
      {/* Sidebar Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
        <span className="font-heading text-[11px] font-black tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Settings Sections
        </span>
      </div>

      {/* Vertical Navigation Tab List */}
      <nav
        role="tablist"
        aria-label="Settings Sections"
        className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeText = getTabBadge(tab, event);

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-none border-l-2 px-4 py-3 text-left transition-colors",
                isActive
                  ? "border-l-sky-600 bg-sky-50/50 text-slate-950 dark:border-l-sky-400 dark:bg-sky-950/30 dark:text-slate-50"
                  : "border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-100",
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                  )}
                />
                <span
                  className={cn(
                    "font-heading truncate text-xs tracking-tight sm:text-[13px]",
                    isActive
                      ? "font-extrabold text-slate-950 dark:text-slate-50"
                      : "font-semibold text-slate-700 group-hover:text-slate-950 dark:text-slate-300 dark:group-hover:text-slate-100",
                  )}
                >
                  {tab.label}
                </span>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded-none px-1.5 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase",
                  isActive
                    ? "bg-sky-100/70 font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                {badgeText}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Interactive Sidebar Launch Readiness Section */}
      {snapshot && (
        <section
          role="region"
          aria-label="Launch Readiness Checklist"
          className="border-t border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/40"
        >
          {/* Header & Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-heading text-[11px] font-black tracking-wider text-slate-700 uppercase dark:text-slate-300">
                Launch Readiness
              </span>
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                {snapshot.percentageComplete}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              aria-controls="readiness-milestones-list"
              aria-label={
                isExpanded ? "Collapse launch readiness tasks" : "Expand launch readiness tasks"
              }
              className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] font-bold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <span>{isExpanded ? "Hide" : "Tasks"}</span>
              {isExpanded ? (
                <ChevronUp className="size-3 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="size-3 text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>

          {/* Progress Bar & Subtitle */}
          <div className="mt-2 space-y-1.5">
            <div
              role="progressbar"
              aria-valuenow={snapshot.percentageComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Sidebar Launch Readiness"
              className="h-1 w-full overflow-hidden bg-slate-200 dark:bg-slate-800"
            >
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  snapshot.isAllCompleted
                    ? "bg-emerald-600 dark:bg-emerald-500"
                    : "bg-sky-600 dark:bg-sky-500",
                )}
                style={{ width: `${snapshot.percentageComplete}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-slate-600 dark:text-slate-400">
              <span>
                {snapshot.completedMilestones} of {snapshot.totalMilestones} Completed
              </span>
              {snapshot.isAllCompleted && (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Ready</span>
              )}
            </div>
          </div>

          {/* Quick Next Incomplete Action (When Collapsed) */}
          {!isExpanded && nextIncompleteItem && (
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs dark:border-slate-800/60">
              <span className="truncate font-sans text-[11px] text-slate-600 dark:text-slate-400">
                Next:{" "}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  {nextIncompleteItem.title}
                </strong>
              </span>
              <Link
                href={nextIncompleteItem.actionHref}
                className="font-heading ml-2 inline-flex shrink-0 items-center gap-1 text-[10px] font-extrabold tracking-wider text-sky-600 uppercase transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                <span>{nextIncompleteItem.actionLabel}</span>
                <ArrowRight className="size-2.5" />
              </Link>
            </div>
          )}

          {/* Expanded Milestone Task List */}
          {isExpanded && (
            <div
              id="readiness-milestones-list"
              className="mt-3 divide-y divide-slate-100 border-t border-slate-200/80 pt-2 dark:divide-slate-800/60 dark:border-slate-800/80"
            >
              {snapshot.items.map((item) => {
                const isCompleted = item.isCompleted;
                const isNext = !isCompleted && item.id === nextIncompleteItem?.id;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "py-2.5 text-xs transition-colors",
                      isNext && "-mx-1 bg-sky-50/40 px-1 dark:bg-sky-950/20",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle
                          className={cn(
                            "mt-0.5 size-3.5 shrink-0",
                            isNext
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-slate-400 dark:text-slate-500",
                          )}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              "font-heading text-xs font-bold tracking-tight",
                              isCompleted
                                ? "text-slate-700 line-through decoration-slate-300 dark:text-slate-400 dark:decoration-slate-700"
                                : "text-slate-900 dark:text-slate-100",
                            )}
                          >
                            {item.title}
                          </span>
                          {isCompleted && (
                            <Link
                              href={item.actionHref}
                              className="font-mono text-[10px] text-slate-500 underline underline-offset-2 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              View
                            </Link>
                          )}
                        </div>

                        <p className="mt-0.5 font-sans text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>

                        {!isCompleted && (
                          <div className="mt-1.5">
                            <Link
                              href={item.actionHref}
                              className="font-heading inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-sky-600 uppercase hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                            >
                              <span>{item.actionLabel}</span>
                              <ArrowRight className="size-2.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
