import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Terminal } from "lucide-react";
import { db } from "@/lib/db";
import { EventArchetype } from "@/generated/client/enums";
import { getProjectSubmissions } from "@/features/hackathons/services/submission-service";
import { ExhibitionGrid } from "@/features/hackathons/components/exhibition-grid";

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
      title: "Projects Not Found | Electa",
      description: "The requested hackathon exhibition could not be found.",
    };
  }

  return {
    title: `Project Exhibition: ${event.title} | Electa`,
    description: `Browse innovative hackathon deliverables, live demos, and source code repositories for ${event.title}.`,
  };
}

export default async function HackathonProjectsPage(
  props: Readonly<PageProps>
): Promise<React.JSX.Element> {
  const { slug } = await props.params;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      positions: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
    return <></>;
  }

  // Guard for hackathon archetype
  if (event.archetype !== EventArchetype.HACKATHON) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="card-style border border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0d1424]">
          <div className="mx-auto flex size-12 items-center justify-center border border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            <Terminal className="size-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-black text-slate-900 dark:text-white">
            Exhibition Unavailable
          </h1>
          <p className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-300">
            Project exhibitions and multi-track submissions are exclusively enabled for Hackathon archetype events.
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

  // Fetch submissions for this event
  const submissionsResult = await getProjectSubmissions(event.id);
  const submissions = submissionsResult.success ? submissionsResult.data : [];

  // Available tracks from event positions or defaults
  const trackSet = new Set<string>();
  for (const p of event.positions) {
    if (p.name) trackSet.add(p.name);
  }
  for (const s of submissions) {
    for (const t of s.trackTags) trackSet.add(t.trackName);
  }

  if (trackSet.size === 0) {
    for (const t of ["AI & Agents", "Web3", "Developer Tooling", "Public Goods"]) trackSet.add(t);
  }

  const now = new Date();
  const isSubmissionOpen =
    event.publicationStatus === "PUBLISHED" &&
    now >= event.startsAt &&
    now <= event.endsAt;

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Return to Event navigation breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to {event.title}</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="border border-slate-300 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0d1424] dark:text-slate-400">
            <div className="mx-auto flex size-8 animate-spin items-center justify-center">
              <Sparkles className="size-5 text-sky-600" />
            </div>
            <p className="mt-3 font-mono font-bold uppercase tracking-wider">
              Loading exhibition gallery...
            </p>
          </div>
        }
      >
        <ExhibitionGrid
          eventSlug={event.slug}
          eventTitle={event.title}
          initialSubmissions={submissions}
          availableTracks={Array.from(trackSet)}
          isSubmissionOpen={isSubmissionOpen}
        />
      </Suspense>
    </main>
  );
}
