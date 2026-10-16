import { vi } from "vitest";
import type { UserSession } from "../get-session";
import { MOCK_ORGANIZER_SESSION, getMockSession } from "./session-fixtures";

export * from "./session-fixtures";
export type { UserSession };

let mockSessionState: UserSession | null = { ...MOCK_ORGANIZER_SESSION };

export function setMockSession(sessionOrRole: string | UserSession | null): void {
  if (sessionOrRole === null) {
    mockSessionState = null;
    return;
  }

  if (typeof sessionOrRole === "string") {
    mockSessionState = getMockSession(sessionOrRole);
    return;
  }

  mockSessionState = { ...sessionOrRole };
}

export function resetMockSession(): void {
  mockSessionState = { ...MOCK_ORGANIZER_SESSION };
}

export function getMockSessionState(): UserSession | null {
  return mockSessionState ? { ...mockSessionState } : null;
}

export const getSession = vi.fn(async (): Promise<UserSession | null> => {
  return mockSessionState ? { ...mockSessionState } : null;
});
