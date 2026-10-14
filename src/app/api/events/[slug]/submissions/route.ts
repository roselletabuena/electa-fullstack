import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/get-session";
import { createProjectSubmissionSchema } from "@/lib/validations/hackathon-submission";
import {
  createProjectSubmission,
  getProjectSubmissions,
} from "@/features/hackathons/services/submission-service";
import type { ProjectSubmissionStatus } from "@/generated/client/enums";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]/submissions
 * Public or participant endpoint to list project submissions for an event.
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);

    const track = searchParams.get("track") || undefined;
    const statusParam = searchParams.get("status");
    const status = (statusParam as ProjectSubmissionStatus) || undefined;
    const teamLeadId = searchParams.get("teamLeadId") || undefined;

    const result = await getProjectSubmissions(slug, {
      track,
      status,
      teamLeadId,
    });

    if (!result.success) {
      return apiError(result.error.message, result.error.status);
    }

    return apiSuccess(result.data);
  } catch (error) {
    console.error("Failed to list hackathon project submissions:", error);
    return apiError("Internal server error", 500);
  }
}

/**
 * POST /api/events/[slug]/submissions
 * Authenticated endpoint for a team lead to submit a project entry.
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;

    const session = await getSession();
    if (!session || !session.userId) {
      return apiError("Authentication required.", 401);
    }

    const body = await request.json().catch(() => null);
    const parsed = createProjectSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(firstIssue?.message || "Invalid submission payload", 400);
    }

    const result = await createProjectSubmission(slug, session.userId, parsed.data);

    if (!result.success) {
      return apiError(result.error.message, result.error.status);
    }

    return apiSuccess(result.data, 201);
  } catch (error) {
    console.error("Failed to create hackathon project submission:", error);
    const message = error instanceof Error ? error.message : "Failed to create submission";
    return apiError(message, 500);
  }
}
