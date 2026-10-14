"use server";

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/get-session";
import {
  CastPeoplesChoiceVoteSchema,
  type CastPeoplesChoiceVoteResponse,
} from "../types/peoples-choice";
import { castPeoplesChoiceVote } from "../services/peoples-choice-service";

const ATTENDEE_COOKIE_NAME = "electa_attendee_id";

/**
 * Server Action for casting a 1-tap People's Choice vote for an exhibition project.
 * Supports authenticated users and anonymous Demo Day attendees via secure persistent cookie.
 */
export async function castPeoplesChoiceVoteAction(
  rawInput: unknown
): Promise<CastPeoplesChoiceVoteResponse> {
  // 1. Zod input validation
  const parseResult = CastPeoplesChoiceVoteSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const errorMsg =
      parseResult.error?.issues?.[0]?.message ??
      parseResult.error?.message ??
      "Invalid vote submission input.";
    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: errorMsg,
      },
    };
  }

  const { eventId, submissionId } = parseResult.data;

  // 2. Resolve voter identity
  let voterId: string | null = null;
  const session = await getSession();

  if (session?.userId) {
    voterId = session.userId;
  } else {
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(ATTENDEE_COOKIE_NAME)?.value;

    if (existingCookie && existingCookie.trim().length > 0) {
      voterId = existingCookie;
    } else {
      voterId = `att_${crypto.randomUUID()}`;
      cookieStore.set(ATTENDEE_COOKIE_NAME, voterId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  // 3. Delegate to domain service
  return await castPeoplesChoiceVote({
    eventIdOrSlug: eventId,
    submissionId,
    voterId,
  });
}
