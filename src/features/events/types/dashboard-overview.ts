import type { EventPublicationStatus } from "@/generated/client/client";

export type EventStatusFilter = "ALL" | EventPublicationStatus;

export interface OrganizerEventItemDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  publicationStatus: EventPublicationStatus;
  isLive: boolean; // computed: publicationStatus === 'PUBLISHED' && startsAt <= now <= endsAt
  isEnded: boolean; // computed: now > endsAt
  contestantsCount: number;
  votesCount: number;
  createdAt: string;
}

export interface DashboardMetricsDto {
  totalEvents: number;
  liveEvents: number;
  totalCandidates: number;
  totalVotesCast: number;
}
