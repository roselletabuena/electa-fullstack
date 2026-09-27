import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import {
  eventSlugParamsSchema,
  eventSettingsTabQuerySchema,
} from "@/lib/validations/event-settings";
import { OrganizerDashboardHeader } from "@/features/events/components/dashboard/OrganizerDashboardHeader";
import { SettingsTabNav } from "@/features/events/components/dashboard/SettingsTabNav";
import { GeneralSettingsSummaryCard } from "@/features/events/components/dashboard/GeneralSettingsSummaryCard";
import { ScheduleSettingsSummaryCard } from "@/features/events/components/dashboard/ScheduleSettingsSummaryCard";
import { VotingRulesSettingsSummaryCard } from "@/features/events/components/dashboard/VotingRulesSettingsSummaryCard";
import { ForbiddenAccessCard } from "@/features/events/components/dashboard/ForbiddenAccessCard";

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EventSettingsPage({
  params,
  searchParams,
}: SettingsPageProps): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const parsedParams = eventSlugParamsSchema.safeParse(resolvedParams);

  if (!parsedParams.success) {
    notFound();
  }

  const { slug } = parsedParams.data;
  const rawSearchParams = await searchParams;
  const rawTab = typeof rawSearchParams.tab === "string" ? rawSearchParams.tab : undefined;
  const { tab } = eventSettingsTabQuerySchema.parse({ tab: rawTab });

  const authResult = await requireEventOwnership(slug);

  if (!authResult.authorized) {
    if (authResult.reason === "UNAUTHENTICATED") {
      const returnUrl = encodeURIComponent(`/dashboard/events/${slug}/settings`);
      redirect(`/login?redirect=${returnUrl}`);
    }

    if (authResult.reason === "NOT_FOUND") {
      notFound();
    }

    if (authResult.reason === "UNAUTHORIZED") {
      return (
        <ForbiddenAccessCard
          eventTitle={authResult.eventTitle}
          userEmail={authResult.session.email}
        />
      );
    }
  }

  const { event, session } = authResult;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      <OrganizerDashboardHeader event={event} user={session} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Suspense
            fallback={
              <div className="h-12 w-full animate-pulse border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            }
          >
            <SettingsTabNav initialTab={tab} />
          </Suspense>

          <section aria-labelledby={`tab-${tab}`} id={`panel-${tab}`} tabIndex={0}>
            {tab === "general" && <GeneralSettingsSummaryCard event={event} />}
            {tab === "schedule" && <ScheduleSettingsSummaryCard event={event} />}
            {tab === "voting-rules" && <VotingRulesSettingsSummaryCard event={event} />}
          </section>
        </div>
      </main>
    </div>
  );
}
