import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import { deriveEventState } from "@/features/events/utils/derive-event-state";
import { computePassphraseDigest, verifyPreviewToken } from "@/features/events/utils/preview-token";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import type { PublicEventDto } from "@/features/events/types";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

interface RetrievedEvent {
  event: PublicEventDto | null;
  draftHash: string | null;
  isDbRecord: boolean;
}

async function fetchDbEvent(slug: string): Promise<RetrievedEvent> {
  try {
    const dbEvent = await db.event.findUnique({
      where: { slug },
      include: {
        contestants: {
          where: { status: "ACTIVE" },
          orderBy: { contestantNumber: "asc" },
        },
      },
    });

    if (!dbEvent) {
      return { event: null, draftHash: null, isDbRecord: false };
    }

    const operationalState = deriveEventState({
      publicationStatus: dbEvent.publicationStatus,
      startsAt: dbEvent.startsAt,
      endsAt: dbEvent.endsAt,
    });

    return {
      isDbRecord: true,
      draftHash: dbEvent.draftPassphraseHash,
      event: {
        id: dbEvent.id,
        slug: dbEvent.slug,
        title: dbEvent.title,
        description: dbEvent.description,
        bannerUrl: dbEvent.bannerUrl,
        startsAt: dbEvent.startsAt.toISOString(),
        endsAt: dbEvent.endsAt.toISOString(),
        serverTime: new Date().toISOString(),
        operationalState,
        showResultsOnClose: dbEvent.showResultsOnClose,
        isFreeVotingEnabled: dbEvent.isFreeVotingEnabled,
        dailyFreeVoteLimit: dbEvent.dailyFreeVoteLimit,
        organizerId: dbEvent.organizerId,
        contestants: dbEvent.contestants.map((c) => ({
          id: c.id,
          contestantNumber: c.contestantNumber,
          name: c.name,
          bio: c.bio || "",
          avatarUrl: c.avatarUrl,
          voteCount: c.voteCount,
        })),
      },
    };
  } catch {
    return { event: null, draftHash: null, isDbRecord: false };
  }
}

async function getPreviewCookie(request: NextRequest, slug: string): Promise<string | undefined> {
  const cookieKey = `vs_preview_${slug}`;
  const directCookie = request.cookies.get(cookieKey)?.value;
  if (directCookie) {
    return directCookie;
  }
  try {
    const cookieStore = await cookies();
    return cookieStore.get(cookieKey)?.value;
  } catch {
    return undefined;
  }
}

async function isDraftAuthorized(
  request: NextRequest,
  event: PublicEventDto,
  draftHash: string | null,
  isDbRecord: boolean,
): Promise<boolean> {
  if (event.operationalState !== "Draft") {
    return true;
  }

  const session = await getSession();
  if (session?.userId && event.organizerId && session.userId === event.organizerId) {
    return true;
  }

  const previewCookie = await getPreviewCookie(request, event.slug);
  if (!previewCookie) {
    return false;
  }

  const activeDigest = isDbRecord
    ? computePassphraseDigest(draftHash)
    : computePassphraseDigest("judge-preview-2026");

  return verifyPreviewToken(previewCookie, event.slug, activeDigest);
}

function maskContestantVotes(event: PublicEventDto) {
  const showResults = event.operationalState === "Closed" && event.showResultsOnClose;
  return event.contestants.map((candidate) => ({
    ...candidate,
    voteCount: showResults ? candidate.voteCount : null,
  }));
}

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<PublicEventDto>>> {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return apiError("Event slug parameter is required", 400);
    }

    const { event: dbEvent, draftHash, isDbRecord } = await fetchDbEvent(slug);
    const event = dbEvent ?? getMockEventBySlug(slug);

    if (!event) {
      return apiError("Event not found", 404);
    }

    const authorized = await isDraftAuthorized(request, event, draftHash, isDbRecord);
    if (!authorized) {
      return apiError("Event not found", 404);
    }

    return apiSuccess({
      ...event,
      contestants: maskContestantVotes(event),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to retrieve event by slug:", error);
    return apiError("Internal server error while fetching event", 500);
  }
}
