"use server";

import { cookies } from "next/headers";
import type { AuthActionResult, UserSessionDto } from "../types";
import { onboardingFormSchema } from "../utils/validation";
import { getSession } from "@/lib/auth/get-session";
import { generateLocalCognitoToken } from "../utils/token-adapter";

export interface CompleteOnboardingInput {
  organizationName?: string | undefined;
  skip?: boolean | undefined;
}

export async function completeOnboardingAction(
  rawInput: CompleteOnboardingInput,
): Promise<AuthActionResult<UserSessionDto>> {
  const parsed = onboardingFormSchema.safeParse({
    organizationName: rawInput.organizationName || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid organization name.",
      },
    };
  }

  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Your session has expired. Please sign in again.",
      },
    };
  }

  const orgName = rawInput.skip ? null : parsed.data.organizationName || null;

  // Re-issue updated session token with organization name attached
  const updatedToken = generateLocalCognitoToken({
    userId: session.userId,
    email: session.email,
    name: session.name || "Organizer",
    role: (session.role as "ORGANIZER" | "ADMIN" | "VOTER") || "ORGANIZER",
    organizationName: orgName || undefined,
  });

  const cookieStore = await cookies();
  cookieStore.set("electa_auth_session", updatedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
      name: session.name || "Organizer",
      role: (session.role as "ORGANIZER" | "ADMIN" | "VOTER") || "ORGANIZER",
      organizationName: orgName,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    redirectTo: "/dashboard",
  };
}
