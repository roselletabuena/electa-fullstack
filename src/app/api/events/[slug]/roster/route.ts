import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import {
  ingestRosterCsv,
  updateEventAllowedDomains,
  getEventRosterStatus,
  MalformedRosterCsvError,
} from "@/features/institutions/services/roster-service";
import { updateEventDomainWhitelistSchema } from "@/lib/validations/roster";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const authResult = await requireEventOwnership(slug);

    if (!authResult.authorized) {
      if (authResult.reason === "UNAUTHENTICATED") {
        return apiError("Authentication required", 401);
      }
      if (authResult.reason === "NOT_FOUND") {
        return apiError("Event not found", 404);
      }
      return apiError("You do not have permission to access this roster", 403);
    }

    const status = await getEventRosterStatus(authResult.event.id);
    if (!status) {
      return apiError("Event not found", 404);
    }

    return apiSuccess(status, 200);
  } catch (error) {
    console.error("Failed to fetch event roster status:", error);
    return apiError("Internal server error", 500);
  }
}

async function extractRosterPayload(request: NextRequest): Promise<{
  csvContent: string | null;
  replace: boolean;
  domains?: string[] | undefined;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const replaceParam = formData.get("replace");
    const domainsParam = formData.get("domains");

    const replace = replaceParam !== "false";
    const domains =
      typeof domainsParam === "string" && domainsParam.trim().length > 0
        ? domainsParam.split(",").map((d) => d.trim())
        : undefined;

    let csvContent: string | null = null;
    if (file && typeof file === "object" && "text" in file) {
      csvContent = await (file as File).text();
    } else if (typeof file === "string") {
      csvContent = file;
    }

    return { csvContent, replace, domains };
  }

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      csvContent: typeof body.csvContent === "string" ? body.csvContent : null,
      replace: body.replace !== false,
      domains: Array.isArray(body.domains) ? (body.domains as string[]) : undefined,
    };
  }

  const text = await request.text().catch(() => null);
  return {
    csvContent: text && text.trim().length > 0 ? text : null,
    replace: true,
  };
}

async function processDomainUpdate(
  eventId: string,
  domains?: string[]
): Promise<string[] | null> {
  if (!domains) return null;

  const parsed = updateEventDomainWhitelistSchema.safeParse({ domains });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid domain whitelist configuration";
    throw new Error(msg);
  }

  return updateEventAllowedDomains({
    eventId,
    domains: parsed.data.domains,
  });
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const authResult = await requireEventOwnership(slug);

    if (!authResult.authorized) {
      if (authResult.reason === "UNAUTHENTICATED") {
        return apiError("Authentication required", 401);
      }
      if (authResult.reason === "NOT_FOUND") {
        return apiError("Event not found", 404);
      }
      return apiError("You do not have permission to manage this roster", 403);
    }

    const { csvContent, replace, domains } = await extractRosterPayload(request);
    const updatedDomains = await processDomainUpdate(authResult.event.id, domains);

    let rosterSummary = null;
    if (csvContent) {
      rosterSummary = await ingestRosterCsv({
        eventId: authResult.event.id,
        csvContent,
        replace,
      });
    }

    if (!rosterSummary && !updatedDomains) {
      return apiError("No roster CSV file or domain configuration provided", 400);
    }

    return apiSuccess(
      {
        eventId: authResult.event.id,
        rosterSummary,
        allowedEmailDomains: updatedDomains ?? authResult.event.allowedEmailDomains,
      },
      200
    );
  } catch (error) {
    if (error instanceof MalformedRosterCsvError) {
      return apiError(error.message, 422);
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.includes("Invalid domain")) {
      return apiError(message, 400);
    }

    console.error("Failed to process roster upload:", error);
    return apiError(message, 500);
  }
}

