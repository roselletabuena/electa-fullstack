import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import {
  deleteImageRequestSchema,
  type DeleteImageResponse,
} from "@/lib/s3/validation";
import { deleteImageFromS3 } from "@/lib/s3/storage-service";
import { requireMediaAdminOrOrganizer } from "../auth-guard";

/**
 * DELETE /api/media/delete
 *
 * Authenticated endpoint to delete an image asset from S3.
 * Requires ORGANIZER or ADMIN role and a validated object key.
 */
export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<DeleteImageResponse>>> {
  // 1. Organizer / Admin Authorization Gate
  const { session, errorResponse: authError } = await requireMediaAdminOrOrganizer();
  if (authError || !session) {
    return authError as NextResponse<ApiResponse<DeleteImageResponse>>;
  }

  // 2. Parse Request JSON
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return apiError("Invalid JSON payload in request body", 400);
  }

  // 3. Validate Payload against Zod Schema
  const parseResult = deleteImageRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((i) => i.message).join("; ");
    return apiError(errorDetails, 400);
  }

  const { key } = parseResult.data;

  // 4. Perform S3 Object Deletion
  try {
    const deleteResult = await deleteImageFromS3(key);
    return apiSuccess(deleteResult, 200);
  } catch (error) {
    console.error("[API /api/media/delete] Failed to delete S3 asset:", error);
    return apiError("Failed to delete media asset", 500);
  }
}
