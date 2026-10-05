import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/media/delete/route";
import * as authSession from "@/lib/auth/get-session";
import * as storageService from "@/lib/s3/storage-service";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/s3/storage-service", () => ({
  deleteImageFromS3: vi.fn(),
}));

function createDeleteJsonRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/media/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("DELETE /api/media/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 Unauthorized when session is null", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue(null);

    const request = createDeleteJsonRequest({
      key: "events/banners/sample.jpg",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
    expect(storageService.deleteImageFromS3).not.toHaveBeenCalled();
  });

  it("should return 403 Forbidden when user has non-organizer/non-admin role (e.g. VOTER)", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_voter_01",
      email: "voter@example.com",
      role: "VOTER",
    });

    const request = createDeleteJsonRequest({
      key: "events/banners/sample.jpg",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Forbidden");
    expect(storageService.deleteImageFromS3).not.toHaveBeenCalled();
  });

  it("should return 400 Bad Request when request body is malformed JSON", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = new Request("http://localhost:3000/api/media/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: "{ broken-json",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid JSON");
  });

  it("should return 400 Bad Request when key is missing or empty", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = createDeleteJsonRequest({
      key: "   ",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Key must not be empty");
  });

  it("should return 400 Bad Request when key contains path traversal characters", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    const request = createDeleteJsonRequest({
      key: "events/../../secret.txt",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("traversal");
  });

  it("should successfully delete image and return 200 OK for valid ORGANIZER request", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    vi.mocked(storageService.deleteImageFromS3).mockResolvedValue({
      success: true,
      key: "events/banners/uuid-banner.webp",
    });

    const request = createDeleteJsonRequest({
      key: "events/banners/uuid-banner.webp",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      success: true,
      key: "events/banners/uuid-banner.webp",
    });
    expect(storageService.deleteImageFromS3).toHaveBeenCalledWith(
      "events/banners/uuid-banner.webp",
    );
  });

  it("should successfully delete image and return 200 OK for ADMIN request", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_admin_01",
      email: "admin@electa.ph",
      role: "ADMIN",
    });

    vi.mocked(storageService.deleteImageFromS3).mockResolvedValue({
      success: true,
      key: "system/generated/old-logo.png",
    });

    const request = createDeleteJsonRequest({
      key: "system/generated/old-logo.png",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.key).toBe("system/generated/old-logo.png");
  });

  it("should return 500 Internal Server Error when S3 delete operation fails", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      role: "ORGANIZER",
    });

    vi.mocked(storageService.deleteImageFromS3).mockRejectedValue(
      new Error("AWS S3 DeleteObjectCommand failed"),
    );

    const request = createDeleteJsonRequest({
      key: "events/banners/uuid-banner.webp",
    });

    const response = await DELETE(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to delete media asset");
  });
});
