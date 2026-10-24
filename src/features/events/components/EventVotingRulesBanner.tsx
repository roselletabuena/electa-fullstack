"use client";

import React from "react";
import { FreeVoteCooldownBanner } from "@/features/voting/components/FreeVoteCooldownBanner";

export interface EventVotingRulesBannerProps {
  eventId?: string | undefined;
  isFreeVotingEnabled?: boolean | undefined;
  dailyFreeVoteLimit?: number | undefined;
  onBoostClick?: (() => void) | undefined;
  className?: string | undefined;
}

export function EventVotingRulesBanner({
  eventId = "",
  isFreeVotingEnabled = true,
  dailyFreeVoteLimit = 1,
  onBoostClick,
  className,
}: Readonly<EventVotingRulesBannerProps>): React.JSX.Element {
  return (
    <FreeVoteCooldownBanner
      eventId={eventId}
      isFreeVotingEnabled={isFreeVotingEnabled}
      dailyFreeVoteLimit={dailyFreeVoteLimit}
      onBoostClick={onBoostClick}
      className={className}
    />
  );
}
