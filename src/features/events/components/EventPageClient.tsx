"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

import { BoostVoteModal } from "@/features/payments";
import { ContestantRoster } from "@/features/contestants/components/ContestantRoster";
import { useCategories } from "@/features/contestants/hooks/use-categories";
import { useContestants } from "@/features/contestants/hooks/use-contestants";
import { usePendingVoteIntent } from "@/features/voting/hooks/use-pending-vote-intent";

import { DraftPreviewBanner } from "./DraftPreviewBanner";
import { EventBanner } from "./EventBanner";
import { EventCountdown } from "./EventCountdown";
import { EventVotingRulesBanner } from "./EventVotingRulesBanner";
import { useEventTaxonomy } from "../hooks/useEventTaxonomy";

import type { ContestantDto as RichContestantDto } from "@/features/contestants/types";
import type { EventOperationalState, PublicEventDto } from "../types";

export interface EventPageClientProps {
  initialEvent: PublicEventDto;
  isDraftPreview?: boolean;
  accessMode?: "organizer" | "guest";
}

export function EventPageClient({
  initialEvent,
  isDraftPreview = false,
  accessMode = "guest",
}: Readonly<EventPageClientProps>): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [operationalStateOverride, setOperationalStateOverride] =
    useState<EventOperationalState | null>(null);
  const [prevOperationalState, setPrevOperationalState] = useState(initialEvent.operationalState);
  const [boostCandidate, setBoostCandidate] = useState<RichContestantDto | null>(null);

  if (prevOperationalState !== initialEvent.operationalState) {
    setPrevOperationalState(initialEvent.operationalState);
    setOperationalStateOverride(null);
  }

  const event: PublicEventDto = {
    ...initialEvent,
    operationalState: operationalStateOverride ?? initialEvent.operationalState,
  };

  const { data: apiContestants } = useContestants(event.slug);
  const { data: apiCategories } = useCategories(event.slug);
  const { data: taxonomy } = useEventTaxonomy(event.slug);

  usePendingVoteIntent({
    eventId: event.id,
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleStateTransition = (): void => {
    // When countdown hits zero, immediately recalculate state and revalidate
    const nextState: EventOperationalState =
      event.operationalState === "Scheduled" ? "Active" : "Closed";

    setOperationalStateOverride(nextState);
    router.refresh();
  };

  const handleSelectCandidate = (candidate: RichContestantDto): void => {
    setBoostCandidate(candidate);
  };

  // Convert initial event contestants to RichContestantDto format as fallback
  const fallbackRichContestants: RichContestantDto[] = event.contestants.map((c) => ({
    id: c.id,
    eventId: event.id,
    contestantNumber: c.contestantNumber,
    name: c.name,
    division: "FEMALE",
    status: "ACTIVE",
    hometown: "Philippines",
    heightCm: 175,
    bio: c.bio,
    advocacy: c.bio,
    avatarUrl: c.avatarUrl,
    instagramUrl: "https://instagram.com",
    tiktokUrl: "https://tiktok.com",
    facebookUrl: "https://facebook.com",
    voteCount: c.voteCount ?? 0,
    media: [
      {
        id: `m_${c.id}`,
        mediaType: "PHOTO",
        url: c.avatarUrl,
        embedPlatform: "NONE",
        displayOrder: 0,
        aspectRatio: "4:5",
        isCover: true,
      },
    ],
    categories: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const contestantsToDisplay =
    apiContestants && apiContestants.length > 0 ? apiContestants : fallbackRichContestants;

  const totalVotes = contestantsToDisplay.reduce((sum, c) => sum + (c.voteCount ?? 0), 0);
  const featuredCandidate = contestantsToDisplay[0];

  return (
    <main className="bg-background text-foreground w-full max-w-full min-w-0 flex-1 overflow-x-hidden px-3 py-4 pb-20 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl min-w-0 space-y-4 sm:space-y-6 md:space-y-8">
        {(isDraftPreview || event.operationalState === "Draft") && (
          <DraftPreviewBanner accessMode={accessMode} />
        )}

        <EventBanner event={event} totalVotes={totalVotes} />

        <EventCountdown
          operationalState={event.operationalState}
          startsAt={event.startsAt}
          endsAt={event.endsAt}
          serverTime={event.serverTime}
          onStateTransition={handleStateTransition}
        />

        <EventVotingRulesBanner
          eventId={event.id}
          isFreeVotingEnabled={event.isFreeVotingEnabled}
          dailyFreeVoteLimit={event.dailyFreeVoteLimit}
          onBoostClick={
            featuredCandidate ? () => handleSelectCandidate(featuredCandidate) : undefined
          }
        />

        <ContestantRoster
          initialContestants={contestantsToDisplay}
          divisions={taxonomy?.divisions}
          categories={taxonomy?.awardCategories ?? apiCategories ?? []}
          onVoteClick={handleSelectCandidate}
        />

        {boostCandidate && (
          <BoostVoteModal
            isOpen={Boolean(boostCandidate)}
            onClose={() => setBoostCandidate(null)}
            eventId={event.id}
            eventTitle={event.title}
            contestantId={boostCandidate.id}
            contestantName={boostCandidate.name}
            contestantNumber={boostCandidate.contestantNumber}
            contestantAvatarUrl={boostCandidate.avatarUrl}
            onSuccess={() => {
              router.refresh();
              void queryClient.invalidateQueries({ queryKey: ["contestants"] });
              void queryClient.invalidateQueries({ queryKey: ["event"] });
              void queryClient.invalidateQueries({ queryKey: ["events"] });
              void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
              void queryClient.invalidateQueries({ queryKey: ["voting-quota"] });
            }}
          />
        )}
      </div>

      {/* Mobile Sticky Quick-Action HUD */}
      {event.operationalState === "Active" && (
        <aside
          aria-label="Mobile voting quick access"
          className="fixed inset-x-0 bottom-0 z-30 flex w-full max-w-full items-center justify-between border-t border-slate-300 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95"
        >
          <div className="flex items-center gap-2">
            <span
              className="flex size-2 animate-pulse rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <span className="font-heading text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
              Live Ballot
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
              ({totalVotes.toLocaleString()} votes)
            </span>
          </div>

          <Link
            href={`/events/${event.slug}/leaderboard`}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
          >
            <Trophy className="size-3.5 text-amber-400" aria-hidden="true" />
            <span>Leaderboard</span>
          </Link>
        </aside>
      )}
    </main>
  );
}
