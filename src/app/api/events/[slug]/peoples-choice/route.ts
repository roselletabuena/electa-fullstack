import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { castPeoplesChoiceVoteAction } from "@/features/hackathons/actions/cast-peoples-choice-vote";
import { getAttendeePeoplesChoiceStatus } from "@/features/hackathons/services/peoples-choice-service";
import type {
  AttendeePeoplesChoiceStatusDto,
  CastPeoplesChoiceVoteResultDto,
} from "@/features/hackathons/types/peoples-choice";

const ATTENDEE_COOKIE_NAME = "electa_attendee_id";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<AttendeePeoplesChoiceStatusDto>>> {
  try {
    const { slug } = await context.params;
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return apiError("Event not found", 404);
    }

    const session = await getSession();
    let voterId = session?.userId ?? null;

    if (!voterId) {
      const cookieStore = await cookies();
      voterId = cookieStore.get(ATTENDEE_COOKIE_NAME)?.value ?? null;
    }

    if (!voterId) {
      return apiSuccess({
        hasVoted: false,
        votedSubmissionId: null,
        remainingCredits: 1,
      });
    }

    const status = await getAttendeePeoplesChoiceStatus(event.id, voterId);
    return apiSuccess(status);
  } catch (err: unknown) {
    console.error("[GET /api/events/[slug]/peoples-choice] Error:", err);
    return apiError("Failed to retrieve voting status.", 500);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<CastPeoplesChoiceVoteResultDto>>> {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const payload = {
      ...body,
      eventId: body.eventId ?? slug,
    };

    const result = await castPeoplesChoiceVoteAction(payload);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        NOT_AUTHENTICATED: 401,
        ALREADY_VOTED: 409,
        EVENT_NOT_ACTIVE: 400,
        SUBMISSION_NOT_FOUND: 404,
        RATE_LIMIT_EXCEEDED: 429,
        INTERNAL_ERROR: 500,
      };

      const statusCode = statusMap[result.error.code] ?? 400;
      return apiError(result.error.message, statusCode);
    }

    return apiSuccess(result.data, 200);
  } catch (err: unknown) {
    console.error("[POST /api/events/[slug]/peoples-choice] Unexpected error:", err);
    return apiError("Internal server error during vote submission.", 500);
  }
}
