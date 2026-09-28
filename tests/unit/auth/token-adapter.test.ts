import { describe, it, expect } from "vitest";
import {
  generateLocalCognitoToken,
  verifyLocalCognitoToken,
} from "@/features/auth/utils/token-adapter";

describe("token-adapter (Cognito JWT emulation)", () => {
  it("generates and successfully verifies a valid organizer token", () => {
    const token = generateLocalCognitoToken({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      name: "Alex Gonzaga",
      role: "ORGANIZER",
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const session = verifyLocalCognitoToken(token);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("usr_org_01");
    expect(session?.email).toBe("organizer@electa.ph");
    expect(session?.name).toBe("Alex Gonzaga");
    expect(session?.role).toBe("ORGANIZER");
  });

  it("rejects tampered tokens", () => {
    const token = generateLocalCognitoToken({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      name: "Alex Gonzaga",
    });

    const parts = token.split(".");
    // Tamper with payload
    const tamperedToken = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;

    const session = verifyLocalCognitoToken(tamperedToken);
    expect(session).toBeNull();
  });

  it("rejects expired tokens", () => {
    const expiredToken = generateLocalCognitoToken({
      userId: "usr_org_01",
      email: "organizer@electa.ph",
      name: "Alex Gonzaga",
      expiresInSeconds: -60, // Expired 1 minute ago
    });

    const session = verifyLocalCognitoToken(expiredToken);
    expect(session).toBeNull();
  });
});
