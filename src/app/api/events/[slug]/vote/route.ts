import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { castVoteAction } from "@/features/voting/actions/cast-vote";
import { getSession } from "@/lib/auth/get-session";
import type { CastVoteResultDto } from "@/features/voting/types";

export interface EventVotingStatusDto {
  service: string;
  slug: string;
  authenticated: boolean;
  userId?: string | undefined;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse<ApiResponse<EventVotingStatusDto>>> {
  const { slug } = await context.params;
  const session = await getSession();

  return apiSuccess({
    service: "Electa Event Voting Gateway",
    slug,
    authenticated: !!session?.userId,
    ...(session?.userId ? { userId: session.userId } : {}),
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse<ApiResponse<CastVoteResultDto>>> {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    // Inject slug into payload if not already provided
    const payload = {
      ...body,
      eventSlug: body.eventSlug ?? slug,
    };

    const result = await castVoteAction(payload);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        NOT_AUTHENTICATED: 401,
        BOT_DETECTION_FAILED: 403,
        RATE_LIMIT_EXCEEDED: 429,
        DEVICE_ACCOUNT_LIMIT_EXCEEDED: 429,
        CONTESTANT_NOT_FOUND: 404,
        INTERNAL_ERROR: 500,
        DAILY_QUOTA_EXHAUSTED: 400,
        EVENT_NOT_ACTIVE: 400,
        FREE_VOTING_DISABLED: 400,
      };

      const statusCode = statusMap[result.error.code] ?? 400;
      return apiError(result.error.message, statusCode);
    }

    return apiSuccess(result.data, 200);
  } catch (err: unknown) {
    console.error("[POST /api/events/[slug]/vote] Unexpected error:", err);
    return apiError("Internal server error during vote submission.", 500);
  }
}
