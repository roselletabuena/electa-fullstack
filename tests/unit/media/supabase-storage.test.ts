import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateBannerFile,
  resolveBannerUrl,
  uploadBannerToSupabase,
  DEFAULT_BANNER_FALLBACK_URL,
  MAX_BANNER_FILE_SIZE,
} from "@/lib/supabase/storage-service";
import * as serverSupabaseModule from "@/lib/supabase/server";
import { POST as handleSupabaseUpload } from "@/app/api/media/supabase-upload/route";
import * as authGuardModule from "@/app/api/media/auth-guard";
import { NextRequest } from "next/server";
import { apiError } from "@/lib/api/response";

describe("Supabase Storage Media Service & Upload Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateBannerFile", () => {
    it("accepts valid JPEG, PNG, and WebP files under 10MB", () => {
      const validJpeg = validateBannerFile({
        size: 5 * 1024 * 1024,
        type: "image/jpeg",
      });
      expect(validJpeg.valid).toBe(true);

      const validPng = validateBannerFile({
        size: 9.9 * 1024 * 1024,
        type: "image/png",
      });
      expect(validPng.valid).toBe(true);

      const validWebp = validateBannerFile({
        size: 1024,
        type: "image/webp",
      });
      expect(validWebp.valid).toBe(true);
    });

    it("rejects files exceeding 10MB with FILE_TOO_LARGE", () => {
      const oversized = validateBannerFile({
        size: MAX_BANNER_FILE_SIZE + 1,
        type: "image/png",
      });
      expect(oversized.valid).toBe(false);
      expect(oversized.code).toBe("FILE_TOO_LARGE");
      expect(oversized.error).toContain("10MB");
    });

    it("rejects empty files (0 bytes) with EMPTY_FILE", () => {
      const empty = validateBannerFile({
        size: 0,
        type: "image/jpeg",
      });
      expect(empty.valid).toBe(false);
      expect(empty.code).toBe("EMPTY_FILE");
    });

    it("rejects non-image or unallowed MIME types with INVALID_MIME_TYPE", () => {
      const pdf = validateBannerFile({
        size: 1024,
        type: "application/pdf",
      });
      expect(pdf.valid).toBe(false);
      expect(pdf.code).toBe("INVALID_MIME_TYPE");

      const executable = validateBannerFile({
        size: 1024,
        type: "application/x-msdownload",
      });
      expect(executable.valid).toBe(false);
      expect(executable.code).toBe("INVALID_MIME_TYPE");
    });
  });

  describe("resolveBannerUrl (Missing Artwork Fallback)", () => {
    it("returns default brand gradient when URL is undefined", () => {
      expect(resolveBannerUrl(undefined)).toBe(DEFAULT_BANNER_FALLBACK_URL);
    });

    it("returns default brand gradient when URL is null", () => {
      expect(resolveBannerUrl(null)).toBe(DEFAULT_BANNER_FALLBACK_URL);
    });

    it("returns default brand gradient when URL is whitespace or empty string", () => {
      expect(resolveBannerUrl("")).toBe(DEFAULT_BANNER_FALLBACK_URL);
      expect(resolveBannerUrl("   ")).toBe(DEFAULT_BANNER_FALLBACK_URL);
    });

    it("returns trimmed custom URL when valid banner is supplied", () => {
      const customUrl = "https://example.supabase.co/storage/v1/object/public/events/banners/test.webp";
      expect(resolveBannerUrl(customUrl)).toBe(customUrl);
      expect(resolveBannerUrl(`  ${customUrl}  `)).toBe(customUrl);
    });
  });

  describe("uploadBannerToSupabase", () => {
    it("uploads valid banner buffer and returns resolved public URL", async () => {
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: "banners/123-banner.webp" }, error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: "https://mock.supabase.co/storage/v1/object/public/events/banners/123-banner.webp" },
      });

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl,
          }),
        },
      };

      vi.spyOn(serverSupabaseModule, "createServerSupabaseClient").mockReturnValue(
        mockSupabase as unknown as ReturnType<typeof serverSupabaseModule.createServerSupabaseClient>
      );

      const buffer = Buffer.from("mock-image-data");
      const result = await uploadBannerToSupabase({
        file: buffer,
        fileName: "competition-banner.webp",
        contentType: "image/webp",
      });

      expect(result.publicUrl).toBe(
        "https://mock.supabase.co/storage/v1/object/public/events/banners/123-banner.webp"
      );
      expect(result.fileName).toBe("competition-banner.webp");
      expect(result.contentType).toBe("image/webp");
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining("banners/"),
        buffer,
        expect.objectContaining({ contentType: "image/webp", upsert: false })
      );
    });

    it("throws error if Supabase storage upload fails", async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Bucket quota exceeded" },
      });

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: vi.fn(),
          }),
        },
      };

      vi.spyOn(serverSupabaseModule, "createServerSupabaseClient").mockReturnValue(
        mockSupabase as unknown as ReturnType<typeof serverSupabaseModule.createServerSupabaseClient>
      );

      const buffer = Buffer.from("mock-image-data");
      await expect(
        uploadBannerToSupabase({
          file: buffer,
          fileName: "test.png",
          contentType: "image/png",
        })
      ).rejects.toThrow("Bucket quota exceeded");
    });
  });

  describe("POST /api/media/supabase-upload Route Handler", () => {
    it("returns 401 when request is unauthenticated", async () => {
      vi.spyOn(authGuardModule, "requireMediaAuth").mockResolvedValue({
        session: null,
        errorResponse: apiError("Unauthorized", 401),
      });

      const req = new NextRequest("http://localhost:3000/api/media/supabase-upload", {
        method: "POST",
      });

      const response = await handleSupabaseUpload(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 400 when no file is uploaded", async () => {
      vi.spyOn(authGuardModule, "requireMediaAuth").mockResolvedValue({
        session: {
          userId: "org-1",
          email: "org@electa.com",
          role: "ORGANIZER",
        },
        errorResponse: null,
      });

      const formData = new FormData();
      formData.append("folder", "banners");

      const req = new NextRequest("http://localhost:3000/api/media/supabase-upload", {
        method: "POST",
      });
      vi.spyOn(req, "formData").mockResolvedValue(formData);

      const response = await handleSupabaseUpload(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("No image file provided");
    });

    it("returns 400 when file size exceeds 10MB limit", async () => {
      vi.spyOn(authGuardModule, "requireMediaAuth").mockResolvedValue({
        session: {
          userId: "org-1",
          email: "org@electa.com",
          role: "ORGANIZER",
        },
        errorResponse: null,
      });

      const file = new File(["x".repeat(11 * 1024 * 1024)], "giant.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);

      const req = new NextRequest("http://localhost:3000/api/media/supabase-upload", {
        method: "POST",
      });
      vi.spyOn(req, "formData").mockResolvedValue(formData);

      const response = await handleSupabaseUpload(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("10MB");
    });

    it("returns 201 with public URL when authenticated organizer uploads valid image", async () => {
      vi.spyOn(authGuardModule, "requireMediaAuth").mockResolvedValue({
        session: {
          userId: "org-1",
          email: "org@electa.com",
          role: "ORGANIZER",
        },
        errorResponse: null,
      });

      const mockUpload = vi.fn().mockResolvedValue({ data: { path: "banners/mock.png" }, error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: "https://mock.supabase.co/storage/v1/object/public/events/banners/mock.png" },
      });

      vi.spyOn(serverSupabaseModule, "createServerSupabaseClient").mockReturnValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl,
          }),
        },
      } as unknown as ReturnType<typeof serverSupabaseModule.createServerSupabaseClient>);

      const file = new File(["valid-binary-content"], "banner.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);

      const req = new NextRequest("http://localhost:3000/api/media/supabase-upload", {
        method: "POST",
      });
      vi.spyOn(req, "formData").mockResolvedValue(formData);

      const response = await handleSupabaseUpload(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.publicUrl).toBe("https://mock.supabase.co/storage/v1/object/public/events/banners/mock.png");
    });
  });

  describe("uploadToSupabaseWithProgress", () => {
    let mockXhr: {
      open: ReturnType<typeof vi.fn>;
      send: ReturnType<typeof vi.fn>;
      abort: ReturnType<typeof vi.fn>;
      status: number;
      responseText: string;
      upload: {
        onprogress: ((event: ProgressEvent) => void) | null;
      };
      onload: (() => void) | null;
      onerror: (() => void) | null;
      onabort: (() => void) | null;
    };

    beforeEach(async () => {
      mockXhr = {
        open: vi.fn(),
        send: vi.fn(),
        abort: vi.fn(),
        status: 201,
        responseText: JSON.stringify({
          success: true,
          data: {
            key: "banners/test.webp",
            publicUrl: "https://mock.supabase.co/events/banners/test.webp",
            fileName: "banner.webp",
            fileSize: 1024,
            contentType: "image/webp",
          },
        }),
        upload: {
          onprogress: null,
        },
        onload: null,
        onerror: null,
        onabort: null,
      };

      function MockXMLHttpRequest(this: unknown) {
        return mockXhr;
      }

      vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("opens POST request to /api/media/supabase-upload and tracks progress", async () => {
      const { uploadToSupabaseWithProgress } = await import(
        "@/features/media/utils/supabase-upload-client"
      );

      const file = new File(["test-content"], "banner.webp", { type: "image/webp" });
      const onProgress = vi.fn();

      const handle = uploadToSupabaseWithProgress({
        file,
        folder: "banners",
        onProgress,
      });

      expect(mockXhr.open).toHaveBeenCalledWith("POST", "/api/media/supabase-upload");
      expect(mockXhr.send).toHaveBeenCalledWith(expect.any(FormData));

      // Simulate upload progress
      if (mockXhr.upload.onprogress) {
        mockXhr.upload.onprogress({
          lengthComputable: true,
          loaded: 512,
          total: 1024,
        } as ProgressEvent);
      }

      expect(onProgress).toHaveBeenCalledWith({
        percentage: 50,
        loadedBytes: 512,
        totalBytes: 1024,
      });

      // Simulate completion
      if (mockXhr.onload) {
        mockXhr.onload();
      }

      const result = await handle.promise;
      expect(result.publicUrl).toBe("https://mock.supabase.co/events/banners/test.webp");
      expect(result.key).toBe("banners/test.webp");
    });

    it("supports aborting the upload", async () => {
      const { uploadToSupabaseWithProgress } = await import(
        "@/features/media/utils/supabase-upload-client"
      );

      const file = new File(["test-content"], "banner.webp", { type: "image/webp" });
      const handle = uploadToSupabaseWithProgress({ file });

      handle.abort();
      expect(mockXhr.abort).toHaveBeenCalled();
    });
  });
});
