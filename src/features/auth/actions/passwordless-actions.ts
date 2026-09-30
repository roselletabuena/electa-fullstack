"use server";

import { cookies } from "next/headers";
import { env } from "@/env";
import { requestPasswordlessOtp, verifyPasswordlessOtp } from "../utils/passwordless-auth";
import type { UserSessionDto } from "../types";

export interface PasswordlessRequestResult {
  success: boolean;
  message: string;
  challengeId?: string;
  error?: string;
}

export interface PasswordlessVerifyResult {
  success: boolean;
  user?: UserSessionDto;
  error?: string;
}

export async function requestPasswordlessOtpAction(
  channel: "email" | "sms" | "whatsapp",
  destination: string,
): Promise<PasswordlessRequestResult> {
  try {
    if (!destination || destination.trim().length === 0) {
      return {
        success: false,
        message: "",
        error: "Please enter a valid email or phone number.",
      };
    }

    const outcome = await requestPasswordlessOtp({ channel, destination });
    return outcome;
  } catch (err: unknown) {
    console.error("[requestPasswordlessOtpAction] Error:", err);
    return {
      success: false,
      message: "",
      error: "Unable to send verification code. Please try again.",
    };
  }
}

export async function verifyPasswordlessOtpAction(
  destination: string,
  code: string,
): Promise<PasswordlessVerifyResult> {
  try {
    if (!destination || !code) {
      return {
        success: false,
        error: "Destination and verification code are required.",
      };
    }

    const outcome = await verifyPasswordlessOtp({ destination, code });

    if (!outcome.success || !outcome.sessionToken || !outcome.user) {
      return {
        success: false,
        error: outcome.error || "Verification failed.",
      };
    }

    // Set authenticated session cookie
    const cookieStore = await cookies();
    cookieStore.set("electa_auth_session", outcome.sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: outcome.user,
    };
  } catch (err: unknown) {
    console.error("[verifyPasswordlessOtpAction] Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred during verification.",
    };
  }
}
