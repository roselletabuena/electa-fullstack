"use server";

import { cookies } from "next/headers";
import { registerOrganizerSchema } from "../utils/validation";
import { generateLocalCognitoToken } from "../utils/token-adapter";
import type { AuthActionResult, RegisterOrganizerDto, UserSessionDto } from "../types";

export async function registerUserAction(
  data: RegisterOrganizerDto,
): Promise<AuthActionResult<UserSessionDto>> {
  try {
    const validated = registerOrganizerSchema.safeParse(data);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: firstIssue?.message || "Invalid registration form",
          field: firstIssue?.path[0] as string | undefined,
        },
      };
    }

    const { name, email, organizationName, returnTo } = validated.data;
    const userId = `usr_${Buffer.from(email).toString("hex").slice(0, 14)}`;

    const userSession: UserSessionDto = {
      userId,
      email,
      name,
      role: "ORGANIZER",
      organizationName: organizationName || null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    };

    // Generate Cognito-compatible JWT token
    const token = generateLocalCognitoToken({
      userId: userSession.userId,
      email: userSession.email,
      name: userSession.name,
      role: userSession.role,
      organizationName: userSession.organizationName || undefined,
    });

    // Set secure HTTP session cookie
    const cookieStore = await cookies();
    cookieStore.set("electa_auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const targetUrl = returnTo?.startsWith("/") ? returnTo : "/dashboard";

    return {
      success: true,
      data: userSession,
      redirectTo: targetUrl,
    };
  } catch (error) {
    console.error("Register action error:", error);
    return {
      success: false,
      error: {
        code: "AUTH_FAILED",
        message: "Failed to register account. Please try again.",
      },
    };
  }
}

export const registerOrganizerAction = registerUserAction;
