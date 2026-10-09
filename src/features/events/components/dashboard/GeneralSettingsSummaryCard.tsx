import React from "react";
import Image from "next/image";
import { Globe, Image as ImageIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/generated/client/client";

export interface GeneralSettingsSummaryCardProps {
  event: Event;
}

export function GeneralSettingsSummaryCard({
  event,
}: Readonly<GeneralSettingsSummaryCardProps>): React.JSX.Element {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Primary competition profile parameters and identity details.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs uppercase">
              {event.publicationStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Event Title
              </label>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {event.title}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Public Slug URL
              </label>
              <p className="flex items-center gap-1.5 font-mono text-sm text-slate-700 dark:text-slate-300">
                <Globe className="size-3.5 text-slate-400" />
                /events/{event.slug}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Description
            </label>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {event.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Banner Media
            </label>
            {event.bannerUrl ? (
              <div className="relative h-44 w-full overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-32 w-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs">
                  <ImageIcon className="size-4" />
                  <span>No banner image configured</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
