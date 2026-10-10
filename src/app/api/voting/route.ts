import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { castVoteAction } from "@/features/voting/actions/cast-vote";
import { getSession } from "@/lib/auth/get-session";
import type { CastVoteResultDto } from "@/features/voting/types";

export interface VotingServiceStatusDto {
  service: string;
  authenticated: boolean;
  userId?: string | undefined;
}

export async function GET(
  _request?: NextRequest,
): Promise<NextResponse<ApiResponse<VotingServiceStatusDto>>> {
  const session = await getSession();
  return apiSuccess({
    service: "Electa Core Voting Engine",
    authenticated: !!session?.userId,
    ...(session?.userId ? { userId: session.userId } : {}),
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<CastVoteResultDto>>> {
  try {
    const body = (await request.json()) as unknown;
    const result = await castVoteAction(body);

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
    console.error("[POST /api/voting] Unexpected error:", err);
    return apiError("Internal server error during vote submission.", 500);
  }
}
