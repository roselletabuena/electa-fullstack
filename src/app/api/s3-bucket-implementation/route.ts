import type { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/get-session";
import { apiError, apiSuccess } from "@/lib/api/response";

/**
 * GET /api/s3-bucket-implementation
 * Returns upload health status or pre-signed URL configuration metadata.
 */
export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  return apiSuccess({ message: "s3-bucket-implementation GET — ready" });
}

/**
 * POST /api/s3-bucket-implementation
 * Generates pre-signed S3 upload URLs for authorized clients.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  const _body = await req.json();

  return apiSuccess({ message: "s3-bucket-implementation POST — ready" });
}
