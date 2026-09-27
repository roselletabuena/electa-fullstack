import type { EventPublicationStatus } from "@/generated/client/client";
import type {
  OrganizerEventItemDto,
  DashboardMetricsDto,
  EventStatusFilter,
} from "../types/dashboard-overview";

export function computeEventStatus(
  event: {
    publicationStatus: EventPublicationStatus;
    startsAt: Date | string;
    endsAt: Date | string;
  },
  referenceDate: Date = new Date(),
): { isLive: boolean; isEnded: boolean } {
  const now = referenceDate.getTime();
  const start = new Date(event.startsAt).getTime();
  const end = new Date(event.endsAt).getTime();

  const isLive = event.publicationStatus === "PUBLISHED" && start <= now && now <= end;
  const isEnded = now > end;

  return { isLive, isEnded };
}

export function computeDashboardMetrics(events: OrganizerEventItemDto[]): DashboardMetricsDto {
  const totalEvents = events.length;
  let liveEvents = 0;
  let totalCandidates = 0;
  let totalVotesCast = 0;

  for (const ev of events) {
    if (ev.isLive) {
      liveEvents += 1;
    }
    totalCandidates += ev.contestantsCount;
    totalVotesCast += ev.votesCount;
  }

  return {
    totalEvents,
    liveEvents,
    totalCandidates,
    totalVotesCast,
  };
}

export interface FilterAndPaginateResult {
  items: OrganizerEventItemDto[];
  totalFiltered: number;
  totalPages: number;
  currentPage: number;
}

export function filterAndPaginateEvents(
  events: OrganizerEventItemDto[],
  filters: {
    status?: EventStatusFilter | undefined;
    q?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
  },
): FilterAndPaginateResult {
  const status = filters.status ?? "ALL";
  const query = (filters.q ?? "").trim().toLowerCase();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 12);

  const filtered = events.filter((ev) => {
    const matchesStatus =
      status === "ALL" ||
      (status === "PUBLISHED" && ev.isLive) ||
      (status === "DRAFT" && ev.publicationStatus === "DRAFT") ||
      (status === "ARCHIVED" && (ev.publicationStatus === "ARCHIVED" || ev.isEnded));

    if (!matchesStatus) return false;

    if (!query) return true;

    return (
      ev.title.toLowerCase().includes(query) ||
      ev.description.toLowerCase().includes(query) ||
      ev.slug.toLowerCase().includes(query)
    );
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
  const validPage = Math.min(page, totalPages);

  const startIndex = (validPage - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    totalFiltered,
    totalPages,
    currentPage: validPage,
  };
}
