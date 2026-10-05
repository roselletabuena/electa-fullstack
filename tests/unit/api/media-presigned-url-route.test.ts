import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/media/presigned-url/route";
import * as authSession from "@/lib/auth/get-session";
import * as storageService from "@/lib/s3/storage-service";
import type { PresignedUploadResponse } from "@/lib/s3/validation";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/s3/storage-service", () => ({
  generatePresignedUploadUrl: vi.fn(),
}));

function createJsonRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/media/presigned-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/media/presigned-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 Unauthorized when user session is null", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue(null);

    const request = createJsonRequest({
      fileName: "profile.png",
      contentType: "image/png",
      folder: "contestants/avatars",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
    expect(storageService.generatePresignedUploadUrl).not.toHaveBeenCalled();
  });

  it("should return 400 Bad Request when request body is malformed JSON", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = new Request("http://localhost:3000/api/media/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid-json",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid JSON");
  });

  it("should return 400 Bad Request when MIME type is not allowed (e.g. application/pdf)", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = createJsonRequest({
      fileName: "document.pdf",
      contentType: "application/pdf",
      folder: "events/banners",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid file type");
  });

  it("should return 400 Bad Request when declared file size exceeds 10MB limit", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = createJsonRequest({
      fileName: "giant-banner.jpg",
      contentType: "image/jpeg",
      folder: "events/banners",
      maxSizeBytes: 15 * 1024 * 1024, // 15MB
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("File size exceeds maximum allowed");
  });

  it("should return 400 Bad Request when fileName or folder contains path traversal", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = createJsonRequest({
      fileName: "../../etc/passwd",
      contentType: "image/jpeg",
      folder: "events/banners",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("path traversal");
  });

  it("should return 403 Forbidden when standard organizer attempts to upload to system/ folder", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = createJsonRequest({
      fileName: "system-logo.png",
      contentType: "image/png",
      folder: "system/generated",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain("only administrators");
    expect(storageService.generatePresignedUploadUrl).not.toHaveBeenCalled();
  });

  it("should successfully generate presigned URL and return 200 OK for valid request", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const mockResponse: PresignedUploadResponse = {
      uploadUrl: "https://bucket.s3.ap-southeast-1.amazonaws.com/events/banners/uuid-banner.jpg",
      key: "events/banners/uuid-banner.jpg",
      publicUrl: "https://bucket.s3.ap-southeast-1.amazonaws.com/events/banners/uuid-banner.jpg",
      expiresIn: 300,
      contentType: "image/jpeg",
    };

    vi.mocked(storageService.generatePresignedUploadUrl).mockResolvedValue(mockResponse);

    const request = createJsonRequest({
      fileName: "banner.jpg",
      contentType: "image/jpeg",
      folder: "events/banners",
      maxSizeBytes: 5 * 1024 * 1024,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResponse);
    expect(data.timestamp).toBeDefined();
    expect(storageService.generatePresignedUploadUrl).toHaveBeenCalledWith({
      fileName: "banner.jpg",
      contentType: "image/jpeg",
      folder: "events/banners",
      maxSizeBytes: 5 * 1024 * 1024,
    });
  });

  it("should allow ADMIN to upload to system/ folder", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_admin",
      email: "admin@electa.ph",
      role: "ADMIN",
    });

    const mockResponse: PresignedUploadResponse = {
      uploadUrl: "https://bucket.s3.ap-southeast-1.amazonaws.com/system/generated/uuid-logo.png",
      key: "system/generated/uuid-logo.png",
      publicUrl: "https://bucket.s3.ap-southeast-1.amazonaws.com/system/generated/uuid-logo.png",
      expiresIn: 300,
      contentType: "image/png",
    };

    vi.mocked(storageService.generatePresignedUploadUrl).mockResolvedValue(mockResponse);

    const request = createJsonRequest({
      fileName: "logo.png",
      contentType: "image/png",
      folder: "system/generated",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.key).toContain("system/generated");
  });

  it("should return 500 Internal Server Error if S3 generation throws unexpected error", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_123",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    vi.mocked(storageService.generatePresignedUploadUrl).mockRejectedValue(
      new Error("AWS S3 service unavailable"),
    );

    const request = createJsonRequest({
      fileName: "banner.jpg",
      contentType: "image/jpeg",
      folder: "events/banners",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to generate upload URL");
  });
});
