import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { getMockEventBySlug } from "@/features/events/utils/mock-data";
import { computePassphraseDigest, signPreviewToken } from "@/features/events/utils/preview-token";
import { verifyPassphrase } from "@/features/events/utils/passphrase";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { previewAuthSchema } from "@/lib/validations/event";
import type { PreviewAuthResponse } from "@/features/events/types";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

import { env } from "@/env";

const MOCK_PREVIEW_SECRET = "judge-preview-2026";

interface PassphraseVerificationResult {
  errorResponse?: NextResponse<ApiResponse<PreviewAuthResponse>>;
  activeDigest?: string | null;
}

async function verifyDraftPassphrase(slug: string, passphrase: string): Promise<PassphraseVerificationResult> {
  let isDbDraft = false;
  let draftHash: string | null = null;

  try {
    const dbEvent = await db.event.findUnique({
      where: { slug },
    });

    if (dbEvent) {
      if (dbEvent.publicationStatus !== "DRAFT") {
        return { errorResponse: apiError("Event is already published", 400) };
      }
      isDbDraft = true;
      draftHash = dbEvent.draftPassphraseHash;
    }
  } catch {
    // Database query optional in mock test runs
  }

  if (!isDbDraft) {
    const event = getMockEventBySlug(slug);
    if (!event) {
      return { errorResponse: apiError("Event not found", 404) };
    }
    if (event.operationalState !== "Draft") {
      return { errorResponse: apiError("Event is already published", 400) };
    }
    if (passphrase !== MOCK_PREVIEW_SECRET) {
      return { errorResponse: apiError("Invalid draft preview passphrase", 401) };
    }
    return { activeDigest: computePassphraseDigest(MOCK_PREVIEW_SECRET) };
  }

  if (!draftHash) {
    return {
      errorResponse: apiError(
        "This draft event does not have a public preview passphrase configured.",
        403,
      ),
    };
  }

  const isValid = verifyPassphrase(passphrase, draftHash);
  if (!isValid) {
    return { errorResponse: apiError("Invalid draft preview passphrase", 401) };
  }

  return { activeDigest: computePassphraseDigest(draftHash) };
}

export async function POST(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<ApiResponse<PreviewAuthResponse>>> {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return apiError("Event slug parameter is required", 400);
    }

    const body = (await request.json()) as { passphrase?: unknown };
    const validation = previewAuthSchema.safeParse(body);

    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Invalid request payload", 400);
    }

    const { passphrase } = validation.data;
    const { errorResponse, activeDigest } = await verifyDraftPassphrase(slug, passphrase);

    if (errorResponse || !activeDigest) {
      return errorResponse ?? apiError("Unauthorized", 401);
    }

    const { token, expiresAt } = signPreviewToken(slug, activeDigest);

    const cookieStore = await cookies();
    cookieStore.set(`vs_preview_${slug}`, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: `/`,
    });

    return apiSuccess({
      previewToken: token,
      expiresAt,
    });
  } catch (error) {
    console.error("Preview auth error:", error);
    return apiError("Internal server error during preview authentication", 500);
  }
}
