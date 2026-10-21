"use client";

import React from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { SettingsTabNav } from "./SettingsTabNav";
import { GeneralBrandingForm } from "./GeneralBrandingForm";
import { ScheduleLifecycleForm } from "./ScheduleLifecycleForm";
import { VotingRulesForm } from "./VotingRulesForm";
import { CategoryAwardsSettingsForm } from "./CategoryAwardsSettingsForm";
import { SETTINGS_TABS, type SettingsTabId } from "../../types";
import type { LaunchReadinessSnapshot } from "../../types/launch-readiness";
import type { Event } from "@/generated/client/client";
import { cn } from "@/lib/utils";

export interface SettingsTabsContainerProps {
  event: Event;
  initialTab?: SettingsTabId | undefined;
  snapshot?: LaunchReadinessSnapshot | undefined;
  className?: string | undefined;
}

export function SettingsTabsContainer({
  event,
  initialTab = "general",
  snapshot,
  className,
}: Readonly<SettingsTabsContainerProps>): React.JSX.Element {
  const [activeTab] = useQueryState(
    "tab",
    parseAsStringLiteral(SETTINGS_TABS)
      .withDefault(initialTab)
      .withOptions({ shallow: true, history: "push" }),
  );

  return (
    <div className={cn("grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]", className)}>
      {/* Left Column: Vertical Sub-Navigation Sidebar */}
      <aside className="w-full lg:sticky lg:top-6">
        <SettingsTabNav event={event} initialTab={initialTab} snapshot={snapshot} />
      </aside>

      {/* Right Column: Active Settings Form Canvas */}
      <section
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="min-w-0 flex-1 space-y-6"
      >
        {activeTab === "general" && <GeneralBrandingForm event={event} />}
        {activeTab === "schedule" && <ScheduleLifecycleForm event={event} />}
        {activeTab === "voting-rules" && <VotingRulesForm event={event} />}
        {activeTab === "categories" && <CategoryAwardsSettingsForm event={event} />}
      </section>
    </div>
  );
}
