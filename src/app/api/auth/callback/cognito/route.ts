import { type NextRequest, NextResponse } from "next/server";
import {
  cognitoCallbackQuerySchema,
  oauthStateSchema,
  type OAuthStatePayload,
} from "@/features/auth/types";
import {
  exchangeCognitoCodeForTokens,
  OAUTH_STATE_COOKIE_NAME,
} from "@/features/auth/utils/oauth-client";
import {
  verifyLocalCognitoToken,
  generateLocalCognitoToken,
} from "@/features/auth/utils/token-adapter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawParams = {
    code: url.searchParams.get("code") || undefined,
    state: url.searchParams.get("state") || undefined,
    error: url.searchParams.get("error") || undefined,
    error_description: url.searchParams.get("error_description") || undefined,
  };

  const parsedQuery = cognitoCallbackQuerySchema.safeParse(rawParams);

  if (!parsedQuery.success) {
    return NextResponse.redirect(new URL("/login?error=invalid_request", request.url));
  }

  const { code, state, error, error_description } = parsedQuery.data;

  // 1. Handle OAuth errors (e.g., user clicked Cancel or denied permission)
  if (error) {
    const errorCode = error === "access_denied" ? "auth_cancelled" : "auth_failed";
    const redirectUrl = new URL(`/login?error=${errorCode}`, request.url);
    if (error_description) {
      redirectUrl.searchParams.set("reason", error_description);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  // 2. Validate CSRF State Cookie
  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  let storedStatePayload: OAuthStatePayload | null = null;

  if (stateCookie) {
    try {
      const decoded = JSON.parse(decodeURIComponent(stateCookie));
      const validated = oauthStateSchema.safeParse(decoded);
      if (validated.success) {
        storedStatePayload = validated.data;
      }
    } catch {
      // In local testing or fallback, ignore JSON parse error
    }
  }

  // Validate state matching
  if (storedStatePayload && storedStatePayload.state !== state) {
    console.error("[Cognito Callback Error] State mismatch:", {
      stored: storedStatePayload.state,
      received: state,
    });
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  // 3. Exchange authorization code for Cognito tokens
  const tokenResponse = await exchangeCognitoCodeForTokens({ code });
  if (!tokenResponse || !tokenResponse.id_token) {
    console.error(
      "[Cognito Callback Error] Token exchange failed for code:",
      code.slice(0, 8) + "...",
    );
    return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url));
  }

  // 4. Verify ID Token claims
  const verifiedUser = verifyLocalCognitoToken(tokenResponse.id_token);
  if (!verifiedUser) {
    console.error("[Cognito Callback Error] Token verification failed for id_token");
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }

  // 5. Generate unified session token
  const sessionToken = generateLocalCognitoToken({
    userId: verifiedUser.userId,
    email: verifiedUser.email,
    name: verifiedUser.name,
    role: "ORGANIZER",
    avatarUrl: verifiedUser.avatarUrl || undefined,
  });

  // 6. Direct user to their intended destination (defaults to /dashboard, or /onboarding if explicitly initiated from register)
  const destinationPath = storedStatePayload?.returnTo || "/dashboard";

  const response = NextResponse.redirect(new URL(destinationPath, request.url));

  // Set session cookie
  response.cookies.set({
    name: "electa_auth_session",
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Clear OAuth state cookie
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
