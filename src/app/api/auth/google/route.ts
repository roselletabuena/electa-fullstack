import { type NextRequest, NextResponse } from "next/server";
import {
  generateOAuthState,
  buildCognitoAuthorizeUrl,
  OAUTH_STATE_COOKIE_NAME,
} from "@/features/auth/utils/oauth-client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const { state, payload } = generateOAuthState(returnTo);

  const authorizeUrl = buildCognitoAuthorizeUrl({
    state,
    identityProvider: "Google",
  });

  const response = NextResponse.redirect(authorizeUrl);

  // Set short-lived HTTP-only state cookie (10 minutes)
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: JSON.stringify(payload),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
