import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generatePresignedUploadUrl,
  deleteImageFromS3,
  replaceImage,
  uploadImageBuffer,
} from "@/lib/s3/storage-service";
import { s3Client } from "@/lib/s3/client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";

// Mock AWS S3 client and request presigner
vi.mock("@/lib/s3/client", () => ({
  s3Client: {
    send: vi.fn(),
  },
  createS3Client: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("S3 Storage Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePresignedUploadUrl (US1 - MVP)", () => {
    it("generates a 300s presigned PUT upload URL with sanitized key and public URL", async () => {
      const mockPresignedUrl =
        "https://electa-dev-media-assets.s3.ap-southeast-1.amazonaws.com/events/banners/mock-upload-url";
      vi.mocked(getSignedUrl).mockResolvedValueOnce(mockPresignedUrl);

      const result = await generatePresignedUploadUrl({
        fileName: "event-banner (final).png",
        contentType: "image/png",
        folder: "events/banners",
        maxSizeBytes: 3 * 1024 * 1024,
      });

      expect(result.uploadUrl).toBe(mockPresignedUrl);
      expect(result.expiresIn).toBe(300);
      expect(result.contentType).toBe("image/png");
      expect(result.key).toMatch(/^events\/banners\/[0-9a-f-]{36}-event-banner-final\.png$/);
      expect(result.publicUrl).toBe(
        `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${result.key}`,
      );

      expect(getSignedUrl).toHaveBeenCalledWith(
        s3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 300 },
      );
    });

    it("rejects unsupported MIME types with a validation error before calling AWS", async () => {
      await expect(
        generatePresignedUploadUrl({
          fileName: "document.pdf",
          contentType: "application/pdf" as any,
          folder: "events/banners",
        }),
      ).rejects.toThrow();

      expect(getSignedUrl).not.toHaveBeenCalled();
    });

    it("rejects oversized payloads exceeding maxSizeBytes limit", async () => {
      await expect(
        generatePresignedUploadUrl({
          fileName: "huge-image.jpg",
          contentType: "image/jpeg",
          folder: "events/banners",
          maxSizeBytes: 15 * 1024 * 1024, // 15MB exceeds 10MB limit
        }),
      ).rejects.toThrow();

      expect(getSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe("deleteImageFromS3 (US2)", () => {
    it("successfully dispatches DeleteObjectCommand for target key", async () => {
      vi.mocked(s3Client.send).mockResolvedValueOnce({} as any);

      const result = await deleteImageFromS3("events/banners/sample.jpg");

      expect(result).toEqual({
        success: true,
        key: "events/banners/sample.jpg",
      });
      expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it("handles non-existent keys idempotently without throwing unhandled exceptions", async () => {
      const notFoundError = new Error("NoSuchKey");
      (notFoundError as any).name = "NoSuchKey";
      vi.mocked(s3Client.send).mockRejectedValueOnce(notFoundError);

      const result = await deleteImageFromS3("events/banners/missing.jpg");

      expect(result).toEqual({
        success: true,
        key: "events/banners/missing.jpg",
      });
    });

    it("rejects invalid or traversal keys", async () => {
      await expect(deleteImageFromS3("../secret.jpg")).rejects.toThrow();
      expect(s3Client.send).not.toHaveBeenCalled();
    });
  });

  describe("replaceImage (US2)", () => {
    it("deletes oldKey when newKey is provided and different", async () => {
      vi.mocked(s3Client.send).mockResolvedValueOnce({} as any);

      const result = await replaceImage({
        oldKey: "contestants/avatars/old-photo.jpg",
        newKey: "contestants/avatars/new-photo.jpg",
      });

      expect(result).toEqual({
        success: true,
        deletedKey: "contestants/avatars/old-photo.jpg",
        activeKey: "contestants/avatars/new-photo.jpg",
      });
      expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it("does not delete when oldKey is not provided", async () => {
      const result = await replaceImage({
        oldKey: null,
        newKey: "contestants/avatars/first-photo.jpg",
      });

      expect(result).toEqual({
        success: true,
        deletedKey: null,
        activeKey: "contestants/avatars/first-photo.jpg",
      });
      expect(s3Client.send).not.toHaveBeenCalled();
    });

    it("does not delete when oldKey is identical to newKey", async () => {
      const result = await replaceImage({
        oldKey: "contestants/avatars/same-photo.jpg",
        newKey: "contestants/avatars/same-photo.jpg",
      });

      expect(result).toEqual({
        success: true,
        deletedKey: null,
        activeKey: "contestants/avatars/same-photo.jpg",
      });
      expect(s3Client.send).not.toHaveBeenCalled();
    });
  });

  describe("uploadImageBuffer (US3)", () => {
    it("successfully uploads in-memory image buffer directly to S3", async () => {
      vi.mocked(s3Client.send).mockResolvedValueOnce({} as any);

      const buffer = Buffer.from("mock image png buffer bytes");
      const key = "system/generated/qr-stage-1.png";

      const result = await uploadImageBuffer({
        buffer,
        key,
        contentType: "image/png",
      });

      expect(result).toEqual({
        key,
        publicUrl: `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
      });

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it("rejects invalid buffer payloads or unwhitelisted MIME types", async () => {
      await expect(
        uploadImageBuffer({
          buffer: "invalid-string" as any,
          key: "system/generated/test.png",
          contentType: "image/png",
        }),
      ).rejects.toThrow();

      expect(s3Client.send).not.toHaveBeenCalled();
    });
  });
});
