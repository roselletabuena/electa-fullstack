import { cookies, headers } from "next/headers";
import { verifyLocalCognitoToken } from "@/features/auth/utils/token-adapter";

export interface UserSession {
  userId: string;
  email: string;
  name?: string | undefined;
  role?: string | undefined;
  isJudge?: boolean | undefined;
  avatarUrl?: string | null | undefined;
  organizationName?: string | null | undefined;
  expiresAt?: string | undefined;
}

function resolveSessionFromAuthHeader(authHeader: string | null): UserSession | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  if (token === "mock-admin-token" || token.includes("admin")) {
    return {
      userId: "usr_admin_mock_01",
      email: "admin@electa.ph",
      name: "Eleanor Vance (Admin)",
      role: "ADMIN",
      organizationName: "Electa Operations HQ",
    };
  }

  if (token === "mock-judge-token" || token.includes("judge")) {
    return {
      userId: "usr_judge_mock_01",
      email: "judge@electa.ph",
      name: "Marcus Aurelius (Judge)",
      role: "JUDGE",
      isJudge: true,
    };
  }

  if (token === "mock-organizer-token" || token.includes("organizer")) {
    return {
      userId: "usr_organizer_mock_01",
      email: "organizer@electa.ph",
      name: "Alex Gonzaga (Organizer)",
      role: "ORGANIZER",
      organizationName: "Electa Pageants Corp",
    };
  }

  if (token === "mock-voter-2-token" || token.includes("voter-2") || token.includes("voter2")) {
    return {
      userId: "usr_voter_mock_02",
      email: "voter2@electa.ph",
      name: "Maria Santos (Voter)",
      role: "VOTER",
    };
  }

  if (token === "mock-voter-token" || token === "mock-voter-1-token" || token.includes("voter")) {
    return {
      userId: "usr_voter_mock_01",
      email: "voter1@electa.ph",
      name: "Juan Dela Cruz (Voter)",
      role: "VOTER",
    };
  }

  const verifiedFromHeader = verifyLocalCognitoToken(token);
  if (verifiedFromHeader) {
    return {
      userId: verifiedFromHeader.userId,
      email: verifiedFromHeader.email,
      name: verifiedFromHeader.name,
      role: verifiedFromHeader.role,
      avatarUrl: verifiedFromHeader.avatarUrl,
      organizationName: verifiedFromHeader.organizationName,
      expiresAt: verifiedFromHeader.expiresAt,
    };
  }

  return null;
}

function resolveSessionFromCookie(authCookie: string): UserSession | null {
  // 1. First try verifying as a Cognito JWT
  const verified = verifyLocalCognitoToken(authCookie);
  if (verified) {
    return {
      userId: verified.userId,
      email: verified.email,
      name: verified.name,
      role: verified.role,
      avatarUrl: verified.avatarUrl ?? null,
      organizationName: verified.organizationName,
      expiresAt: verified.expiresAt,
    };
  }

  // 2. Check if authCookie matches static mock tokens
  const mockFromCookie = resolveSessionFromAuthHeader(`Bearer ${authCookie}`);
  if (mockFromCookie) {
    return mockFromCookie;
  }

  // 2. Fallback to legacy JSON or plain-string session cookie for backward compatibility
  try {
    const decoded = decodeURIComponent(authCookie);
    const parsed = JSON.parse(decoded) as UserSession;
    if (parsed?.userId) {
      return {
        ...parsed,
        avatarUrl: parsed.avatarUrl ?? null,
      };
    }
  } catch {
    if (typeof authCookie === "string" && authCookie.trim().length > 0) {
      const cleaned = authCookie.replace(/^["']|["']$/g, "").trim();
      return {
        userId: cleaned,
        email: "organizer@electa.ph",
        name: "Alex Gonzaga (Organizer)",
        role: "ORGANIZER",
        avatarUrl: null,
      };
    }
  }

  return null;
}

export async function getSession(): Promise<UserSession | null> {
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get("authorization");
  const sessionFromHeader = resolveSessionFromAuthHeader(authHeader);
  if (sessionFromHeader) {
    return sessionFromHeader;
  }

  const cookieStore = await cookies();
  const authCookie =
    cookieStore.get("electa_auth_session")?.value || cookieStore.get("vs_auth_session")?.value;

  if (authCookie) {
    return resolveSessionFromCookie(authCookie);
  }

  return null;
}
