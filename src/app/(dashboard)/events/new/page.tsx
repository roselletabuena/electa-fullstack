import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth/get-session";
import { CreateEventForm } from "@/features/events";

export const metadata = {
  title: "Create New Event | Electa",
  description: "Set up a new pageant competition on Electa.",
};

export default async function NewEventPage(): Promise<React.JSX.Element> {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect("/login?returnTo=%2Fevents%2Fnew");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-slate-600 uppercase transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800/80">
          <div className="inline-flex items-center gap-2 rounded-none border border-sky-500/30 bg-sky-50 px-3 py-1 text-xs font-extrabold tracking-wider text-sky-700 uppercase dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
            <Sparkles className="size-3.5" />
            <span>Event Setup Wizard</span>
          </div>
          <h1 className="font-heading mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Create New Event
          </h1>
          <p className="font-body mt-2 text-sm text-slate-600 dark:text-slate-400">
            Set up the profile, custom URL slug, and timeline schedule for your competition. You can
            add divisions, awards, and custom voting rules in subsequent steps.
          </p>
        </div>

        {/* Creation Form with Suspense boundary */}
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center rounded-none border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
              <div className="size-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
          }
        >
          <CreateEventForm />
        </Suspense>
      </div>
    </main>
  );
}
