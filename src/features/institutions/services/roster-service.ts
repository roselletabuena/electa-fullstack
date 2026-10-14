import crypto from "node:crypto";
import { db } from "@/lib/db";
import { studentRosterRowSchema } from "@/lib/validations/roster";
import type {
  IngestRosterOptions,
  ParseRosterCsvResult,
  RosterUploadSummary,
  VoterEligibilityResult,
  EventRosterStatusDto,
} from "../types/roster";
import type { StudentRosterRow } from "@/lib/validations/roster";

/**
 * Deterministically hashes a raw student ID with SHA-256 for privacy-preserving storage and indexing.
 */
export function hashStudentId(studentId: string): string {
  const normalized = studentId.trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Parses a single CSV line into tokens, respecting double-quoted values containing commas.
 */
function parseCsvLine(line: string): string[] {
  const tokens: string[] = [];
  let currentToken = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      tokens.push(currentToken.trim());
      currentToken = "";
    } else {
      currentToken += char;
    }
  }

  tokens.push(currentToken.trim());
  return tokens;
}

const STUDENT_ID_HEADER_ALIASES = new Set([
  "studentid",
  "student_id",
  "id_number",
  "idnumber",
  "student_no",
  "studentno",
  "student_number",
  "id",
]);

const EMAIL_HEADER_ALIASES = new Set([
  "email",
  "student_email",
  "studentemail",
  "mail",
  "institutional_email",
]);

export class MalformedRosterCsvError extends Error {
  public readonly missingHeaders: string[];

  constructor(message: string, missingHeaders: string[]) {
    super(message);
    this.name = "MalformedRosterCsvError";
    this.missingHeaders = missingHeaders;
  }
}

function resolveHeaderIndices(headerLine: string): { studentIdIndex: number; emailIndex: number } {
  const headers = parseCsvLine(headerLine).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9_]/g, "")
  );

  let studentIdIndex = -1;
  let emailIndex = -1;

  for (const [i, header] of headers.entries()) {
    if (header && studentIdIndex === -1 && STUDENT_ID_HEADER_ALIASES.has(header)) {
      studentIdIndex = i;
    }
    if (header && emailIndex === -1 && EMAIL_HEADER_ALIASES.has(header)) {
      emailIndex = i;
    }
  }

  const missing: string[] = [];
  if (studentIdIndex === -1) missing.push("studentId");
  if (emailIndex === -1) missing.push("email");

  if (missing.length > 0) {
    throw new MalformedRosterCsvError(
      `CSV is missing required headers: ${missing.join(", ")}. Found headers: ${headers.join(", ")}`,
      missing
    );
  }

  return { studentIdIndex, emailIndex };
}

function parseRosterRows(
  lines: string[],
  studentIdIndex: number,
  emailIndex: number
): { entries: StudentRosterRow[]; duplicateCount: number; skippedCount: number } {
  const seenStudentIds = new Set<string>();
  const seenEmails = new Set<string>();
  const entries: StudentRosterRow[] = [];
  let duplicateCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const rowTokens = parseCsvLine(line);
    const rawStudentId = rowTokens[studentIdIndex] ?? "";
    const rawEmail = rowTokens[emailIndex] ?? "";

    const validation = studentRosterRowSchema.safeParse({
      studentId: rawStudentId,
      email: rawEmail,
    });

    if (!validation.success) {
      skippedCount++;
      continue;
    }

    const { studentId, email } = validation.data;
    const normalizedEmail = email.toLowerCase();
    const idKey = studentId.toLowerCase();

    if (seenStudentIds.has(idKey) || seenEmails.has(normalizedEmail)) {
      duplicateCount++;
      continue;
    }

    seenStudentIds.add(idKey);
    seenEmails.add(normalizedEmail);
    entries.push({ studentId, email: normalizedEmail });
  }

  return { entries, duplicateCount, skippedCount };
}

/**
 * Parses a CSV string or buffer into validated student roster entries.
 * Ensures required headers exist and deduplicates within the upload.
 */
export function parseRosterCsv(csvContent: string | Buffer): ParseRosterCsvResult {
  const content = typeof csvContent === "string" ? csvContent : csvContent.toString("utf-8");
  const rawLines = content.split(/\r?\n/);
  const lines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new MalformedRosterCsvError("CSV file is empty", ["studentId", "email"]);
  }

  const headerLine = lines[0];
  if (!headerLine) {
    throw new MalformedRosterCsvError("CSV header row missing", ["studentId", "email"]);
  }

  const { studentIdIndex, emailIndex } = resolveHeaderIndices(headerLine);
  const { entries, duplicateCount, skippedCount } = parseRosterRows(lines, studentIdIndex, emailIndex);

  return {
    entries,
    totalLines: lines.length - 1,
    duplicateCount,
    skippedCount,
  };
}

/**
 * Ingests a CSV roster into the database atomically.
 * Default behavior replaces any existing roster for the specified event.
 */
export async function ingestRosterCsv({
  eventId,
  csvContent,
  batchSize = 1000,
  replace = true,
}: IngestRosterOptions): Promise<RosterUploadSummary> {
  const startTime = Date.now();
  const parsed = parseRosterCsv(csvContent);

  const normalizedEntries = parsed.entries.map((entry) => ({
    eventId,
    studentIdHash: hashStudentId(entry.studentId),
    email: entry.email,
  }));

  await db.$transaction(async (tx) => {
    if (replace) {
      await tx.studentRosterEntry.deleteMany({
        where: { eventId },
      });
    }

    for (let i = 0; i < normalizedEntries.length; i += batchSize) {
      const batch = normalizedEntries.slice(i, i + batchSize);
      await tx.studentRosterEntry.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
  });

  const durationMs = Date.now() - startTime;

  return {
    totalProcessed: parsed.totalLines,
    totalIngested: normalizedEntries.length,
    totalDuplicatesSkipped: parsed.duplicateCount,
    durationMs,
  };
}

/**
 * Evaluates whether a voter identity is eligible under the event's institutional roster policy.
 * Applies the Hybrid OR rule:
 * 1. Matches approved institutional email domains, OR
 * 2. Matches an uploaded student roster entry by hashed studentId, OR
 * 3. Matches an uploaded student roster entry by email.
 */
export async function verifyVoterEligibility({
  eventId,
  studentId,
  email,
}: {
  eventId: string;
  studentId?: string | undefined;
  email?: string | undefined;
}): Promise<VoterEligibilityResult> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      allowedEmailDomains: true,
    },
  });

  if (!event) {
    return {
      isEligible: false,
      matchType: "NONE",
      reason: "Event not found",
    };
  }

  // 1. Check email domain whitelist
  if (email && event.allowedEmailDomains.length > 0) {
    const parts = email.trim().toLowerCase().split("@");
    const domain = parts[1];

    if (domain) {
      const isDomainAllowed = event.allowedEmailDomains.some((d) => {
        const cleanDomain = d.startsWith("@") ? d.slice(1).toLowerCase() : d.toLowerCase();
        return domain === cleanDomain || domain.endsWith(`.${cleanDomain}`);
      });

      if (isDomainAllowed) {
        return {
          isEligible: true,
          matchType: "EMAIL_DOMAIN",
        };
      }
    }
  }

  // 2. Check roster by hashed studentId
  if (studentId) {
    const hashed = hashStudentId(studentId);
    const rosterById = await db.studentRosterEntry.findFirst({
      where: {
        eventId,
        studentIdHash: hashed,
      },
      select: { id: true },
    });

    if (rosterById) {
      return {
        isEligible: true,
        matchType: "ROSTER_STUDENT_ID",
      };
    }
  }

  // 3. Check roster by email
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const rosterByEmail = await db.studentRosterEntry.findFirst({
      where: {
        eventId,
        email: normalizedEmail,
      },
      select: { id: true },
    });

    if (rosterByEmail) {
      return {
        isEligible: true,
        matchType: "ROSTER_EMAIL",
      };
    }
  }

  return {
    isEligible: false,
    matchType: "NONE",
    reason: "Voter identity not found in institutional roster or authorized domains",
  };
}

/**
 * Updates an event's allowed email domains.
 */
export async function updateEventAllowedDomains({
  eventId,
  domains,
}: {
  eventId: string;
  domains: string[];
}): Promise<string[]> {
  const normalized = domains
    .map((d) => (d.startsWith("@") ? d.slice(1).toLowerCase().trim() : d.toLowerCase().trim()))
    .filter((d) => d.length > 0);

  const updated = await db.event.update({
    where: { id: eventId },
    data: {
      allowedEmailDomains: normalized,
    },
    select: {
      allowedEmailDomains: true,
    },
  });

  return updated.allowedEmailDomains;
}

/**
 * Retrieves the roster summary status for an event.
 */
export async function getEventRosterStatus(eventId: string): Promise<EventRosterStatusDto | null> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      allowedEmailDomains: true,
    },
  });

  if (!event) return null;

  const [totalStudents, latestEntry] = await Promise.all([
    db.studentRosterEntry.count({
      where: { eventId },
    }),
    db.studentRosterEntry.findFirst({
      where: { eventId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  return {
    eventId: event.id,
    totalStudents,
    allowedEmailDomains: event.allowedEmailDomains,
    hasRoster: totalStudents > 0,
    lastUpdated: latestEntry?.updatedAt ? latestEntry.updatedAt.toISOString() : null,
  };
}
