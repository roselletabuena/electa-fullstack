import { type NextRequest, type NextResponse } from "next/server";
import { apiError, apiSuccess, type ApiResponse } from "@/lib/api/response";
import { requireMediaAuth } from "../auth-guard";
import {
  uploadBannerToSupabase,
  validateBannerFile,
} from "@/lib/supabase/storage-service";
import type { UploadedMedia } from "@/features/media/types";

interface FileLike {
  name?: string;
  size?: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

/**
 * POST /api/media/supabase-upload
 *
 * Authenticated endpoint for uploading event banner images directly to the Supabase Storage bucket.
 * Validates session, file presence, size limits (<= 10MB), and image MIME types.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<UploadedMedia>>> {
  // 1. Session Authentication Gate
  const { session, errorResponse: authError } = await requireMediaAuth();
  if (authError || !session) {
    return authError as NextResponse<ApiResponse<UploadedMedia>>;
  }

  // 2. Parse Multipart Form Data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError("Invalid form data payload", 400);
  }

  const rawFile = formData.get("file");
  if (
    !rawFile ||
    typeof rawFile === "string" ||
    typeof (rawFile as Partial<FileLike>).arrayBuffer !== "function"
  ) {
    return apiError("No image file provided in upload request", 400);
  }

  const file = rawFile as unknown as FileLike;
  const folder = (formData.get("folder") as string) || "banners";
  const fileName = (formData.get("fileName") as string) || file.name || "banner.webp";
  const contentType = file.type || "image/webp";

  // Read array buffer to guarantee accurate byteLength
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const actualSize =
    typeof file.size === "number" && file.size > 0
      ? Math.max(file.size, buffer.byteLength)
      : buffer.byteLength;

  // 3. File Validation Gate
  const validation = validateBannerFile({
    size: actualSize,
    type: contentType,
  });

  if (!validation.valid) {
    return apiError(validation.error || "File validation failed", 400);
  }

  // 4. Upload to Supabase Storage
  try {
    const asset = await uploadBannerToSupabase({
      file: buffer,
      fileName,
      contentType,
      folder,
    });

    return apiSuccess(asset, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file to storage";
    console.error("[API /api/media/supabase-upload] Upload error:", message);
    return apiError(message, 500);
  }
}
