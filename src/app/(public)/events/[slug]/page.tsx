import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import type { Metadata } from "next";

import { EventPageClient } from "@/features/events/components/EventPageClient";
import { DraftPassphraseModal } from "@/features/events/components/DraftPassphraseModal";
import { verifyPreviewToken } from "@/features/events/utils/preview-token";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { deriveEventState } from "@/features/events/utils/derive-event-state";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import type { PublicEventDto } from "@/features/events/types";
import EventLoading from "./loading";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPublicEvent(slug: string): Promise<PublicEventDto | null> {
  try {
    const event = await db.event.findUnique({
      where: { slug },
      include: {
        contestants: {
          where: { status: "ACTIVE" },
          orderBy: { contestantNumber: "asc" },
        },
      },
    });

    if (event) {
      const operationalState = deriveEventState({
        publicationStatus: event.publicationStatus,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
      });

      return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        bannerUrl: event.bannerUrl,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt.toISOString(),
        serverTime: new Date().toISOString(),
        operationalState,
        showResultsOnClose: event.showResultsOnClose,
        isFreeVotingEnabled: event.isFreeVotingEnabled,
        dailyFreeVoteLimit: event.dailyFreeVoteLimit,
        contestants: event.contestants.map((c) => ({
          id: c.id,
          contestantNumber: c.contestantNumber,
          name: c.name,
          bio: c.bio || "",
          avatarUrl: c.avatarUrl,
          voteCount: c.voteCount,
        })),
      };
    }
  } catch (error) {
    console.error(`Error fetching event by slug "${slug}":`, error);
  }

  // Fallback to static mock data if present
  return getMockEventBySlug(slug) || null;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await getPublicEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found | Electa",
      description: "The requested voting event could not be found.",
    };
  }

  if (event.operationalState === "Draft") {
    return {
      title: `[Draft Preview] ${event.title} | Electa`,
      description: event.description,
    };
  }

  return {
    title: `${event.title} | Official Contest Voting`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [{ url: event.bannerUrl }],
    },
  };
}

export default async function EventPage(props: PageProps): Promise<React.JSX.Element> {
  const { slug } = await props.params;
  const event = await getPublicEvent(slug);

  if (!event) {
    notFound();
  }

  // Draft state authorization gates
  if (event.operationalState === "Draft") {
    const session = await getSession();
    if (session) {
      return (
        <main>
          <Suspense fallback={<EventLoading />}>
            <EventPageClient initialEvent={event} isDraftPreview accessMode="organizer" />
          </Suspense>
        </main>
      );
    }

    const cookieStore = await cookies();
    const previewCookie = cookieStore.get(`vs_preview_${slug}`)?.value;

    if (previewCookie && verifyPreviewToken(previewCookie, slug)) {
      return (
        <main>
          <Suspense fallback={<EventLoading />}>
            <EventPageClient initialEvent={event} isDraftPreview accessMode="guest" />
          </Suspense>
        </main>
      );
    }

    // Unauthenticated guest reviewer without token: render Passphrase unlock prompt
    return (
      <main className="py-12">
        <DraftPassphraseModal slug={slug} />
      </main>
    );
  }

  return (
    <main>
      <Suspense fallback={<EventLoading />}>
        <EventPageClient initialEvent={event} />
      </Suspense>
    </main>
  );
}
