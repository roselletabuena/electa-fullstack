import { describe, it, expect } from "vitest";
import { cognitoCallbackQuerySchema } from "@/features/auth/types";

describe("Cognito Callback Error Handling & Cancellation", () => {
  it("correctly identifies access_denied / user cancellation in callback schema", () => {
    const cancelPayload = {
      error: "access_denied",
      error_description: "User cancelled the Google sign-in dialog",
    };

    const parsed = cognitoCallbackQuerySchema.safeParse(cancelPayload);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.error).toBe("access_denied");
    expect(parsed.data?.error_description).toContain("cancelled");
  });

  it("handles missing state or code securely", () => {
    const invalidPayload = {
      code: undefined,
      state: undefined,
    };

    const parsed = cognitoCallbackQuerySchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.code).toBeUndefined();
  });
});
