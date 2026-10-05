import { getSession, type UserSession } from "@/lib/auth/get-session";
import { apiError } from "@/lib/api/response";
import type { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/api/response";

export interface AuthGuardResult {
  session: UserSession | null;
  errorResponse: NextResponse<ApiResponse<never>> | null;
}

export interface FolderAccessResult {
  allowed: boolean;
  errorResponse: NextResponse<ApiResponse<never>> | null;
}

/**
 * Ensures the request originates from an authenticated user.
 */
export async function requireMediaAuth(): Promise<AuthGuardResult> {
  const session = await getSession();

  if (!session || !session.userId) {
    return {
      session: null,
      errorResponse: apiError("Unauthorized", 401),
    };
  }

  return {
    session,
    errorResponse: null,
  };
}

/**
 * Ensures the request originates from an authenticated user with ORGANIZER or ADMIN role.
 */
export async function requireMediaAdminOrOrganizer(): Promise<AuthGuardResult> {
  const { session, errorResponse } = await requireMediaAuth();

  if (errorResponse || !session) {
    return { session: null, errorResponse };
  }

  const role = session.role?.toUpperCase();
  if (role !== "ORGANIZER" && role !== "ADMIN") {
    return {
      session: null,
      errorResponse: apiError("Forbidden", 403),
    };
  }

  return {
    session,
    errorResponse: null,
  };
}

/**
 * Enforces folder path namespace permissions based on user role.
 * Standard users and organizers can upload to events/ and contestants/,
 * while system/ paths are reserved for administrators.
 */
export function validateFolderAccess(
  folder: string,
  session: UserSession,
): FolderAccessResult {
  const cleanFolder = folder.replace(/^\/+/, "").toLowerCase();

  if (cleanFolder.startsWith("system/") && session.role?.toUpperCase() !== "ADMIN") {
    return {
      allowed: false,
      errorResponse: apiError(
        "Forbidden: only administrators can upload to system folders",
        403,
      ),
    };
  }

  return {
    allowed: true,
    errorResponse: null,
  };
}
