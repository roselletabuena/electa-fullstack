import crypto from "crypto";
import type { UserSessionDto, UserRole } from "../types";

const AUTH_SECRET = process.env.AUTH_SECRET || "votesphere_local_jwt_secret_dev_32_bytes_long";
const LOCAL_ISSUER = "https://cognito-idp.ap-southeast-1.amazonaws.com/localstack_pool";

export interface CognitoTokenPayload {
  sub: string;
  email: string;
  name: string;
  "cognito:groups"?: string[];
  "custom:role"?: string;
  token_use: "id" | "access";
  iss: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function generateLocalCognitoToken(params: {
  userId: string;
  email: string;
  name: string;
  role?: UserRole;
  expiresInSeconds?: number;
}): string {
  const {
    userId,
    email,
    name,
    role = "ORGANIZER",
    expiresInSeconds = 60 * 60 * 24 * 7, // 7 days
  } = params;

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: CognitoTokenPayload = {
    sub: userId,
    email,
    name,
    "cognito:groups": [role],
    "custom:role": role,
    token_use: "id",
    iss: LOCAL_ISSUER,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyLocalCognitoToken(token: string): UserSessionDto | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as CognitoTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    const role = (payload["custom:role"] ||
      payload["cognito:groups"]?.[0] ||
      "ORGANIZER") as UserRole;

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0] || "User",
      role,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}
