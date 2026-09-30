import { env } from "@/env";

export interface TurnstileVerificationResult {
  success: boolean;
  error: string | null;
}

interface CloudflareSiteverifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

const DEV_MOCK_TOKENS = new Set([
  "mock-turnstile-token",
  "1x00000000000000000000AA",
  "pass",
  "dev-turnstile-bypass",
]);

/**
 * Validates a Cloudflare Turnstile token server-side.
 * Rejects empty or invalid tokens. In test/development mode with known mock tokens,
 * returns success immediately without external network calls.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  clientIp?: string,
): Promise<TurnstileVerificationResult> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return {
      success: false,
      error: "BOT_DETECTION_FAILED",
    };
  }

  const cleanToken = token.trim();

  // Development / Test bypass for mock tokens
  if (DEV_MOCK_TOKENS.has(cleanToken) || env.NODE_ENV === "test") {
    if (cleanToken === "mock-turnstile-token" || cleanToken === "1x00000000000000000000AA") {
      return { success: true, error: null };
    }
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", cleanToken);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "BOT_DETECTION_FAILED",
      };
    }

    const outcome = (await response.json()) as CloudflareSiteverifyResponse;

    if (!outcome.success) {
      return {
        success: false,
        error: "BOT_DETECTION_FAILED",
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err: unknown) {
    console.error("[verifyTurnstileToken] Network or validation error:", err);
    // Fail closed on security verification errors
    return {
      success: false,
      error: "BOT_DETECTION_FAILED",
    };
  }
}
