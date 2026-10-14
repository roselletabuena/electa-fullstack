import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { computeTurnoutMetrics } from "@/features/dashboard/utils/turnout-calculator";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const event = await db.event.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        endsAt: true,
      },
    });

    if (!event) {
      return apiError("Event not found", 404);
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

    return apiSuccess({
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
      },
      turnout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(message, 500);
  }
}
