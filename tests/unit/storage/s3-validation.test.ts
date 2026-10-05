import { describe, it, expect } from "vitest";
import {
  ALLOWED_MIME_TYPES,
  BANNER_MAX_SIZE_BYTES,
  DEFAULT_MAX_SIZE_BYTES,
  presignedUploadRequestSchema,
  bufferUploadRequestSchema,
  deleteImageRequestSchema,
  replaceImageRequestSchema,
  generateS3Key,
  getS3PublicUrl,
} from "@/lib/s3/validation";
import { env } from "@/env";

describe("S3 Validation & Helpers", () => {
  describe("MIME Whitelist & Constants", () => {
    it("restricts allowed MIME types to jpeg, png, and webp only", () => {
      expect(ALLOWED_MIME_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
    });

    it("has correct default and banner size limits", () => {
      expect(DEFAULT_MAX_SIZE_BYTES).toBe(5 * 1024 * 1024);
      expect(BANNER_MAX_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });
  });

  describe("presignedUploadRequestSchema", () => {
    it("accepts a valid request payload", () => {
      const valid = {
        fileName: "hero-banner.webp",
        contentType: "image/webp",
        folder: "events/banners",
        maxSizeBytes: 2 * 1024 * 1024,
      };

      const result = presignedUploadRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects disallowed MIME types (e.g., SVG, PDF, HTML, GIF)", () => {
      const disallowedTypes = [
        "image/svg+xml",
        "application/pdf",
        "text/html",
        "image/gif",
        "application/octet-stream",
      ];

      for (const contentType of disallowedTypes) {
        const result = presignedUploadRequestSchema.safeParse({
          fileName: "test.file",
          contentType,
          folder: "events/banners",
        });
        expect(result.success).toBe(false);
      }
    });

    it("rejects path traversal attempts in fileName", () => {
      const traversalNames = [
        "../secret.png",
        "..\\windows.png",
        "sub/folder.png",
        "dir\\name.jpg",
      ];

      for (const fileName of traversalNames) {
        const result = presignedUploadRequestSchema.safeParse({
          fileName,
          contentType: "image/png",
          folder: "events/banners",
        });
        expect(result.success).toBe(false);
      }
    });

    it("rejects oversized file payloads exceeding BANNER_MAX_SIZE_BYTES", () => {
      const result = presignedUploadRequestSchema.safeParse({
        fileName: "huge.jpg",
        contentType: "image/jpeg",
        folder: "events/banners",
        maxSizeBytes: 15 * 1024 * 1024, // 15MB
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty fileName and empty folder", () => {
      expect(
        presignedUploadRequestSchema.safeParse({
          fileName: "",
          contentType: "image/jpeg",
          folder: "events/banners",
        }).success,
      ).toBe(false);

      expect(
        presignedUploadRequestSchema.safeParse({
          fileName: "valid.jpg",
          contentType: "image/jpeg",
          folder: "",
        }).success,
      ).toBe(false);
    });
  });

  describe("generateS3Key", () => {
    it("sanitizes spaces, special characters, and uppercase letters", () => {
      const key = generateS3Key("events/banners", "Grand Prix 2026! (FINAL).PNG");

      expect(key).toMatch(
        /^events\/banners\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-grand-prix-2026-final\.png$/,
      );
    });

    it("strips path traversal tokens from filename", () => {
      const key = generateS3Key("contestants/avatars", "../../evil.webp");

      expect(key).toMatch(
        /^contestants\/avatars\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-evil\.webp$/,
      );
      expect(key).not.toContain("..");
    });

    it("normalizes accented and unicode characters", () => {
      const key = generateS3Key("contestants/avatars", "José María Peña.jpg");

      expect(key).toMatch(
        /^contestants\/avatars\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-jose-maria-pena\.jpg$/,
      );
    });

    it("handles leading and trailing slashes in folder prefix", () => {
      const key = generateS3Key("/events/banners/", "image.jpeg");

      expect(key.startsWith("events/banners/")).toBe(true);
      expect(key.startsWith("/")).toBe(false);
    });

    it("generates unique collision-resistant keys for duplicate file names", () => {
      const key1 = generateS3Key("events/banners", "banner.png");
      const key2 = generateS3Key("events/banners", "banner.png");

      expect(key1).not.toEqual(key2);
    });
  });

  describe("getS3PublicUrl", () => {
    it("constructs canonical virtual-hosted S3 URL", () => {
      const key = "events/banners/123-banner.webp";
      const url = getS3PublicUrl(key);

      expect(url).toBe(
        `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/events/banners/123-banner.webp`,
      );
    });

    it("cleans leading slashes from key", () => {
      const key = "/contestants/avatars/456-avatar.png";
      const url = getS3PublicUrl(key);

      expect(url).toBe(
        `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/contestants/avatars/456-avatar.png`,
      );
    });
  });

  describe("bufferUploadRequestSchema", () => {
    it("accepts valid buffer and image MIME type", () => {
      const buffer = Buffer.from("mock image data");
      const result = bufferUploadRequestSchema.safeParse({
        key: "system/generated/qr-123.png",
        contentType: "image/png",
        buffer,
      });

      expect(result.success).toBe(true);
    });

    it("rejects non-buffer payload", () => {
      const result = bufferUploadRequestSchema.safeParse({
        key: "system/generated/qr-123.png",
        contentType: "image/png",
        buffer: "not a buffer",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("deleteImageRequestSchema & replaceImageRequestSchema", () => {
    it("validates delete image key", () => {
      expect(deleteImageRequestSchema.safeParse({ key: "events/123.jpg" }).success).toBe(true);
      expect(deleteImageRequestSchema.safeParse({ key: "" }).success).toBe(false);
      expect(deleteImageRequestSchema.safeParse({ key: "../evil.jpg" }).success).toBe(false);
    });

    it("validates replace image keys", () => {
      expect(
        replaceImageRequestSchema.safeParse({
          oldKey: "events/old.jpg",
          newKey: "events/new.jpg",
        }).success,
      ).toBe(true);

      expect(
        replaceImageRequestSchema.safeParse({
          oldKey: null,
          newKey: "events/new.jpg",
        }).success,
      ).toBe(true);

      expect(
        replaceImageRequestSchema.safeParse({
          oldKey: "events/old.jpg",
          newKey: "",
        }).success,
      ).toBe(false);
    });
  });
});
