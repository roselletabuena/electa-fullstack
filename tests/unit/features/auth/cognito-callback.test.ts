import { describe, it, expect } from "vitest";
import { exchangeCognitoCodeForTokens } from "@/features/auth/utils/oauth-client";
import { verifyLocalCognitoToken } from "@/features/auth/utils/token-adapter";
import { cognitoCallbackQuerySchema } from "@/features/auth/types";

describe("Cognito Callback & Code Exchange", () => {
  it("validates incoming callback query parameters", () => {
    const validParams = {
      code: "mock_auth_code_123",
      state: "mock_state_456",
    };

    const parsed = cognitoCallbackQuerySchema.safeParse(validParams);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.code).toBe("mock_auth_code_123");
  });

  it("exchanges code for tokens in local/dev mode and returns a valid ID token", async () => {
    const tokenResponse = await exchangeCognitoCodeForTokens({
      code: "mock_code_test_alice",
    });

    expect(tokenResponse).not.toBeNull();
    expect(tokenResponse?.id_token).toBeDefined();

    const verified = verifyLocalCognitoToken(tokenResponse!.id_token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("alice.organizer@gmail.com");
    expect(verified?.name).toBe("Alice Guo");
    expect(verified?.role).toBe("ORGANIZER");
  });
});
