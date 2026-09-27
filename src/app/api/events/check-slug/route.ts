import type { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { RESERVED_SLUGS, slugRegex } from "@/lib/validations/event";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import type { CheckSlugResult } from "@/features/events/types";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<CheckSlugResult>>> {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get("slug");

    if (!rawSlug || typeof rawSlug !== "string" || !rawSlug.trim()) {
      return apiError("A 'slug' query parameter is required", 400);
    }

    const normalizedSlug = rawSlug.trim().toLowerCase();

    // Check basic length and regex
    if (
      normalizedSlug.length < 3 ||
      normalizedSlug.length > 60 ||
      !slugRegex.test(normalizedSlug)
    ) {
      return apiError(
        "Slug must be 3-60 characters and contain only lowercase letters, numbers, and single hyphens",
        400,
      );
    }

    // Check reserved keywords
    if (RESERVED_SLUGS.includes(normalizedSlug as (typeof RESERVED_SLUGS)[number])) {
      return apiSuccess<CheckSlugResult>({
        available: false,
        slug: normalizedSlug,
        reason: "RESERVED",
      });
    }

    // Check database uniqueness
    const existing = await db.event.findFirst({
      where: {
        slug: {
          equals: normalizedSlug,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existing) {
      return apiSuccess<CheckSlugResult>({
        available: false,
        slug: normalizedSlug,
        reason: "TAKEN",
      });
    }

    return apiSuccess<CheckSlugResult>({
      available: true,
      slug: normalizedSlug,
    });
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return apiError("Internal server error while checking slug availability", 500);
  }
}
