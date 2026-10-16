import type { UserSession } from "@/lib/auth/get-session";
import { generateLocalCognitoToken } from "@/features/auth/utils/token-adapter";
import type { UserRole } from "@/features/auth/types";

export interface MockUserAccount {
  session: UserSession;
  staticToken: string;
  role: UserRole;
  isJudge?: boolean;
}

export const MOCK_ADMIN_SESSION: UserSession = {
  userId: "usr_admin_mock_01",
  email: "admin@electa.ph",
  name: "Eleanor Vance (Admin)",
  role: "ADMIN",
  organizationName: "Electa Operations HQ",
  avatarUrl:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_ORGANIZER_SESSION: UserSession = {
  userId: "usr_organizer_mock_01",
  email: "organizer@electa.ph",
  name: "Alex Gonzaga (Organizer)",
  role: "ORGANIZER",
  organizationName: "Electa Pageants Corp",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_VOTER_1_SESSION: UserSession = {
  userId: "usr_voter_mock_01",
  email: "voter1@electa.ph",
  name: "Juan Dela Cruz (Voter)",
  role: "VOTER",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_VOTER_2_SESSION: UserSession = {
  userId: "usr_voter_mock_02",
  email: "voter2@electa.ph",
  name: "Maria Santos (Voter)",
  role: "VOTER",
  avatarUrl:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_JUDGE_SESSION: UserSession = {
  userId: "usr_judge_mock_01",
  email: "judge@electa.ph",
  name: "Marcus Aurelius (Judge)",
  role: "JUDGE",
  isJudge: true,
  avatarUrl:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_STATIC_TOKENS = {
  admin: "mock-admin-token",
  organizer: "mock-organizer-token",
  voter1: "mock-voter-1-token",
  voter2: "mock-voter-2-token",
  judge: "mock-judge-token",
} as const;

export const MOCK_USERS = {
  admin: {
    session: MOCK_ADMIN_SESSION,
    staticToken: MOCK_STATIC_TOKENS.admin,
    role: "ADMIN" as UserRole,
  },
  organizer: {
    session: MOCK_ORGANIZER_SESSION,
    staticToken: MOCK_STATIC_TOKENS.organizer,
    role: "ORGANIZER" as UserRole,
  },
  voter1: {
    session: MOCK_VOTER_1_SESSION,
    staticToken: MOCK_STATIC_TOKENS.voter1,
    role: "VOTER" as UserRole,
  },
  voter2: {
    session: MOCK_VOTER_2_SESSION,
    staticToken: MOCK_STATIC_TOKENS.voter2,
    role: "VOTER" as UserRole,
  },
  judge: {
    session: MOCK_JUDGE_SESSION,
    staticToken: MOCK_STATIC_TOKENS.judge,
    role: "USER" as UserRole,
    isJudge: true,
  },
} as const;

export function generateMockSignedToken(session: UserSession): string {
  const role: UserRole =
    session.role === "ADMIN" || session.role === "ORGANIZER" || session.role === "VOTER"
      ? session.role
      : "USER";

  return generateLocalCognitoToken({
    userId: session.userId,
    email: session.email,
    name: session.name ?? "Mock User",
    role,
    avatarUrl: session.avatarUrl ?? undefined,
    organizationName: session.organizationName ?? undefined,
    expiresInSeconds: 60 * 60 * 24 * 7,
  });
}

export function getMockSession(roleOrIdentifier: string): UserSession | null {
  const normalized = roleOrIdentifier.trim().toLowerCase();

  if (
    normalized === "admin" ||
    normalized === "usr_admin_mock_01" ||
    normalized.includes("admin")
  ) {
    return { ...MOCK_ADMIN_SESSION };
  }
  if (
    normalized === "organizer" ||
    normalized === "usr_organizer_mock_01" ||
    normalized.includes("organizer")
  ) {
    return { ...MOCK_ORGANIZER_SESSION };
  }
  if (
    normalized === "voter2" ||
    normalized === "voter_2" ||
    normalized === "usr_voter_mock_02" ||
    normalized.includes("voter-2") ||
    normalized.includes("voter2")
  ) {
    return { ...MOCK_VOTER_2_SESSION };
  }
  if (
    normalized === "voter" ||
    normalized === "voter1" ||
    normalized === "voter_1" ||
    normalized === "usr_voter_mock_01" ||
    normalized.includes("voter")
  ) {
    return { ...MOCK_VOTER_1_SESSION };
  }
  if (
    normalized === "judge" ||
    normalized === "usr_judge_mock_01" ||
    normalized.includes("judge")
  ) {
    return { ...MOCK_JUDGE_SESSION };
  }

  return null;
}

export function createMockAuthHeaders(roleOrToken: string): { authorization: string } {
  if (roleOrToken.startsWith("Bearer ")) {
    return { authorization: roleOrToken };
  }

  const session = getMockSession(roleOrToken);
  if (session) {
    const signed = generateMockSignedToken(session);
    return { authorization: `Bearer ${signed}` };
  }

  return { authorization: `Bearer ${roleOrToken}` };
}

export function createMockAuthCookie(roleOrToken: string): { electa_auth_session: string } {
  const session = getMockSession(roleOrToken);
  if (session) {
    const signed = generateMockSignedToken(session);
    return { electa_auth_session: signed };
  }

  return { electa_auth_session: roleOrToken };
}
