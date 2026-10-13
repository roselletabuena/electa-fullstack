"use server";

import { getSession } from "@/lib/auth/get-session";
import type { UserSessionDto, UserRole } from "../types";

export async function getSessionAction(): Promise<UserSessionDto | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const role: UserRole =
    session.role === "ORGANIZER" || session.role === "VOTER" || session.role === "ADMIN"
      ? session.role
      : "USER";

  return {
    userId: session.userId,
    email: session.email,
    name: session.name || session.email.split("@")[0] || "User",
    role,
    avatarUrl: session.avatarUrl ?? null,
    organizationName: session.organizationName ?? null,
    expiresAt: session.expiresAt || "",
  };
}
