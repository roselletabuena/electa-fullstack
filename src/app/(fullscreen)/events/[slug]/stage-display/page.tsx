import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import {
  calculateLeaderboardRanks,
  type RawContestantVote,
} from "@/features/leaderboard/utils/rank-calculator";
import { isMysteryFreezeActive } from "@/features/leaderboard/utils/freeze-guard";
import { StageDisplayView } from "@/features/stage-display";
import type { StageDisplayPayload, StageCandidate } from "@/features/stage-display/types";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ divisionId?: string; categoryId?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await db.event.findUnique({ where: { slug } });
  const title = event?.title ?? getMockEventBySlug(slug)?.title ?? "Stage Display";

  return {
    title: `Stage Display | ${title} | Electa`,
    description: `Fullscreen LED stage presentation view for ${title}. Optimized for 4K coronation night displays.`,
  };
}

export default async function StageDisplayPage(
  props: Readonly<PageProps>,
): Promise<React.JSX.Element> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const divisionId = searchParams.divisionId ?? undefined;
  const categoryId = searchParams.categoryId ?? undefined;

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
  let divisions: Array<{ id: string; name: string }> = [];
  let categories: Array<{ id: string; name: string }> = [];

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

  const rankedEntries = calculateLeaderboardRanks(rawEntries);
  const totalVotes = rankedEntries.reduce((sum, item) => sum + (item.voteCount ?? 0), 0);

  const candidates: StageCandidate[] = rankedEntries.map((entry) => ({
    id: entry.id,
    contestantNumber: entry.contestantNumber,
    name: entry.name,
    avatarUrl: entry.avatarUrl ?? null,
    voteCount: isFrozen ? null : (entry.voteCount ?? null),
    rank: isFrozen ? null : (entry.rank ?? null),
    divisionId: entry.divisionId ?? null,
    divisionName: entry.divisionName ?? null,
  }));

  const stagePayload: StageDisplayPayload = {
    eventId,
    eventTitle,
    eventSlug: slug,
    isFrozen,
    totalVotes,
    selectedDivisionId: divisionId ?? null,
    selectedCategoryId: categoryId ?? null,
    candidates,
    divisions,
    categories,
    lastUpdated: new Date().toISOString(),
  };

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#040711]">
          <span className="animate-pulse font-mono text-sm tracking-widest text-amber-400 uppercase">
            Initializing Stage Display…
          </span>
        </div>
      }
    >
      <StageDisplayView initialData={stagePayload} />
    </Suspense>
  );
}
