"use client";

import React from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Settings, Calendar, Vote } from "lucide-react";
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
      className={cn("flex flex-wrap border-b border-slate-200 dark:border-slate-800", className)}
    >
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
              "group relative flex items-center gap-2 px-5 py-3.5 text-xs font-semibold tracking-wide transition-all",
              isActive
                ? "border-b-2 border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                : "border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-colors",
                isActive
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
