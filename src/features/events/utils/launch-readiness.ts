import type { Event } from "@/generated/client/client";
import type {
  LaunchReadinessCounts,
  LaunchReadinessSnapshot,
  LaunchReadinessItem,
} from "../types/launch-readiness";

/**
 * Deterministically computes the launch readiness snapshot for an event
 * based on database record state and associated entity counts.
 */
export function computeLaunchReadinessSnapshot(
  event: Event,
  counts: LaunchReadinessCounts,
): LaunchReadinessSnapshot {
  const { divisionsCount, contestantsCount, votingRulesAuditCount } = counts;

  const eventProfileCompleted = true;
  const divisionsCompleted = divisionsCount > 0;
  const contestantsCompleted = contestantsCount > 0;
  const votingRulesCompleted = votingRulesAuditCount > 0;

  const items: LaunchReadinessItem[] = [
    {
      id: "event-profile",
      title: "Event Profile Created",
      description: "Basic competition details, title, and banner imagery configured.",
      isCompleted: eventProfileCompleted,
      actionLabel: "Edit Profile",
      actionHref: `/events/${event.slug}/settings?tab=general`,
    },
    {
      id: "divisions",
      title: "Set Up Divisions",
      description: "Structure competition brackets (e.g. Female, Male, Teen) and categories.",
      isCompleted: divisionsCompleted,
      actionLabel: "Configure Divisions",
      actionHref: `/events/${event.slug}/settings?tab=categories`,
    },
    {
      id: "contestants",
      title: "Add Contestants",
      description: "Register delegates, assign numbers, and upload official candidate media.",
      isCompleted: contestantsCompleted,
      actionLabel: "Manage Contestants",
      actionHref: `/events/${event.slug}/contestants`,
    },
    {
      id: "voting-rules",
      title: "Configure Voting Rules & Pricing",
      description: "Set daily free voting limits, paid boost voting packages, and take rates.",
      isCompleted: votingRulesCompleted,
      actionLabel: "Configure Rules",
      actionHref: `/events/${event.slug}/settings?tab=voting-rules`,
    },
  ];

  const totalMilestones = items.length;
  const completedMilestones = items.filter((item) => item.isCompleted).length;
  const percentageComplete = Math.round((completedMilestones / totalMilestones) * 100);
  const isAllCompleted = completedMilestones === totalMilestones;

  return {
    eventId: event.id,
    slug: event.slug,
    publicationStatus: event.publicationStatus,
    divisionsCount,
    contestantsCount,
    hasVotingRulesConfigured: votingRulesCompleted,
    totalMilestones,
    completedMilestones,
    percentageComplete,
    isAllCompleted,
    items,
  };
}
