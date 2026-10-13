import React from "react";
import { SiteShell } from "@/features/navigation";
import { getSession } from "@/lib/auth/get-session";
import type { UserSessionDto } from "@/features/auth/types";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const userDto: UserSessionDto | null = session
    ? {
        userId: session.userId,
        email: session.email,
        name: session.name || session.email.split("@")[0] || "User",
        role:
          session.role === "ORGANIZER" || session.role === "VOTER" || session.role === "ADMIN"
            ? session.role
            : "USER",
        avatarUrl: session.avatarUrl ?? null,
        organizationName: session.organizationName ?? null,
        expiresAt: session.expiresAt || "",
      }
    : null;

  return <SiteShell user={userDto}>{children}</SiteShell>;
}
