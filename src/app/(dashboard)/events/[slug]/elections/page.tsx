import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/get-session";
import { getElectionDashboardData } from "@/features/dashboard/actions/get-election-dashboard-data";
import { ElectionDashboardClient } from "@/features/dashboard/components/election-dashboard-client";

interface PageProps {
  readonly params: Promise<{
    readonly slug: string;
  }>;
}

export async function generateMetadata(props: Readonly<PageProps>): Promise<Metadata> {
  const { slug } = await props.params;

  return {
    title: `Election Audit & Turnout Dashboard | Electa`,
    description: `Official real-time turnout gauge, ballot quorum monitoring, and certified election audit dashboard for event ${slug}.`,
  };
}

export default async function ElectionDashboardPage(
  props: Readonly<PageProps>,
): Promise<React.JSX.Element> {
  const { slug } = await props.params;

  const session = await getSession();
  if (!session?.userId) {
    redirect(`/login?redirect=%2Fevents%2F${encodeURIComponent(slug)}%2Felections`);
    return <></>;
  }

  const result = await getElectionDashboardData(slug);

  if (!result.success || !result.data) {
    if (result.error?.code === "NOT_FOUND") {
      notFound();
    }

    if (result.error?.code === "FORBIDDEN") {
      return (
        <div className="w-full flex-1 bg-slate-50 py-16 dark:bg-slate-950">
          <main className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="border border-red-300 bg-white p-6 dark:border-red-800 dark:bg-[#0d1424] rounded-none space-y-3">
              <h1 className="text-xl font-bold text-red-900 dark:text-red-200">
                Access Denied: Organizer Authorization Required
              </h1>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Only the designated election organizer or commissioner who created this event is authorized
                to inspect the live turnout dashboard and certified audit records.
              </p>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="w-full flex-1 bg-slate-50 py-16 dark:bg-slate-950">
        <main className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="border border-amber-300 bg-white p-6 dark:border-amber-800 dark:bg-[#0d1424] rounded-none space-y-3">
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-200">
              Unable to Load Election Dashboard
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {result.error?.message ?? "An unexpected server error occurred."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { event, turnout, offices } = result.data;

  return (
    <div className="w-full flex-1 bg-slate-50 pb-16 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-8">
              <div className="h-28 border border-slate-300 bg-white dark:border-slate-800 dark:bg-[#0d1424] rounded-none" />
              <div className="h-64 border border-slate-300 bg-white dark:border-slate-800 dark:bg-[#0d1424] rounded-none" />
              <div className="h-96 border border-slate-300 bg-white dark:border-slate-800 dark:bg-[#0d1424] rounded-none" />
            </div>
          }
        >
          <ElectionDashboardClient
            event={event}
            turnout={turnout}
            offices={offices}
            user={{
              userId: session.userId,
              email: session.email || undefined,
            }}
          />
        </Suspense>
      </main>
    </div>
  );
}
