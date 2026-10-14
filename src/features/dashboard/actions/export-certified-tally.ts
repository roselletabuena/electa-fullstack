"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import {
  ExportCertifiedTallyInputSchema,
  type CertifiedElectionAuditDto,
} from "../types/turnout-audit";
import {
  computeTurnoutMetrics,
  computeOfficeTallies,
  generateAuditHash,
  formatAuditCsv,
} from "../utils/turnout-calculator";

export interface ExportCertifiedTallyResult {
  success: boolean;
  data: {
    filename: string;
    content: string;
    format: "csv" | "json";
    auditHash: string;
    certifiedAt: string;
  } | null;
  error?: {
    code: string;
    message: string;
  };
}

export async function exportCertifiedTally(rawInput: unknown): Promise<ExportCertifiedTallyResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to certify and export official results.",
        },
      };
    }

    const parsed = ExportCertifiedTallyInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "INVALID_INPUT",
          message: parsed.error.issues[0]?.message ?? "Invalid export parameters.",
        },
      };
    }

    const { eventId, format } = parsed.data;

    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        slug: true,
        startsAt: true,
        endsAt: true,
        organizerId: true,
      },
    });

    if (!event) {
      return {
        success: false,
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Election event not found.",
        },
      };
    }

    if (event.organizerId !== session.userId) {
      return {
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: "Only the designated election commissioner can certify and export official tallies.",
        },
      };
    }

    const now = new Date();
    if (now.getTime() < new Date(event.endsAt).getTime()) {
      return {
        success: false,
        data: null,
        error: {
          code: "POLL_NOT_CLOSED",
          message: "Results cannot be certified or exported while polls are still open.",
        },
      };
    }

    const [totalWhitelistedVoters, recordedParticipations] = await Promise.all([
      db.studentRosterEntry.count({
        where: { eventId: event.id },
      }),
      db.voterParticipation.count({
        where: { eventId: event.id },
      }),
    ]);

    const turnout = computeTurnoutMetrics({
      totalWhitelistedVoters,
      recordedParticipations,
      endsAt: event.endsAt,
      now,
    });

    const positions = await db.eventPosition.findMany({
      where: { eventId: event.id },
      orderBy: { displayOrder: "asc" },
      include: {
        contestants: {
          select: {
            id: true,
            name: true,
            contestantNumber: true,
            avatarUrl: true,
          },
        },
      },
    });

    const ballotSelections = await db.ballotSelection.findMany({
      where: { eventId: event.id },
      select: {
        officeId: true,
        candidateId: true,
      },
    });

    const offices = computeOfficeTallies(positions, ballotSelections);
    const certifiedAt = now.toISOString();
    const certifiedBy = session.email ?? session.userId;

    const preliminaryAudit: Omit<CertifiedElectionAuditDto, "auditHash"> = {
      eventId: event.id,
      eventTitle: event.title,
      eventSlug: event.slug,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      certifiedAt,
      certifiedBy,
      turnout,
      offices,
    };

    const auditHash = generateAuditHash(preliminaryAudit);
    const fullAudit: CertifiedElectionAuditDto = {
      ...preliminaryAudit,
      auditHash,
    };

    let content: string;
    let filename: string;

    if (format === "csv") {
      content = formatAuditCsv(fullAudit);
      filename = `certified-election-audit-${event.slug}-${now.getTime()}.csv`;
    } else {
      content = JSON.stringify(fullAudit, null, 2);
      filename = `certified-election-audit-${event.slug}-${now.getTime()}.json`;
    }

    return {
      success: true,
      data: {
        filename,
        content,
        format,
        auditHash,
        certifiedAt,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to certify and export election tally.";
    return {
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message,
      },
    };
  }
}
