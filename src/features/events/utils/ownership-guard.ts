import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import type { OwnershipCheckResult } from "@/features/events/types";

export async function requireEventOwnership(slug: string): Promise<OwnershipCheckResult> {
  const session = await getSession();
  if (!session) {
    return { authorized: false, reason: "UNAUTHENTICATED" };
  }

  const event = await db.event.findUnique({
    where: { slug },
  });

  if (!event) {
    return { authorized: false, reason: "NOT_FOUND" };
  }

  if (event.organizerId !== session.userId) {
    return {
      authorized: false,
      reason: "UNAUTHORIZED",
      session,
      eventTitle: event.title,
    };
  }

  return {
    authorized: true,
    event,
    session,
  };
}
