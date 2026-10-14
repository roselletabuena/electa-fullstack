import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { deriveEventState } from "@/features/events/utils/derive-event-state";
import { verifyVoterEligibility } from "@/features/institutions/services/roster-service";
import { hasVoterSubmittedBallot } from "@/features/voting/services/voting-engine";
import { MultiOfficeBallot } from "@/features/voting/components/multi-office-ballot";
import { BallotReceiptCard } from "@/features/voting/components/ballot-receipt-card";
import { VoterAuthGuard } from "@/features/voting/components/voter-auth-guard";
import type { PublicBallotEventDto } from "@/features/voting/types/ballot";

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
      title: "Ballot Not Found | Electa",
      description: "The requested election ballot could not be found.",
    };
  }

  return {
    title: `Official Ballot: ${event.title} | Electa`,
    description: `Cast your official student council ballot for ${event.title}. Verified, secure, and secret-ballot protected.`,
  };
}

export default async function BallotPage(props: Readonly<PageProps>): Promise<React.JSX.Element> {
  const { slug } = await props.params;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      positions: {
        where: { isVotingOpen: true },
        orderBy: { displayOrder: "asc" },
      },
      contestants: {
        where: { status: "ACTIVE" },
        orderBy: { contestantNumber: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const operationalState = deriveEventState({
    publicationStatus: event.publicationStatus,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  });

  // Verify that voting is actively open
  const isVotingOpen =
    operationalState === "Active" &&
    event.publicationStatus === "PUBLISHED" &&
    new Date() >= event.startsAt &&
    new Date() <= event.endsAt;


  if (!isVotingOpen) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="card-style border border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0d1424]">
          <div className="mx-auto flex size-12 items-center justify-center border border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock className="size-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Voting Is Closed
          </h1>
          <p className="mt-2 font-sans text-xs text-slate-600 sm:text-sm dark:text-slate-300">
            Official ballot submission for <strong className="text-slate-900 dark:text-white">{event.title}</strong> is currently unavailable or the election window has ended.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/events/${event.slug}`}
              className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-5 py-2.5 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <ArrowLeft className="size-4" />
              <span>Return to Election Overview</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Voter Authentication Gate
  const session = await getSession();
  if (!session?.userId) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <VoterAuthGuard
          type="unauthenticated"
          eventSlug={event.slug}
          eventTitle={event.title}
          allowedDomains={event.allowedEmailDomains}
        />
      </main>
    );
  }

  // Duplicate Submission Gate
  const alreadySubmitted = await hasVoterSubmittedBallot(event.id, session.userId);
  if (alreadySubmitted) {
    const existingBallot = await db.ballotSubmission.findUnique({
      where: {
        eventId_voterId: {
          eventId: event.id,
          voterId: session.userId,
        },
      },
      include: {
        votes: true,
      },
    });

    if (existingBallot) {
      return (
        <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
          <BallotReceiptCard
            receipt={{
              ballotId: existingBallot.id,
              eventId: event.id,
              votesCount: existingBallot.votes.length,
              submittedAt: existingBallot.createdAt.toISOString(),
            }}
            eventSlug={event.slug}
            eventTitle={event.title}
          />
        </main>
      );
    }

    return (
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <VoterAuthGuard
          type="already_voted"
          eventSlug={event.slug}
          eventTitle={event.title}
        />
      </main>
    );
  }

  // Institutional Roster & Email Domain Eligibility Gate
  const eligibility = await verifyVoterEligibility({
    eventId: event.id,
    email: session.email,
  });


  if (!eligibility.isEligible) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <VoterAuthGuard
          type="ineligible"
          eventSlug={event.slug}
          eventTitle={event.title}
          userEmail={session.email}
          allowedDomains={event.allowedEmailDomains}
          reason={eligibility.reason}
        />
      </main>
    );
  }

  // Format DTO for MultiOfficeBallot
  const ballotEventDto: PublicBallotEventDto = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    bannerUrl: event.bannerUrl,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    operationalState,
    positions: event.positions.map((pos) => ({
      id: pos.id,
      name: pos.name,
      description: pos.description,
      minSelectionsPerVoter: pos.minSelectionsPerVoter,
      maxSelectionsPerVoter: pos.maxSelectionsPerVoter,
      displayOrder: pos.displayOrder,
      isVotingOpen: pos.isVotingOpen,
    })),
    candidates: event.contestants.map((c) => ({
      id: c.id,
      contestantNumber: c.contestantNumber,
      name: c.name,
      avatarUrl: c.avatarUrl,
      bio: c.bio,
      positionId: c.positionId ?? "",
    })),
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="border border-slate-300 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0d1424] dark:text-slate-400">
            Loading official ballot...
          </div>
        }
      >
        <MultiOfficeBallot event={ballotEventDto} />
      </Suspense>
    </main>
  );
}
