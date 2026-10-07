"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ContestantRoster } from "@/features/contestants/components/ContestantRoster";
import { useContestants } from "@/features/contestants/hooks/use-contestants";
import { useCategories } from "@/features/contestants/hooks/use-categories";
import { useEventTaxonomy } from "../hooks/useEventTaxonomy";
import type { ContestantDto as RichContestantDto } from "@/features/contestants/types";
import { DraftPreviewBanner } from "./DraftPreviewBanner";
import { EventBanner } from "./EventBanner";
import { EventCountdown } from "./EventCountdown";
import { EventVotingRulesBanner } from "./EventVotingRulesBanner";
import { usePendingVoteIntent } from "@/features/voting/hooks/use-pending-vote-intent";
import { BoostVoteModal } from "@/features/payments";
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

  return (
    <div className="bg-background text-foreground min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {(isDraftPreview || event.operationalState === "Draft") && (
          <DraftPreviewBanner accessMode={accessMode} />
        )}

        <EventBanner event={event} totalVotes={totalVotes} />

        <EventVotingRulesBanner
          isFreeVotingEnabled={event.isFreeVotingEnabled}
          dailyFreeVoteLimit={event.dailyFreeVoteLimit}
        />

        <EventCountdown
          operationalState={event.operationalState}
          startsAt={event.startsAt}
          endsAt={event.endsAt}
          serverTime={event.serverTime}
          onStateTransition={handleStateTransition}
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
    </div>
  );
}
