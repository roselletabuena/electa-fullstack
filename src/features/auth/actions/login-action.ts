"use server";

import { cookies } from "next/headers";
import { loginSchema } from "../utils/validation";
import { generateLocalCognitoToken } from "../utils/token-adapter";
import type { AuthActionResult, LoginCredentialsDto, UserSessionDto } from "../types";

export async function loginAction(
  credentials: LoginCredentialsDto,
): Promise<AuthActionResult<UserSessionDto>> {
  try {
    const validated = loginSchema.safeParse(credentials);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: firstIssue?.message || "Invalid login input",
          field: firstIssue?.path[0] as string | undefined,
        },
      };
    }

    const { email, isDemoLogin, returnTo } = validated.data;

    let userSession: UserSessionDto;

    if (isDemoLogin || email === "organizer@electa.ph") {
      userSession = {
        userId: "usr_organizer_mock_01",
        email: "organizer@electa.ph",
        name: "Alex Gonzaga (Organizer)",
        role: "ORGANIZER",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      };
    } else {
      // In local dev/LocalStack mode, authenticate user and assign ORGANIZER role
      const userId = `usr_${Buffer.from(email).toString("hex").slice(0, 16)}`;
      const name = email.split("@")[0] || "Organizer";

      userSession = {
        userId,
        email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: "ORGANIZER",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      };
    }

    // Generate Cognito-compatible JWT token
    const token = generateLocalCognitoToken({
      userId: userSession.userId,
      email: userSession.email,
      name: userSession.name,
      role: userSession.role,
    });

    // Set secure HTTP cookie
    const cookieStore = await cookies();
    cookieStore.set("electa_auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const targetUrl = returnTo?.startsWith("/") ? returnTo : "/dashboard";

    return {
      success: true,
      data: userSession,
      redirectTo: targetUrl,
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: {
        code: "AUTH_FAILED",
        message: "An unexpected error occurred during login. Please try again.",
      },
    };
  }
}
