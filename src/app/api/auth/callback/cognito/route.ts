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
import { env } from "@/env";

export const dynamic = "force-dynamic";

function handleOAuthError(
  error: string,
  errorDescription: string | undefined,
  baseUrl: string,
): NextResponse {
  const errorCode = error === "access_denied" ? "auth_cancelled" : "auth_failed";
  const redirectUrl = new URL(`/login?error=${errorCode}`, baseUrl);
  if (errorDescription) {
    redirectUrl.searchParams.set("reason", errorDescription);
  }
  return NextResponse.redirect(redirectUrl);
}

function parseAndValidateState(
  stateCookie: string | undefined,
  state: string,
): { valid: boolean; payload: OAuthStatePayload | null } {
  if (!stateCookie) {
    return { valid: true, payload: null };
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(stateCookie));
    const validated = oauthStateSchema.safeParse(decoded);
    if (validated.success) {
      if (validated.data.state !== state) {
        return { valid: false, payload: null };
      }
      return { valid: true, payload: validated.data };
    }
  } catch {
    // In local testing or fallback, ignore JSON parse error
  }

  return { valid: true, payload: null };
}

async function fetchAvatarFromUserInfo(accessToken?: string): Promise<string | undefined> {
  if (!accessToken) {
    return undefined;
  }

  try {
    const domain =
      env.NEXT_PUBLIC_COGNITO_DOMAIN ||
      "https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com";
    const userInfoRes = await fetch(`${domain.replace(/\/$/, "")}/oauth2/userInfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (userInfoRes.ok) {
      const userInfo = (await userInfoRes.json()) as { picture?: string; avatarUrl?: string };
      return userInfo.picture || userInfo.avatarUrl || undefined;
    }
  } catch {
    // Gracefully ignore network errors
  }

  return undefined;
}

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
    return handleOAuthError(error, error_description, request.url);
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  // 2. Validate CSRF State Cookie
  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  const { valid, payload: storedStatePayload } = parseAndValidateState(stateCookie, state);

  if (!valid) {
    console.error("[Cognito Callback Error] State mismatch received:", state);
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  // 3. Exchange authorization code for Cognito tokens
  const tokenResponse = await exchangeCognitoCodeForTokens({ code });
  if (!tokenResponse?.id_token) {
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

  const avatarUrl =
    verifiedUser.avatarUrl || (await fetchAvatarFromUserInfo(tokenResponse.access_token));

  // 5. Generate unified session token
  const sessionToken = generateLocalCognitoToken({
    userId: verifiedUser.userId,
    email: verifiedUser.email,
    name: verifiedUser.name,
    role: "ORGANIZER",
    avatarUrl,
  });

  // 6. Direct user to their intended destination (defaults to /dashboard)
  const destinationPath = storedStatePayload?.returnTo || "/dashboard";
  const response = NextResponse.redirect(new URL(destinationPath, request.url));

  // Set session cookie
  response.cookies.set({
    name: "electa_auth_session",
    value: sessionToken,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Clear OAuth state cookie
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
