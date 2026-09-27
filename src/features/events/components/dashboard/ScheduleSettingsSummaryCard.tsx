import React from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EventStateBadge } from "../EventStateBadge";
import { deriveEventState } from "../../utils/derive-event-state";
import type { Event } from "@/generated/client/client";

export interface ScheduleSettingsSummaryCardProps {
  event: Event;
}

export function ScheduleSettingsSummaryCard({
  event,
}: ScheduleSettingsSummaryCardProps): React.JSX.Element {
  const operationalState = deriveEventState({
    publicationStatus: event.publicationStatus,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  });

  const startsAtDate = new Date(event.startsAt);
  const endsAtDate = new Date(event.endsAt);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Operational Schedule & Voting Window</CardTitle>
              <CardDescription>
                Time boundaries determining active voting availability and cutoff enforcement.
              </CardDescription>
            </div>
            <EventStateBadge state={operationalState} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                <Clock className="size-3.5 text-slate-400" />
                <span>Voting Starts At</span>
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                {startsAtDate.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                ISO: {startsAtDate.toISOString()}
              </p>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                <Clock className="size-3.5 text-slate-400" />
                <span>Voting Ends At (Cutoff)</span>
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                {endsAtDate.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                ISO: {endsAtDate.toISOString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-l-2 border-amber-500 bg-amber-50/40 p-4 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              Voting is strictly locked outside the operational window. Modifying schedule
              boundaries generates immutable administrative audit logs to preserve election
              integrity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
