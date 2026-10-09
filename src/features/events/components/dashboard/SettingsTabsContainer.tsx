"use client";

import React from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { SettingsTabNav } from "./SettingsTabNav";
import { GeneralBrandingForm } from "./GeneralBrandingForm";
import { ScheduleLifecycleForm } from "./ScheduleLifecycleForm";
import { VotingRulesForm } from "./VotingRulesForm";
import { CategoryAwardsSettingsForm } from "./CategoryAwardsSettingsForm";
import { SETTINGS_TABS, type SettingsTabId } from "../../types";
import type { Event } from "@/generated/client/client";

export interface SettingsTabsContainerProps {
  event: Event;
  initialTab?: SettingsTabId;
}

export function SettingsTabsContainer({
  event,
  initialTab = "general",
}: Readonly<SettingsTabsContainerProps>): React.JSX.Element {
  const [activeTab] = useQueryState(
    "tab",
    parseAsStringLiteral(SETTINGS_TABS)
      .withDefault(initialTab)
      .withOptions({ shallow: true, history: "push" }),
  );

  return (
    <div className="space-y-6">
      <SettingsTabNav initialTab={initialTab} />

      <section role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "general" && <GeneralBrandingForm event={event} />}
        {activeTab === "schedule" && <ScheduleLifecycleForm event={event} />}
        {activeTab === "voting-rules" && <VotingRulesForm event={event} />}
        {activeTab === "categories" && <CategoryAwardsSettingsForm event={event} />}
      </section>
    </div>
  );
}
