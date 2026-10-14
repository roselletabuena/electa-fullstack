import { db } from "@/lib/db";
import { EventArchetype, EventPublicationStatus, Prisma } from "@/generated/client/client";
import type {
  CastPeoplesChoiceVoteResponse,
  AttendeePeoplesChoiceStatusDto,
  StageLeaderboardDataDto,
  StageProjectLeaderboardEntryDto,
} from "../types/peoples-choice";

export interface CastPeoplesChoiceVoteParams {
  eventIdOrSlug: string;
  submissionId: string;
  voterId: string;
  now?: Date | undefined;
}

/**
 * Atomically records a single People's Choice vote for a hackathon project submission.
 * Enforces strict 1-vote-per-attendee-session limit via database unique constraint.
 */
export async function castPeoplesChoiceVote(
  params: Readonly<CastPeoplesChoiceVoteParams>
): Promise<CastPeoplesChoiceVoteResponse> {
  const { eventIdOrSlug, submissionId, voterId } = params;
  const now = params.now ?? new Date();

  // 1. Resolve event and verify hackathon eligibility
  const event = await db.event.findFirst({
    where: {
      OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
    },
    select: {
      id: true,
      slug: true,
      archetype: true,
      publicationStatus: true,
      startsAt: true,
      endsAt: true,
    },
  });

  if (!event) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "The requested hackathon event could not be found.",
      },
    };
  }

  if (event.archetype !== EventArchetype.HACKATHON) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "People's Choice voting is exclusively enabled for Hackathon events.",
      },
    };
  }

  if (event.publicationStatus !== EventPublicationStatus.PUBLISHED) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "Voting is only allowed on published hackathon events.",
      },
    };
  }

  if (now < event.startsAt) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "People's Choice voting has not opened yet.",
      },
    };
  }

  if (now > event.endsAt) {
    return {
      success: false,
      data: null,
      error: {
        code: "EVENT_NOT_ACTIVE",
        message: "People's Choice voting is closed for this hackathon.",
      },
    };
  }

  // 2. Resolve submission
  const submission = await db.projectSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      eventId: true,
      title: true,
      status: true,
    },
  });

  if (!submission || submission.eventId !== event.id) {
    return {
      success: false,
      data: null,
      error: {
        code: "SUBMISSION_NOT_FOUND",
        message: "The selected project submission could not be found for this event.",
      },
    };
  }

  // 3. Atomic transaction recording vote and incrementing vote count
  try {
    const updatedSubmission = await db.$transaction(async (tx) => {
      await tx.projectVote.create({
        data: {
          eventId: event.id,
          submissionId: submission.id,
          voterId,
        },
      });

      return await tx.projectSubmission.update({
        where: { id: submission.id },
        data: {
          voteCount: { increment: 1 },
        },
        select: {
          id: true,
          voteCount: true,
        },
      });
    });

    return {
      success: true,
      data: {
        submissionId: updatedSubmission.id,
        totalVotes: updatedSubmission.voteCount,
        hasVoted: true,
      },
      error: null,
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        success: false,
        data: null,
        error: {
          code: "ALREADY_VOTED",
          message: "You have already cast your People's Choice vote for this hackathon.",
        },
      };
    }

    console.error("[castPeoplesChoiceVote] Unexpected transaction error:", err);
    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while casting your vote. Please try again.",
      },
    };
  }
}

/**
 * Checks an attendee's participation status and remaining vote credits for an event.
 */
export async function getAttendeePeoplesChoiceStatus(
  eventId: string,
  voterId: string
): Promise<AttendeePeoplesChoiceStatusDto> {
  const existingVote = await db.projectVote.findUnique({
    where: {
      eventId_voterId: {
        eventId,
        voterId,
      },
    },
    select: {
      submissionId: true,
    },
  });

  if (existingVote) {
    return {
      hasVoted: true,
      votedSubmissionId: existingVote.submissionId,
      remainingCredits: 0,
    };
  }

  return {
    hasVoted: false,
    votedSubmissionId: null,
    remainingCredits: 1,
  };
}

/**
 * Retrieves projector stage leaderboard standings, ranking projects by vote count with percentage shares.
 */
export async function getStageLeaderboardData(
  eventIdOrSlug: string,
  trackFilter?: string | undefined
): Promise<StageLeaderboardDataDto | null> {
  const event = await db.event.findFirst({
    where: {
      OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      positions: {
        select: { name: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!event) {
    return null;
  }

  const submissions = await db.projectSubmission.findMany({
    where: {
      eventId: event.id,
      ...(trackFilter && trackFilter !== "all"
        ? {
            trackTags: {
              some: {
                trackName: {
                  equals: trackFilter,
                  mode: "insensitive",
                },
              },
            },
          }
        : {}),
    },
    orderBy: [{ voteCount: "desc" }, { createdAt: "asc" }],
    include: {
      trackTags: true,
      members: true,
    },
  });

  // Explicit sort descending by voteCount to guarantee rank order
  submissions.sort((a, b) => b.voteCount - a.voteCount);

  let totalVotes = 0;
  for (const s of submissions) {
    totalVotes += s.voteCount;
  }

  const trackSet = new Set<string>();
  for (const p of event.positions) {
    if (p.name) trackSet.add(p.name);
  }
  for (const s of submissions) {
    for (const t of s.trackTags) {
      trackSet.add(t.trackName);
    }
  }

  const topProjects: StageProjectLeaderboardEntryDto[] = submissions.map((sub, index) => {
    const votePercentage =
      totalVotes > 0 ? Math.round((sub.voteCount / totalVotes) * 100 * 10) / 10 : 0;

    return {
      id: sub.id,
      title: sub.title,
      tagline: sub.tagline,
      repositoryUrl: sub.repositoryUrl,
      demoUrl: sub.demoUrl,
      trackTags: sub.trackTags.map((t) => t.trackName),
      members: sub.members.map((m) => m.name),
      voteCount: sub.voteCount,
      rank: index + 1,
      votePercentage,
    };
  });

  return {
    eventId: event.id,
    eventSlug: event.slug,
    eventTitle: event.title,
    totalVotesCast: totalVotes,
    totalProjects: submissions.length,
    topProjects,
    tracks: Array.from(trackSet),
  };
}
