import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  MOCK_ADMIN_SESSION,
  MOCK_ORGANIZER_SESSION,
  MOCK_VOTER_1_SESSION,
  MOCK_VOTER_2_SESSION,
  MOCK_JUDGE_SESSION,
  MOCK_STATIC_TOKENS,
  MOCK_USERS,
  getMockSession,
  generateMockSignedToken,
  createMockAuthHeaders,
  createMockAuthCookie,
} from "@/lib/auth/__mocks__/session-fixtures";
import {
  setMockSession,
  resetMockSession,
  getMockSessionState,
  getSession as getSessionMock,
} from "@/lib/auth/__mocks__/get-session";
import { verifyLocalCognitoToken } from "@/features/auth/utils/token-adapter";
import { getSession } from "@/lib/auth/get-session";

// Mock next/headers for real getSession() tests
const mockGetHeader = vi.fn();
const mockGetCookie = vi.fn();

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: mockGetHeader,
  }),
  cookies: async () => ({
    get: mockGetCookie,
  }),
}));

describe("Zero-Auth Mock Session Fixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockSession();
  });

  describe("Session contracts & metadata", () => {
    it("provides compliant mock session objects for all supported roles", () => {
      const sessions = [
        MOCK_ADMIN_SESSION,
        MOCK_ORGANIZER_SESSION,
        MOCK_VOTER_1_SESSION,
        MOCK_VOTER_2_SESSION,
        MOCK_JUDGE_SESSION,
      ];

      for (const session of sessions) {
        expect(session.userId).toBeTruthy();
        expect(session.email).toContain("@electa.ph");
        expect(session.name).toBeTruthy();
        expect(session.role).toBeTruthy();
        expect(session.expiresAt).toBeTruthy();
      }

      expect(MOCK_ADMIN_SESSION.role).toBe("ADMIN");
      expect(MOCK_ORGANIZER_SESSION.role).toBe("ORGANIZER");
      expect(MOCK_VOTER_1_SESSION.role).toBe("VOTER");
      expect(MOCK_VOTER_2_SESSION.role).toBe("VOTER");
      expect(MOCK_JUDGE_SESSION.isJudge).toBe(true);
    });

    it("maps static mock tokens to user sessions in MOCK_USERS", () => {
      expect(MOCK_USERS.admin.staticToken).toBe(MOCK_STATIC_TOKENS.admin);
      expect(MOCK_USERS.organizer.staticToken).toBe(MOCK_STATIC_TOKENS.organizer);
      expect(MOCK_USERS.voter1.staticToken).toBe(MOCK_STATIC_TOKENS.voter1);
      expect(MOCK_USERS.voter2.staticToken).toBe(MOCK_STATIC_TOKENS.voter2);
      expect(MOCK_USERS.judge.staticToken).toBe(MOCK_STATIC_TOKENS.judge);
    });
  });

  describe("getMockSession identifier resolution", () => {
    it("resolves sessions by role name, user ID, or alias", () => {
      expect(getMockSession("admin")?.userId).toBe(MOCK_ADMIN_SESSION.userId);
      expect(getMockSession("ADMIN")?.role).toBe("ADMIN");
      expect(getMockSession("usr_admin_mock_01")?.email).toBe(MOCK_ADMIN_SESSION.email);

      expect(getMockSession("organizer")?.userId).toBe(MOCK_ORGANIZER_SESSION.userId);
      expect(getMockSession("ORGANIZER")?.role).toBe("ORGANIZER");

      expect(getMockSession("voter1")?.userId).toBe(MOCK_VOTER_1_SESSION.userId);
      expect(getMockSession("voter2")?.userId).toBe(MOCK_VOTER_2_SESSION.userId);
      expect(getMockSession("judge")?.userId).toBe(MOCK_JUDGE_SESSION.userId);
    });

    it("returns null for unrecognized session identifiers", () => {
      expect(getMockSession("unknown-role")).toBeNull();
      expect(getMockSession("")).toBeNull();
    });
  });

  describe("Offline JWT token generation & local verification", () => {
    it("generates signed Cognito tokens verifiable without AWS network calls", () => {
      const token = generateMockSignedToken(MOCK_ORGANIZER_SESSION);
      expect(token).toBeTruthy();
      expect(token.split(".")).toHaveLength(3);

      const verified = verifyLocalCognitoToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(MOCK_ORGANIZER_SESSION.userId);
      expect(verified?.email).toBe(MOCK_ORGANIZER_SESSION.email);
      expect(verified?.role).toBe("ORGANIZER");
    });

    it("creates mock auth headers with Bearer tokens", () => {
      const headerObj = createMockAuthHeaders("organizer");
      expect(headerObj.authorization).toMatch(/^Bearer ey/);

      const rawBearer = createMockAuthHeaders("Bearer mock-custom-token");
      expect(rawBearer.authorization).toBe("Bearer mock-custom-token");
    });

    it("creates mock auth cookie with signed token", () => {
      const cookieObj = createMockAuthCookie("admin");
      expect(cookieObj.electa_auth_session).toMatch(/^ey/);
    });
  });

  describe("Vitest __mocks__/get-session manual mock behavior", () => {
    it("defaults to mock organizer session and allows changing state", async () => {
      const defaultSession = await getSessionMock();
      expect(defaultSession?.role).toBe("ORGANIZER");

      setMockSession("admin");
      const adminSession = await getSessionMock();
      expect(adminSession?.role).toBe("ADMIN");

      setMockSession("voter2");
      const voterSession = await getSessionMock();
      expect(voterSession?.role).toBe("VOTER");
      expect(voterSession?.userId).toBe(MOCK_VOTER_2_SESSION.userId);

      setMockSession(null);
      const nullSession = await getSessionMock();
      expect(nullSession).toBeNull();

      resetMockSession();
      expect(getMockSessionState()?.role).toBe("ORGANIZER");
    });
  });

  describe("Real get-session.ts zero-auth resolution", () => {
    it("resolves mock admin token from Authorization header without network latency", async () => {
      mockGetHeader.mockReturnValue("Bearer mock-admin-token");
      mockGetCookie.mockReturnValue(undefined);

      const session = await getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe("usr_admin_mock_01");
      expect(session?.role).toBe("ADMIN");
      expect(session?.email).toBe("admin@electa.ph");
    });

    it("resolves mock voter-1 and voter-2 tokens from Authorization header", async () => {
      mockGetHeader.mockReturnValue("Bearer mock-voter-1-token");
      mockGetCookie.mockReturnValue(undefined);

      const session1 = await getSession();
      expect(session1?.userId).toBe("usr_voter_mock_01");
      expect(session1?.role).toBe("VOTER");

      mockGetHeader.mockReturnValue("Bearer mock-voter-2-token");
      const session2 = await getSession();
      expect(session2?.userId).toBe("usr_voter_mock_02");
      expect(session2?.role).toBe("VOTER");
    });

    it("resolves mock static token from cookie when no Authorization header is present", async () => {
      mockGetHeader.mockReturnValue(null);
      mockGetCookie.mockImplementation((cookieName: string) => {
        if (cookieName === "electa_auth_session") {
          return { value: "mock-admin-token" };
        }
        return undefined;
      });

      const session = await getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe("usr_admin_mock_01");
      expect(session?.role).toBe("ADMIN");
    });

    it("returns null when no mock token or cookie is supplied", async () => {
      mockGetHeader.mockReturnValue(null);
      mockGetCookie.mockReturnValue(undefined);

      const session = await getSession();
      expect(session).toBeNull();
    });
  });
});
