import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/events/[slug]/roster/route";
import * as ownershipGuard from "@/features/events/utils/ownership-guard";
import * as rosterService from "@/features/institutions/services/roster-service";

vi.mock("@/features/events/utils/ownership-guard", () => ({
  requireEventOwnership: vi.fn(),
}));

vi.mock("@/features/institutions/services/roster-service", () => ({
  ingestRosterCsv: vi.fn(),
  updateEventAllowedDomains: vi.fn(),
  getEventRosterStatus: vi.fn(),
  MalformedRosterCsvError: class MalformedRosterCsvError extends Error {
    public missingHeaders: string[];
    constructor(message: string, missingHeaders: string[]) {
      super(message);
      this.name = "MalformedRosterCsvError";
      this.missingHeaders = missingHeaders;
    }
  },
}));

describe("POST & GET /api/events/[slug]/roster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSlug = "university-election-2026";
  const mockContext = {
    params: Promise.resolve({ slug: mockSlug }),
  };
  const mockAuthorizedEvent = {
    authorized: true as const,
    userId: "organizer-1",
    event: {
      id: "event-uuid-1234",
      organizerId: "organizer-1",
      allowedEmailDomains: ["school.edu"],
    },
  };

  describe("GET", () => {
    it("returns 401 if unauthenticated", async () => {
      vi.mocked(ownershipGuard.requireEventOwnership).mockResolvedValueOnce({
        authorized: false,
        reason: "UNAUTHENTICATED",
      });

      const req = new NextRequest("http://localhost:3000/api/events/test/roster");
      const res = await GET(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Authentication required");
    });

    it("returns 403 if unauthorized organizer", async () => {
      vi.mocked(ownershipGuard.requireEventOwnership).mockResolvedValueOnce({
        authorized: false,
        reason: "UNAUTHORIZED",
        session: { userId: "other-user", email: "other@domain.com" },
        eventTitle: "Test Event",
      });

      const req = new NextRequest("http://localhost:3000/api/events/test/roster");
      const res = await GET(req, mockContext);

      expect(res.status).toBe(403);
    });

    it("returns 200 with roster status on success", async () => {
      vi.mocked(ownershipGuard.requireEventOwnership).mockResolvedValueOnce(
        mockAuthorizedEvent as any
      );
      vi.mocked(rosterService.getEventRosterStatus).mockResolvedValueOnce({
        eventId: "event-uuid-1234",
        totalStudents: 42,
        allowedEmailDomains: ["school.edu"],
        hasRoster: true,
        lastUpdated: "2026-10-14T00:00:00.000Z",
      });

      const req = new NextRequest("http://localhost:3000/api/events/test/roster");
      const res = await GET(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.totalStudents).toBe(42);
    });
  });

  describe("POST", () => {
    it("returns 422 if CSV is missing required headers", async () => {
      vi.mocked(ownershipGuard.requireEventOwnership).mockResolvedValueOnce(
        mockAuthorizedEvent as any
      );
      vi.mocked(rosterService.ingestRosterCsv).mockRejectedValueOnce(
        new (rosterService.MalformedRosterCsvError as any)(
          "CSV is missing required headers: studentId, email",
          ["studentId", "email"]
        )
      );

      const req = new NextRequest("http://localhost:3000/api/events/test/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: "name,phone\nAlice,12345" }),
      });

      const res = await POST(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.success).toBe(false);
      expect(json.error).toContain("missing required headers");
    });

    it("returns 200 on valid CSV upload and domain configuration", async () => {
      vi.mocked(ownershipGuard.requireEventOwnership).mockResolvedValueOnce(
        mockAuthorizedEvent as any
      );
      vi.mocked(rosterService.ingestRosterCsv).mockResolvedValueOnce({
        totalProcessed: 2,
        totalIngested: 2,
        totalDuplicatesSkipped: 0,
        durationMs: 15,
      });
      vi.mocked(rosterService.updateEventAllowedDomains).mockResolvedValueOnce(["up.edu.ph"]);

      const req = new NextRequest("http://localhost:3000/api/events/test/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent: "studentId,email\nS1,s1@up.edu.ph\nS2,s2@up.edu.ph",
          domains: ["@up.edu.ph"],
        }),
      });

      const res = await POST(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.rosterSummary.totalIngested).toBe(2);
      expect(json.data.allowedEmailDomains).toEqual(["up.edu.ph"]);
    });

    it("returns 400 if neither CSV nor domains are provided", async () => {
      vi.mocked(ownershipGuard.requireEventOwnership).mockResolvedValueOnce(
        mockAuthorizedEvent as any
      );

      const req = new NextRequest("http://localhost:3000/api/events/test/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await POST(req, mockContext);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });
});
