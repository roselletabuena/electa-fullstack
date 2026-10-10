import React from "react";
import { Eye, Lock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/generated/client/client";

export interface VotingRulesSettingsSummaryCardProps {
  event: Event;
}

export function VotingRulesSettingsSummaryCard({
  event,
}: Readonly<VotingRulesSettingsSummaryCardProps>): React.JSX.Element {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Voting Rules & Tabulation Policy</CardTitle>
              <CardDescription>
                Ballot security parameters and post-event results disclosure rules.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              Standard Ballot Policy
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <Eye className="size-4 shrink-0 text-slate-500" />
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Results Visibility on Close
                </span>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {event.showResultsOnClose
                    ? "Publicly Visible on Close"
                    : "Hidden (Manual Reveal Only)"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Determines whether aggregate vote counts become visible immediately once voting
                  closes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <Lock className="size-4 shrink-0 text-slate-500" />
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Draft Passphrase Protection
                </span>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {event.draftPassphraseHash
                    ? "Passphrase Configured"
                    : "None (Organizer Access Only)"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Optional reviewer passphrase allowing external stakeholders to inspect draft
                  preview pages.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border-l-2 border-slate-400 bg-slate-100/50 p-4 text-xs text-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
            <ShieldAlert className="size-4 shrink-0 text-slate-500" />
            <p>
              Rule adjustments take effect immediately. Changes during an active voting window are
              logged and flagged to maintain ballot integrity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
