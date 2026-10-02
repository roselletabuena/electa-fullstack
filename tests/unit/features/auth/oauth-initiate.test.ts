import { describe, it, expect } from "vitest";
import { generateOAuthState, buildCognitoAuthorizeUrl } from "@/features/auth/utils/oauth-client";
import { oauthStateSchema } from "@/features/auth/types";

describe("OAuth Initiation & State Generation", () => {
  it("generates a secure random state and nonce matching the schema", () => {
    const { state, nonce, payload } = generateOAuthState("/dashboard");

    expect(state).toBeDefined();
    expect(state.length).toBeGreaterThanOrEqual(16);
    expect(nonce).toBeDefined();
    expect(nonce.length).toBeGreaterThanOrEqual(16);

    const parseResult = oauthStateSchema.safeParse(payload);
    expect(parseResult.success).toBe(true);
    expect(parseResult.data?.returnTo).toBe("/dashboard");
  });

  it("constructs a valid Cognito Hosted UI authorize URL for Google IdP", () => {
    const urlString = buildCognitoAuthorizeUrl({
      state: "mock_state_1234567890123456",
      identityProvider: "Google",
    });

    const url = new URL(urlString);
    expect(url.pathname).toContain("/oauth2/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("identity_provider")).toBe("Google");
    expect(url.searchParams.get("state")).toBe("mock_state_1234567890123456");
    expect(url.searchParams.get("scope")).toBe("email openid profile");
  });

  it("GET /api/auth/cognito/initiate generates state and redirects with returnTo", async () => {
    const { GET } = await import("@/app/api/auth/cognito/initiate/route");
    const { NextRequest } = await import("next/server");

    const req = new NextRequest(
      "http://localhost:3000/api/auth/cognito/initiate?provider=Google&returnTo=%2Fevents%2Fmiss-universe-philippines-2026",
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/oauth2/authorize");
    expect(location).toContain("identity_provider=Google");

    const cookies = res.cookies.getAll();
    const stateCookie = cookies.find((c) => c.name === "electa_oauth_state");
    expect(stateCookie).toBeDefined();
    const parsedPayload = JSON.parse(stateCookie?.value || "{}");
    expect(parsedPayload.returnTo).toBe("/events/miss-universe-philippines-2026");
  });
});
