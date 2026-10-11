import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { eventSlugParamsSchema } from "@/lib/validations/event-settings";
import { OrganizerDashboardHeader } from "@/features/events/components/dashboard/OrganizerDashboardHeader";
import { OrganizerContestantTable } from "@/features/contestants/components/OrganizerContestantTable";
import { ForbiddenAccessCard } from "@/features/events/components/dashboard/ForbiddenAccessCard";
import type {
  ContestantDivision,
  ContestantDto,
  AwardCategoryDto,
} from "@/features/contestants/types";

interface ContestantsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventContestantsPage({
  params,
}: Readonly<ContestantsPageProps>): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const parsedParams = eventSlugParamsSchema.safeParse(resolvedParams);

  if (!parsedParams.success) {
    notFound();
  }

  const { slug } = parsedParams.data;
  const authResult = await requireEventOwnership(slug);

  if (!authResult.authorized) {
    if (authResult.reason === "UNAUTHENTICATED") {
      const returnUrl = encodeURIComponent(`/events/${slug}/contestants`);
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

  const [contestantsRaw, categoriesRaw, divisionsRaw] = await Promise.all([
    db.contestant.findMany({
      where: { eventId: event.id },
      orderBy: { contestantNumber: "asc" },
      include: {
        divisionRef: true,
        media: { orderBy: { displayOrder: "asc" } },
        categories: { include: { awardCategory: true } },
      },
    }),
    db.awardCategory.findMany({
      where: { eventId: event.id },
      orderBy: { name: "asc" },
    }),
    db.division.findMany({
      where: { eventId: event.id },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  const contestants: ContestantDto[] = contestantsRaw.map((c) => ({
    id: c.id,
    eventId: c.eventId,
    contestantNumber: c.contestantNumber,
    name: c.name,
    division: c.division as ContestantDivision,
    divisionId: c.divisionId,
    divisionName: c.divisionRef?.name,
    divisionRef: c.divisionRef ? { id: c.divisionRef.id, name: c.divisionRef.name } : undefined,
    status: c.status,
    hometown: c.hometown,
    heightCm: c.heightCm,
    bio: c.bio,
    advocacy: c.advocacy,
    avatarUrl: c.avatarUrl,
    instagramUrl: c.instagramUrl,
    tiktokUrl: c.tiktokUrl,
    facebookUrl: c.facebookUrl,
    voteCount: c.voteCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    media: c.media.map((m) => ({
      id: m.id,
      contestantId: m.contestantId,
      mediaType: m.mediaType,
      url: m.url,
      embedPlatform: m.embedPlatform,
      embedId: m.embedId,
      displayOrder: m.displayOrder,
      aspectRatio: m.aspectRatio,
      isCover: m.isCover,
      createdAt: m.createdAt.toISOString(),
    })),
    categories: c.categories.map((cat) => ({
      id: cat.awardCategory.id,
      eventId: cat.awardCategory.eventId,
      name: cat.awardCategory.name,
      description: cat.awardCategory.description,
      isVotingOpen: cat.awardCategory.isVotingOpen,
      createdAt: cat.awardCategory.createdAt.toISOString(),
      updatedAt: cat.awardCategory.updatedAt.toISOString(),
    })),
  }));

  const categories: AwardCategoryDto[] = categoriesRaw.map((cat) => ({
    id: cat.id,
    eventId: cat.eventId,
    name: cat.name,
    description: cat.description,
    isVotingOpen: cat.isVotingOpen,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  const divisions = divisionsRaw.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    displayOrder: d.displayOrder,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      <OrganizerDashboardHeader event={event} user={session} activeSection="contestants" />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <OrganizerContestantTable
          slug={event.slug}
          contestants={contestants}
          categories={categories}
          divisions={divisions}
        />
      </main>
    </div>
  );
}
