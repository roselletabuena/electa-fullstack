"use server";

import { headers } from "next/headers";
import { getSession } from "@/lib/auth/get-session";
import { castBallotSchema } from "@/lib/validations/ballot";
import { castInstitutionalBallot } from "../services/voting-engine";
import type { CastBallotResponse } from "../types/ballot";

/**
 * Server Action to submit an institutional zero-cost multi-office ballot.
 */
export async function castBallotAction(rawInput: unknown): Promise<CastBallotResponse> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "You must be signed in to submit an official ballot.",
        },
      };
    }

    const parseResult = castBallotSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "INVALID_BALLOT_SELECTIONS",
          message:
            parseResult.error.issues[0]?.message ||
            "Invalid ballot submission parameters.",
        },
      };
    }

    const reqHeaders = await headers();
    const clientIp =
      reqHeaders.get("cf-connecting-ip") ||
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";

    return await castInstitutionalBallot({
      ...parseResult.data,
      voterId: session.userId,
      clientIp,
    });
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
