"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { createProjectSubmissionSchema } from "@/lib/validations/hackathon-submission";
import { createProjectSubmission } from "../services/submission-service";
import type { SubmitProjectActionResult } from "../types/submission";

/**
 * Server Action for team leads to submit a hackathon project entry.
 */
export async function submitProjectAction(
  eventSlug: string,
  rawInput: unknown
): Promise<SubmitProjectActionResult> {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        error: "You must be signed in to submit a project entry.",
      };
    }

    const parseResult = createProjectSubmissionSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const pathKey = issue.path.join(".");
        if (!fieldErrors[pathKey]) {
          fieldErrors[pathKey] = issue.message;
        }
      }

      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Invalid submission parameters.",
        fieldErrors,
      };
    }

    const result = await createProjectSubmission(
      eventSlug,
      session.userId,
      parseResult.data
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    revalidatePath(`/events/${eventSlug}/projects`);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected server error occurred.";
    return {
      success: false,
      error: message,
    };
  }
}
