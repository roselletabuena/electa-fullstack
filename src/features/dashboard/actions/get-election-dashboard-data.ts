"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import {
  computeTurnoutMetrics,
  computeOfficeTallies,
} from "../utils/turnout-calculator";
import type { TurnoutMetricsDto, OfficeTallyDto } from "../types/turnout-audit";

export interface GetElectionDashboardDataResult {
  success: boolean;
  data: {
    event: {
      id: string;
      title: string;
      slug: string;
      startsAt: string;
      endsAt: string;
      organizerId: string;
    };
    turnout: TurnoutMetricsDto;
    offices: OfficeTallyDto[];
    isPollClosed: boolean;
  } | null;
  error?: {
    code: string;
    message: string;
  };
}

export async function getElectionDashboardData(
  slugOrId: string,
): Promise<GetElectionDashboardDataResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to view the election dashboard.",
        },
      };
    }

    const event = await db.event.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        startsAt: true,
        endsAt: true,
        organizerId: true,
      },
    });

    if (!event) {
      return {
        success: false,
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Election event not found.",
        },
      };
    }

    // Verify organizer authorization
    if (event.organizerId !== session.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: "Only the designated election organizer can inspect the audit dashboard.",
        },
      };
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const [totalWhitelistedVoters, recordedParticipations, recentParticipationsCount] =
      await Promise.all([
        db.studentRosterEntry.count({
          where: { eventId: event.id },
        }),
        db.voterParticipation.count({
          where: { eventId: event.id },
        }),
        db.voterParticipation.count({
          where: {
            eventId: event.id,
            votedAt: { gte: oneHourAgo },
          },
        }),
      ]);

    const turnout = computeTurnoutMetrics({
      totalWhitelistedVoters,
      recordedParticipations,
      recentParticipationsCount,
      endsAt: event.endsAt,
      now,
    });

    let offices: OfficeTallyDto[] = [];

    // Candidate tallies remain strictly sealed until poll closure
    if (turnout.isPollClosed) {
      const positions = await db.eventPosition.findMany({
        where: { eventId: event.id },
        orderBy: { displayOrder: "asc" },
        include: {
          contestants: {
            select: {
              id: true,
              name: true,
              contestantNumber: true,
              avatarUrl: true,
            },
          },
        },
      });

      const ballotSelections = await db.ballotSelection.findMany({
        where: { eventId: event.id },
        select: {
          officeId: true,
          candidateId: true,
        },
      });

      offices = computeOfficeTallies(positions, ballotSelections);
    }

    return {
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          startsAt: event.startsAt.toISOString(),
          endsAt: event.endsAt.toISOString(),
          organizerId: event.organizerId,
        },
        turnout,
        offices,
        isPollClosed: turnout.isPollClosed,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load election dashboard data.";
    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message,
      },
    };
  }
}
