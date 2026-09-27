"use client";

import React from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Settings, Calendar, Vote, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_TABS, type SettingsTabId } from "../../types";

export interface SettingsTabNavProps {
  className?: string;
  initialTab?: SettingsTabId;
}

const TABS: Array<{
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: "general",
    label: "General Settings",
    icon: Settings,
    description: "Title, slug, banner & visibility",
  },
  {
    id: "schedule",
    label: "Schedule & Timeline",
    icon: Calendar,
    description: "Voting window & lifecycle dates",
  },
  {
    id: "voting-rules",
    label: "Voting Rules",
    icon: Vote,
    description: "Vote limits & results policy",
  },
  {
    id: "categories",
    label: "Categories & Awards",
    icon: Layers,
    description: "Divisions & award tracks",
  },
];

export function SettingsTabNav({
  className,
  initialTab = "general",
}: SettingsTabNavProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(SETTINGS_TABS)
      .withDefault(initialTab)
      .withOptions({ shallow: true, history: "push" }),
  );

  return (
    <nav
      aria-label="Settings Tabs"
      className={cn(
        "flex w-full scrollbar-none overflow-x-auto border-b border-slate-200 dark:border-slate-800",
        className,
      )}
    >
      <div className="flex min-w-full sm:min-w-0 sm:flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

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
                "group relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wide transition-all sm:px-5 sm:py-3.5",
                isActive
                  ? "border-b-2 border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                  : "border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                )}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
