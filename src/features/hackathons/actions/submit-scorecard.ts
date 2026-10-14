"use server";

import { getSession } from "@/lib/auth/get-session";
import { submitScorecardSchema } from "@/lib/validations/rubric";
import { submitJudgeEvaluation } from "../services/rubric-service";
import type { SubmitScorecardResponse } from "../types/rubric";

/**
 * Validates whether the authenticated session has judge or organizer privileges.
 */
function isAuthorizedJudgeSession(session: {
  role?: string | undefined;
  isJudge?: boolean | undefined;
} | null): boolean {
  if (!session) return false;
  const normalizedRole = session.role?.toUpperCase();
  if (
    normalizedRole === "JUDGE" ||
    normalizedRole === "ORGANIZER" ||
    normalizedRole === "ADMIN"
  ) {
    return true;
  }
  return session.isJudge === true;
}

/**
 * Server Action for judges to submit or draft multi-criteria rubric scorecards.
 */
export async function submitScorecardAction(
  rawInput: unknown
): Promise<SubmitScorecardResponse> {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to submit a judge scorecard.",
        },
      };
    }

    if (!isAuthorizedJudgeSession(session)) {
      return {
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message:
            "Unauthorized: User does not have judge privileges for this event.",
        },
      };
    }

    const parseResult = submitScorecardSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message:
            parseResult.error.issues[0]?.message ||
            "Invalid scorecard submission parameters.",
        },
      };
    }

    const result = await submitJudgeEvaluation({
      eventId: parseResult.data.eventId,
      submissionId: parseResult.data.submissionId,
      judgeId: session.userId,
      scores: parseResult.data.scores,
      notes: parseResult.data.notes,
      isDraft: parseResult.data.isDraft,
    });

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected server error occurred.";
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
