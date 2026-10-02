import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import {
  calculateLeaderboardRanks,
  type RawContestantVote,
} from "@/features/leaderboard/utils/rank-calculator";
import {
  isMysteryFreezeActive,
  redactLeaderboardForPublic,
} from "@/features/leaderboard/utils/freeze-guard";
import { LeaderboardView } from "@/features/leaderboard/components/LeaderboardView";
import type { LeaderboardPayload } from "@/features/leaderboard/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ divisionId?: string | undefined; categoryId?: string | undefined }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await db.event.findUnique({ where: { slug } });
  const title = event?.title ?? getMockEventBySlug(slug)?.title ?? "Live Standings";

  return {
    title: `Live Leaderboard | ${title} | Electa`,
    description: `Real-time official standings and vote tallies for ${title}.`,
  };
}

export default async function LeaderboardPage(props: PageProps): Promise<React.JSX.Element> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const divisionId = searchParams.divisionId || undefined;
  const categoryId = searchParams.categoryId || undefined;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      contestants: {
        where: {
          status: "ACTIVE",
          ...(divisionId ? { divisionId } : {}),
        },
        include: {
          divisionRef: true,
          categories: true,
          media: { orderBy: { displayOrder: "asc" } },
        },
        orderBy: { contestantNumber: "asc" },
      },
      divisions: { orderBy: { displayOrder: "asc" } },
      awardCategories: { orderBy: { displayOrder: "asc" } },
    },
  });

  let rawEntries: RawContestantVote[] = [];
  let isFrozen = false;
  let eventId = "";
  let eventTitle = "";
  let divisions: { id: string; name: string }[] = [];
  let categories: { id: string; name: string }[] = [];

  if (event) {
    eventId = event.id;
    eventTitle = event.title;
    divisions = event.divisions.map((d) => ({ id: d.id, name: d.name }));
    categories = event.awardCategories.map((c) => ({ id: c.id, name: c.name }));

    let activeContestants = event.contestants;
    if (categoryId) {
      activeContestants = activeContestants.filter((c) =>
        c.categories.some((cat) => cat.awardCategoryId === categoryId),
      );
    }

    rawEntries = activeContestants.map((c) => ({
      id: c.id,
      contestantNumber: c.contestantNumber,
      name: c.name,
      avatarUrl:
        c.media?.find((m) => m.isCover && m.mediaType === "PHOTO")?.url ||
        c.media?.find((m) => m.mediaType === "PHOTO")?.url ||
        c.avatarUrl ||
        "/placeholder-contestant.webp",
      divisionId: c.divisionId,
      divisionName: c.divisionRef?.name ?? null,
      voteCount: c.voteCount,
    }));

    isFrozen = isMysteryFreezeActive({
      endsAt: event.endsAt,
      showResultsOnClose: event.showResultsOnClose,
    });
  } else {
    const mockEvent = getMockEventBySlug(slug);
    if (!mockEvent) {
      notFound();
    }

    eventId = mockEvent.id;
    eventTitle = mockEvent.title;

    rawEntries = mockEvent.contestants.map((c) => ({
      id: c.id,
      contestantNumber: c.contestantNumber,
      name: c.name,
      avatarUrl: c.avatarUrl,
      voteCount: c.voteCount ?? 0,
    }));

    isFrozen = isMysteryFreezeActive({
      endsAt: mockEvent.endsAt,
      showResultsOnClose: mockEvent.showResultsOnClose,
    });
  }

  const entries = calculateLeaderboardRanks(rawEntries);
  const totalVotes = entries.reduce((sum, item) => sum + (item.voteCount ?? 0), 0);

  let initialPayload: LeaderboardPayload = {
    eventId,
    eventSlug: slug,
    eventTitle,
    isFrozen,
    totalVotes,
    selectedDivisionId: divisionId ?? null,
    selectedCategoryId: categoryId ?? null,
    entries,
    lastUpdated: new Date().toISOString(),
  };

  if (isFrozen) {
    initialPayload = redactLeaderboardForPublic(initialPayload);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#070c18] dark:text-slate-100">
      <Suspense
        fallback={
          <div className="p-12 text-center font-mono text-sm">Loading Live Leaderboard...</div>
        }
      >
        <LeaderboardView
          slug={slug}
          initialData={initialPayload}
          divisions={divisions}
          categories={categories}
          selectedDivisionId={divisionId}
          selectedCategoryId={categoryId}
        />
      </Suspense>
    </main>
  );
}
