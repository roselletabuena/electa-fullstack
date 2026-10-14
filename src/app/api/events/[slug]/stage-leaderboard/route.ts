import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { getStageLeaderboardData } from "@/features/hackathons/services/peoples-choice-service";
import type { StageLeaderboardDataDto } from "@/features/hackathons/types/peoples-choice";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<StageLeaderboardDataDto>>> {
  try {
    const { slug } = await context.params;
    const url = new URL(request.url);
    const track = url.searchParams.get("track") || undefined;

    const data = await getStageLeaderboardData(slug, track);

    if (!data) {
      return apiError("Event not found or stage leaderboard unavailable", 404);
    }

    return apiSuccess(data);
  } catch (err: unknown) {
    console.error("[GET /api/events/[slug]/stage-leaderboard] Error:", err);
    return apiError("Failed to retrieve stage leaderboard data.", 500);
  }
}
