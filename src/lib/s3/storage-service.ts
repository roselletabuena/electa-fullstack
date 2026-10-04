import {
  PutObjectCommand,
  DeleteObjectCommand,
  type S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./client";
import {
  PRESIGNED_URL_EXPIRATION_SECONDS,
  presignedUploadRequestSchema,
  bufferUploadRequestSchema,
  deleteImageRequestSchema,
  replaceImageRequestSchema,
  generateS3Key,
  getS3PublicUrl,
  type PresignedUploadRequest,
  type PresignedUploadResponse,
  type BufferUploadRequest,
  type BufferUploadResponse,
  type DeleteImageResponse,
  type ReplaceImageResponse,
  type ReplaceImageRequest,
} from "./validation";
import { env } from "@/env";

/**
 * Generates a short-lived (300s) presigned PUT URL allowing clients to upload
 * an image directly to Amazon S3 with strict MIME and size enforcement.
 */
export async function generatePresignedUploadUrl(
  input: PresignedUploadRequest,
): Promise<PresignedUploadResponse> {
  const validated = presignedUploadRequestSchema.parse(input);
  const key = generateS3Key(validated.folder, validated.fileName);

  const command = new PutObjectCommand({
    Bucket: env.S3_MEDIA_BUCKET,
    Key: key,
    ContentType: validated.contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRATION_SECONDS,
  });

  return {
    uploadUrl,
    key,
    publicUrl: getS3PublicUrl(key),
    expiresIn: PRESIGNED_URL_EXPIRATION_SECONDS,
    contentType: validated.contentType,
  };
}

/**
 * Idempotently deletes an object from the S3 media bucket.
 * Does not throw if the targeted object key does not exist.
 */
export async function deleteImageFromS3(key: string): Promise<DeleteImageResponse> {
  const validated = deleteImageRequestSchema.parse({ key });
  const cleanKey = validated.key.replace(/^\/+/, "");

  try {
    const command = new DeleteObjectCommand({
      Bucket: env.S3_MEDIA_BUCKET,
      Key: cleanKey,
    });

    await s3Client.send(command);
  } catch (err: unknown) {
    const s3Error = err as S3ServiceException;
    // S3 DeleteObject is inherently idempotent; suppress NoSuchKey / 404
    if (s3Error.name !== "NoSuchKey" && s3Error.$metadata?.httpStatusCode !== 404) {
      throw err;
    }
  }

  return {
    success: true,
    key: validated.key,
  };
}

/**
 * Safely replaces an existing S3 image with a newly uploaded one, purging
 * the old key from S3 if present and different from the new key.
 */
export async function replaceImage(
  input: ReplaceImageRequest,
): Promise<ReplaceImageResponse> {
  const validated = replaceImageRequestSchema.parse(input);

  if (validated.oldKey && validated.oldKey !== validated.newKey) {
    await deleteImageFromS3(validated.oldKey);
    return {
      success: true,
      deletedKey: validated.oldKey,
      activeKey: validated.newKey,
    };
  }

  return {
    success: true,
    deletedKey: null,
    activeKey: validated.newKey,
  };
}

/**
 * Directly uploads an in-memory image Buffer to S3 from server context
 * (used for system-generated QR codes and social story cards).
 */
export async function uploadImageBuffer(
  input: BufferUploadRequest,
): Promise<BufferUploadResponse> {
  const validated = bufferUploadRequestSchema.parse(input);
  const cleanKey = validated.key.replace(/^\/+/, "");

  const command = new PutObjectCommand({
    Bucket: env.S3_MEDIA_BUCKET,
    Key: cleanKey,
    Body: validated.buffer,
    ContentType: validated.contentType,
  });

  await s3Client.send(command);

  return {
    key: cleanKey,
    publicUrl: getS3PublicUrl(cleanKey),
  };
}
