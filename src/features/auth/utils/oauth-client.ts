import crypto from "node:crypto";
import type { OAuthStatePayload } from "../types";
import { generateLocalCognitoToken } from "./token-adapter";

export const OAUTH_STATE_COOKIE_NAME = "electa_oauth_state";

export function generateOAuthState(returnTo: string = "/dashboard"): {
  state: string;
  nonce: string;
  payload: OAuthStatePayload;
} {
  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");

  const payload: OAuthStatePayload = {
    state,
    nonce,
    returnTo,
    createdAt: Date.now(),
  };

  return { state, nonce, payload };
}

export function buildCognitoAuthorizeUrl(options?: {
  state?: string;
  identityProvider?: string;
  redirectUri?: string;
  prompt?: string;
}): string {
  const domain =
    process.env.NEXT_PUBLIC_COGNITO_DOMAIN ||
    "https://votesphere-auth-dev.auth.ap-southeast-1.amazoncognito.com";
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "votesphere_local_client_id";
  const defaultCallback = "http://localhost:3000/api/auth/callback/cognito";
  const redirectUri =
    options?.redirectUri || process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/cognito`
      : defaultCallback;

  const url = new URL(`${domain.replace(/\/$/, "")}/oauth2/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "email openid profile");
  url.searchParams.set("prompt", options?.prompt || "select_account");

  if (options?.identityProvider) {
    url.searchParams.set("identity_provider", options.identityProvider);
  }

  if (options?.state) {
    url.searchParams.set("state", options.state);
  }

  return url.toString();
}

export interface CognitoTokenResponse {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeCognitoCodeForTokens(params: {
  code: string;
  redirectUri?: string;
}): Promise<CognitoTokenResponse | null> {
  const authProvider = process.env.AUTH_PROVIDER || "local";

  // In local mode or mock test, generate a deterministic mocked Google-federated Cognito ID token
  if (authProvider === "local" || params.code.startsWith("mock_")) {
    let mockEmail = "google.organizer@electa.ph";
    let mockName = "Google Organizer";

    if (params.code.includes("returning")) {
      mockEmail = "organizer@electa.ph";
      mockName = "Alex Gonzaga (Organizer)";
    } else if (params.code.includes("alice")) {
      mockEmail = "alice.organizer@gmail.com";
      mockName = "Alice Guo";
    }

    const mockSub = `google_${crypto.createHash("sha256").update(mockEmail).digest("hex")}`;

    const idToken = generateLocalCognitoToken({
      userId: mockSub,
      email: mockEmail,
      name: mockName,
      role: "ORGANIZER",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    });

    return {
      id_token: idToken,
      access_token: `access_${idToken}`,
      expires_in: 3600,
      token_type: "Bearer",
    };
  }

  const domain =
    process.env.NEXT_PUBLIC_COGNITO_DOMAIN ||
    "https://votesphere-auth-dev.auth.ap-southeast-1.amazoncognito.com";
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "votesphere_local_client_id";
  const defaultCallback = "http://localhost:3000/api/auth/callback/cognito";
  const redirectUri =
    params.redirectUri || process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/cognito`
      : defaultCallback;

  const tokenUrl = `${domain.replace(/\/$/, "")}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: params.code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Cognito Token Exchange Error]", response.status, errorText);
    return null;
  }

  const data = (await response.json()) as CognitoTokenResponse;
  return data;
}
