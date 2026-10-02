import { type NextRequest, type NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import {
  calculateLeaderboardRanks,
  type RawContestantVote,
} from "@/features/leaderboard/utils/rank-calculator";
import {
  isMysteryFreezeActive,
  redactLeaderboardForPublic,
} from "@/features/leaderboard/utils/freeze-guard";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import type { LeaderboardPayload } from "@/features/leaderboard/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse<ApiResponse<LeaderboardPayload>>> {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("divisionId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;

    const session = await getSession();

    // 1. Fetch event from database
    const event = await db.event.findUnique({
      where: { slug },
      include: {
        contestants: {
          where: {
            status: "ACTIVE",
            ...(divisionId ? { divisionId } : {}),
          },
          include: {
            divisionRef: true,
            categories: true,
            media: { orderBy: { displayOrder: "asc" } },
          },
          orderBy: { contestantNumber: "asc" },
        },
        divisions: { orderBy: { displayOrder: "asc" } },
        awardCategories: { orderBy: { displayOrder: "asc" } },
      },
    });

    let rawEntries: RawContestantVote[] = [];
    let isFrozen = false;
    let eventId = "";
    let eventTitle = "";
    let isOrganizer = false;

    if (event) {
      eventId = event.id;
      eventTitle = event.title;
      isOrganizer = !!session?.userId && session.userId === event.organizerId;

      let activeContestants = event.contestants;
      if (categoryId) {
        activeContestants = activeContestants.filter((c) =>
          c.categories.some((cat) => cat.awardCategoryId === categoryId),
        );
      }

      rawEntries = activeContestants.map((c) => ({
        id: c.id,
        contestantNumber: c.contestantNumber,
        name: c.name,
        avatarUrl:
          c.media?.find((m) => m.isCover && m.mediaType === "PHOTO")?.url ||
          c.media?.find((m) => m.mediaType === "PHOTO")?.url ||
          c.avatarUrl ||
          "/placeholder-contestant.webp",
        divisionId: c.divisionId,
        divisionName: c.divisionRef?.name ?? null,
        voteCount: c.voteCount,
      }));

      isFrozen = isMysteryFreezeActive({
        endsAt: event.endsAt,
        showResultsOnClose: event.showResultsOnClose,
      });
    } else {
      // Fallback to mock data for demo / development
      const mockEvent = getMockEventBySlug(slug);
      if (!mockEvent) {
        return apiError(`Event with slug "${slug}" was not found.`, 404);
      }

      eventId = mockEvent.id;
      eventTitle = mockEvent.title;

      rawEntries = mockEvent.contestants.map((c) => ({
        id: c.id,
        contestantNumber: c.contestantNumber,
        name: c.name,
        avatarUrl: c.avatarUrl,
        voteCount: c.voteCount ?? 0,
      }));

      isFrozen = isMysteryFreezeActive({
        endsAt: mockEvent.endsAt,
        showResultsOnClose: mockEvent.showResultsOnClose,
      });
    }

    // 2. Compute calculated rankings and metrics
    const entries = calculateLeaderboardRanks(rawEntries);
    const totalVotes = entries.reduce((sum, item) => sum + (item.voteCount ?? 0), 0);

    const payload: LeaderboardPayload = {
      eventId,
      eventSlug: slug,
      eventTitle,
      isFrozen,
      totalVotes,
      selectedDivisionId: divisionId ?? null,
      selectedCategoryId: categoryId ?? null,
      entries,
      lastUpdated: new Date().toISOString(),
    };

    // 3. If Mystery Freeze is active and caller is not the organizer, redact fields
    if (isFrozen && !isOrganizer) {
      return apiSuccess(redactLeaderboardForPublic(payload), 200);
    }

    return apiSuccess(payload, 200);
  } catch (error: unknown) {
    console.error("[GET /api/events/[slug]/leaderboard] Unexpected error:", error);
    return apiError("Failed to fetch leaderboard data.", 500);
  }
}
