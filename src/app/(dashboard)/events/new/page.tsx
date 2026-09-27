import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth/get-session";
import { CreateEventForm } from "@/features/events/components/CreateEventForm";

export const metadata = {
  title: "Create New Event | VoteSphere Organizer",
  description: "Set up a new voting competition on VoteSphere.",
};

export default async function NewEventPage(): Promise<React.JSX.Element> {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect("/login?redirect=%2Fevents%2Fnew");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-200"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
            <Sparkles className="size-3.5" />
            <span>Event Setup Wizard</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create New Event
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Set up the basic profile, URL slug, and operational schedule for your competition. You
            can add contestant divisions, awards, and custom voting rules in subsequent steps.
          </p>
        </div>

        {/* Creation Form with Suspense boundary */}
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="size-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          }
        >
          <CreateEventForm />
        </Suspense>
      </div>
    </main>
  );
}
