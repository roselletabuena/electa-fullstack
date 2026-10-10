import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import type { Metadata } from "next";

import { EventPageClient } from "@/features/events/components/EventPageClient";
import { DraftPassphraseModal } from "@/features/events/components/DraftPassphraseModal";
import { computePassphraseDigest, verifyPreviewToken } from "@/features/events/utils/preview-token";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { deriveEventState } from "@/features/events/utils/derive-event-state";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import type { PublicEventDto } from "@/features/events/types";
import EventLoading from "./loading";

interface PageProps {
  readonly params: Promise<{
    readonly slug: string;
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
        organizerId: event.organizerId,
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

export default async function EventPage(props: Readonly<PageProps>): Promise<React.JSX.Element> {
  const { slug } = await props.params;
  const event = await getPublicEvent(slug);

  if (!event) {
    notFound();
  }

  // Draft state authorization gates
  if (event.operationalState === "Draft") {
    const session = await getSession();
    const isOwner = Boolean(session && event.organizerId && session.userId === event.organizerId);

    if (isOwner) {
      return (
        <main>
          <Suspense fallback={<EventLoading />}>
            <EventPageClient initialEvent={event} isDraftPreview accessMode="organizer" />
          </Suspense>
        </main>
      );
    }

    let draftHash: string | null = null;
    let isDbRecord = false;
    try {
      const dbEvent = await db.event.findUnique({
        where: { slug },
        select: { draftPassphraseHash: true },
      });
      if (dbEvent) {
        isDbRecord = true;
        draftHash = dbEvent.draftPassphraseHash;
      }
    } catch {
      // Optional in mock environments
    }

    // Active digest from db hash, or for mock fallback
    const activeDigest = isDbRecord
      ? computePassphraseDigest(draftHash)
      : computePassphraseDigest("judge-preview-2026");

    const cookieStore = await cookies();
    const previewCookie = cookieStore.get(`vs_preview_${slug}`)?.value;

    if (previewCookie && verifyPreviewToken(previewCookie, slug, activeDigest)) {
      return (
        <main>
          <Suspense fallback={<EventLoading />}>
            <EventPageClient initialEvent={event} isDraftPreview accessMode="guest" />
          </Suspense>
        </main>
      );
    }

    // Unauthenticated guest reviewer or non-owner: render Passphrase unlock prompt
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
