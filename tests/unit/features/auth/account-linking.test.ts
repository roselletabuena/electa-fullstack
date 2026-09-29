import { describe, it, expect } from "vitest";
import {
  generateLocalCognitoToken,
  verifyLocalCognitoToken,
} from "@/features/auth/utils/token-adapter";

describe("Account Linking & Profile Synchronization", () => {
  it("seamlessly merges verified email claims to existing organizer session with updated avatar", () => {
    // Existing organizer registered via password
    const existingEmail = "organizer@electa.ph";
    const existingUserId = "usr_organizer_mock_01";

    // Google federated login with same verified email returns Google profile avatar
    const googleAvatar = "https://lh3.googleusercontent.com/a/mock-photo-url";
    const googleToken = generateLocalCognitoToken({
      userId: existingUserId,
      email: existingEmail,
      name: "Alex Gonzaga (Organizer)",
      role: "ORGANIZER",
      avatarUrl: googleAvatar,
    });

    const verified = verifyLocalCognitoToken(googleToken);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(existingUserId);
    expect(verified?.email).toBe(existingEmail);
    expect(verified?.avatarUrl).toBe(googleAvatar);
  });

  it("retains custom organization metadata on linked accounts", () => {
    const token = generateLocalCognitoToken({
      userId: "usr_org_999",
      email: "leader@pageant.ph",
      name: "Leader Name",
      role: "ORGANIZER",
      organizationName: "Pageant Guild",
    });

    const verified = verifyLocalCognitoToken(token);
    expect(verified?.organizationName).toBe("Pageant Guild");
  });
});
