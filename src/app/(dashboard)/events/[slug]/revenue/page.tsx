import React from "react";
import { notFound, redirect } from "next/navigation";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { eventSlugParamsSchema } from "@/lib/validations/event-settings";
import { OrganizerDashboardHeader } from "@/features/events/components/dashboard/OrganizerDashboardHeader";
import { ForbiddenAccessCard } from "@/features/events/components/dashboard/ForbiddenAccessCard";
import { calculateFinancialMetrics } from "@/features/events/services/financial-metrics";
import { RevenueSummaryCards } from "@/features/events/components/revenue/RevenueSummaryCards";
import { ContestantRevenueShareTable } from "@/features/events/components/revenue/ContestantRevenueShareTable";
import { PaymentChannelBreakdownCard } from "@/features/events/components/revenue/PaymentChannelBreakdownCard";
import { PayoutLedgerTable } from "@/features/events/components/revenue/PayoutLedgerTable";

interface RevenuePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventRevenuePage({
  params,
}: RevenuePageProps): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const parsedParams = eventSlugParamsSchema.safeParse(resolvedParams);

  if (!parsedParams.success) {
    notFound();
  }

  const { slug } = parsedParams.data;
  const authResult = await requireEventOwnership(slug);

  if (!authResult.authorized) {
    if (authResult.reason === "UNAUTHENTICATED") {
      const returnUrl = encodeURIComponent(`/events/${slug}/revenue`);
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
  const financialData = await calculateFinancialMetrics(event.id);
  const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      <OrganizerDashboardHeader event={event} user={session} activeSection="revenue" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        {/* KPI Summary Cards */}
        <section aria-label="Financial Summary Cards">
          <RevenueSummaryCards summary={financialData.summary} isAdmin={isAdmin} />
        </section>

        {/* Detailed Breakdown Grid */}
        <section aria-label="Detailed Breakdown" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContestantRevenueShareTable shares={financialData.contestantShares} />
          </div>
          <div>
            <PaymentChannelBreakdownCard breakdown={financialData.channelBreakdown} />
          </div>
        </section>

        {/* Payout & Disbursement Ledger */}
        <section aria-label="Payout Ledger">
          <PayoutLedgerTable payouts={financialData.recentPayouts} />
        </section>
      </main>
    </div>
  );
}
