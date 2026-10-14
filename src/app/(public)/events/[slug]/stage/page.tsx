import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Terminal } from "lucide-react";
import { db } from "@/lib/db";
import { EventArchetype } from "@/generated/client/enums";
import { getStageLeaderboardData } from "@/features/hackathons/services/peoples-choice-service";
import { StageLeaderboard } from "@/features/hackathons/components/stage-leaderboard";

interface PageProps {
  readonly params: Promise<{
    readonly slug: string;
  }>;
}

export async function generateMetadata(props: Readonly<PageProps>): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await db.event.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!event) {
    return {
      title: "Stage Leaderboard Not Found | Electa",
      description: "The requested hackathon stage display could not be found.",
    };
  }

  return {
    title: `Stage Leaderboard: ${event.title} | Electa`,
    description: `Live auditorium projector standings and attendee People's Choice voting results for ${event.title}.`,
  };
}

export default async function HackathonStagePage(
  props: Readonly<PageProps>
): Promise<React.JSX.Element> {
  const { slug } = await props.params;

  const event = await db.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      archetype: true,
      publicationStatus: true,
    },
  });

  if (!event) {
    notFound();
    return <></>;
  }

  // Guard for Hackathon archetype
  if (event.archetype !== EventArchetype.HACKATHON) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="card-style border border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0d1424]">
          <div className="mx-auto flex size-12 items-center justify-center border border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            <Terminal className="size-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-black text-slate-900 dark:text-white">
            Stage Leaderboard Unavailable
          </h1>
          <p className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-300">
            The Demo Day Stage Leaderboard is exclusively enabled for Hackathon archetype events.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/events/${event.slug}`}
              className="btn-primary inline-flex items-center gap-2 border border-slate-900 bg-slate-900 px-5 py-2.5 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <ArrowLeft className="size-4" />
              <span>Return to Event Overview</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initialData = await getStageLeaderboardData(event.slug);

  if (!initialData) {
    notFound();
    return <></>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-12 text-center text-xs text-slate-500 dark:bg-[#080d19] dark:text-slate-400">
          <div className="flex flex-col items-center">
            <div className="size-8 animate-spin text-sky-600">
              <Sparkles className="size-8" />
            </div>
            <p className="mt-4 font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Loading stage presentation...
            </p>
          </div>
        </div>
      }
    >
      <StageLeaderboard initialData={initialData} />
    </Suspense>
  );
}
