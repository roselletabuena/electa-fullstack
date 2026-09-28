import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
const mockSetCookie = vi.fn();
const mockDeleteCookie = vi.fn();
const mockGetCookie = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: mockSetCookie,
    delete: mockDeleteCookie,
    get: mockGetCookie,
  }),
  headers: async () => ({
    get: () => null,
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import { loginAction } from "@/features/auth/actions/login-action";
import { registerOrganizerAction } from "@/features/auth/actions/register-action";

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginAction", () => {
    it("successfully logs in with demo credentials and sets cookie", async () => {
      const result = await loginAction({
        email: "organizer@electa.ph",
        isDemoLogin: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe("usr_organizer_mock_01");
        expect(result.data.role).toBe("ORGANIZER");
        expect(result.redirectTo).toBe("/dashboard");
      }

      expect(mockSetCookie).toHaveBeenCalledWith(
        "electa_auth_session",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          path: "/",
        }),
      );
    });

    it("respects custom returnTo parameter", async () => {
      const result = await loginAction({
        email: "organizer@electa.ph",
        isDemoLogin: true,
        returnTo: "/events/miss-visayas-2026/settings",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.redirectTo).toBe("/events/miss-visayas-2026/settings");
      }
    });

    it("fails when email is invalid", async () => {
      const result = await loginAction({
        email: "invalid-email",
        password: "password123",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
      expect(mockSetCookie).not.toHaveBeenCalled();
    });
  });

  describe("registerOrganizerAction", () => {
    it("successfully registers new organizer with valid data", async () => {
      const result = await registerOrganizerAction({
        name: "Clara Garcia",
        email: "clara.garcia@pageant.ph",
        password: "Password123!",
        organizationName: "Binibining Luzon",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("clara.garcia@pageant.ph");
        expect(result.data.name).toBe("Clara Garcia");
        expect(result.data.role).toBe("ORGANIZER");
        expect(result.redirectTo).toBe("/dashboard");
      }

      expect(mockSetCookie).toHaveBeenCalledWith(
        "electa_auth_session",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });

    it("fails when password is too weak", async () => {
      const result = await registerOrganizerAction({
        name: "Clara Garcia",
        email: "clara.garcia@pageant.ph",
        password: "weak",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
      expect(mockSetCookie).not.toHaveBeenCalled();
    });
  });
});
