import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { calculateFinancialMetrics } from "@/features/events/services/financial-metrics";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const authResult = await requireEventOwnership(slug);

    if (!authResult.authorized) {
      if (authResult.reason === "UNAUTHENTICATED") {
        return apiError("Authentication required", 401);
      }
      if (authResult.reason === "NOT_FOUND") {
        return apiError("Event not found", 404);
      }
      return apiError("Forbidden: You do not have access to this event's financial telemetry", 403);
    }

    const metrics = await calculateFinancialMetrics(authResult.event.id);
    return apiSuccess(metrics);
  } catch (error) {
    console.error("Failed to fetch financial metrics:", error);
    return apiError("Internal server error", 500);
  }
}
