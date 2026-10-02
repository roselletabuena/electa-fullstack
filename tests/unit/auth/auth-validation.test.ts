import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerOrganizerSchema,
  registerUserSchema,
} from "@/features/auth/utils/validation";

describe("auth validation schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@electa.ph",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("accepts demo login without password", () => {
      const result = loginSchema.safeParse({
        email: "demo@electa.ph",
        isDemoLogin: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("email");
      }
    });

    it("rejects short password when not demo login", () => {
      const result = loginSchema.safeParse({
        email: "user@electa.ph",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("password");
      }
    });
  });

  describe("registerUserSchema", () => {
    it("accepts valid registration data with returnTo", () => {
      const result = registerUserSchema.safeParse({
        name: "Maria Santos",
        email: "maria.santos@electa.ph",
        password: "Password123!",
        organizationName: "Miss Visayas Organization",
        returnTo: "/dashboard/events/new",
      });
      expect(result.success).toBe(true);
    });

    it("rejects passwords without an uppercase letter", () => {
      const result = registerOrganizerSchema.safeParse({
        name: "Maria Santos",
        email: "maria.santos@electa.ph",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects passwords without a number", () => {
      const result = registerOrganizerSchema.safeParse({
        name: "Maria Santos",
        email: "maria.santos@electa.ph",
        password: "PasswordOnly",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short names", () => {
      const result = registerOrganizerSchema.safeParse({
        name: "M",
        email: "maria.santos@electa.ph",
        password: "Password123",
      });
      expect(result.success).toBe(false);
    });
  });
});
