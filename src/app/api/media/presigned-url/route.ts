import type { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import {
  presignedUploadRequestSchema,
  type PresignedUploadResponse,
} from "@/lib/s3/validation";
import { generatePresignedUploadUrl } from "@/lib/s3/storage-service";
import { requireMediaAuth, validateFolderAccess } from "../auth-guard";

/**
 * POST /api/media/presigned-url
 *
 * Authenticated endpoint to generate short-lived (300s) presigned S3 PUT upload URLs.
 * Validates session, MIME type, folder namespace, and file size constraints.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PresignedUploadResponse>>> {
  // 1. Session Authentication Gate
  const { session, errorResponse: authError } = await requireMediaAuth();
  if (authError || !session) {
    return authError as NextResponse<ApiResponse<PresignedUploadResponse>>;
  }

  // 2. Parse Request JSON
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return apiError("Invalid JSON payload in request body", 400);
  }

  // 3. Validate Payload against Zod Schema
  const parseResult = presignedUploadRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((i) => i.message).join("; ");
    return apiError(errorDetails, 400);
  }

  const { fileName, contentType, folder, maxSizeBytes } = parseResult.data;

  // 4. Folder Namespace & Authorization Gate (US3)
  const folderCheck = validateFolderAccess(folder, session);
  if (!folderCheck.allowed && folderCheck.errorResponse) {
    return folderCheck.errorResponse as NextResponse<
      ApiResponse<PresignedUploadResponse>
    >;
  }

  // 5. Generate Presigned S3 PUT URL
  try {
    const presignedDescriptor = await generatePresignedUploadUrl({
      fileName,
      contentType,
      folder,
      ...(maxSizeBytes !== undefined ? { maxSizeBytes } : {}),
    });

    return apiSuccess(presignedDescriptor, 200);
  } catch (error) {
    console.error("[API /api/media/presigned-url] Failed to generate upload URL:", error);
    return apiError("Failed to generate upload URL", 500);
  }
}
